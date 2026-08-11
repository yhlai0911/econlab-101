#!/usr/bin/env python3
"""Generate scene-level Taiwanese Mandarin narration with Gemini 3.1 Flash TTS.

Uses the official Gemini Interactions API. Each storyboard scene is generated
separately to reduce long-form voice drift, then time-fitted and assembled by
FFmpeg. Set GEMINI_API_KEY before running.
"""
from __future__ import annotations

import argparse
import base64
import json
import os
import subprocess
import time
import wave
from pathlib import Path

from google import genai


def duration(path: Path) -> float:
    out = subprocess.check_output(
        [
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "default=nw=1:nk=1",
            str(path),
        ],
        text=True,
    )
    return float(out.strip())


def write_pcm_wav(path: Path, pcm: bytes, *, rate: int = 24000) -> None:
    with wave.open(str(path), "wb") as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(rate)
        wav.writeframes(pcm)


def atempo_chain(ratio: float) -> str:
    parts: list[str] = []
    while ratio < 0.5:
        parts.append("atempo=0.5")
        ratio /= 0.5
    while ratio > 100:
        parts.append("atempo=100")
        ratio /= 100
    parts.append(f"atempo={ratio:.8f}")
    return ",".join(parts)


def synthesize_with_retry(client, *, model: str, voice: str, prompt: str, attempts: int = 4) -> bytes:
    last_error: Exception | None = None
    for attempt in range(1, attempts + 1):
        try:
            interaction = client.interactions.create(
                model=model,
                input=prompt,
                response_format={"type": "audio"},
                generation_config={"speech_config": [{"voice": voice}]},
            )
            if not interaction.output_audio or not interaction.output_audio.data:
                raise RuntimeError("Gemini TTS returned no audio")
            return base64.b64decode(interaction.output_audio.data)
        except Exception as exc:  # Preview models can occasionally return transient 5xx errors.
            last_error = exc
            if attempt == attempts:
                break
            time.sleep(2**attempt)
    raise RuntimeError(f"Gemini TTS failed after {attempts} attempts") from last_error


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("lesson", type=Path)
    parser.add_argument("--model", default=os.getenv("GEMINI_TTS_MODEL", "gemini-3.1-flash-tts-preview"))
    parser.add_argument("--voice", default=os.getenv("GEMINI_TTS_VOICE", "Kore"))
    args = parser.parse_args()

    if not os.getenv("GEMINI_API_KEY"):
        raise SystemExit("GEMINI_API_KEY is required")

    story = json.loads((args.lesson / "storyboard.json").read_text(encoding="utf-8"))
    client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
    out_dir = args.lesson / "audio" / "voice"
    out_dir.mkdir(parents=True, exist_ok=True)
    report: list[dict[str, float | str]] = []

    director = (
        "Synthesize the following transcript exactly as spoken narration. "
        "Use natural Taiwan Mandarin. The speaker is a warm, intellectually serious "
        "university economics teacher: conversational, clear, never childish or like an advertisement. "
        "Use moderate pacing, short reasoning pauses, and slow down for numbers, formulas, and contrasts "
        "such as 需求 versus 需求量, 機會成本, 總合需求, and 短期總合供給. "
        "Do not read these director notes aloud.\n\n--- TRANSCRIPT START ---\n"
    )

    for scene in story["scenes"]:
        transcript = (args.lesson / scene["transcript"]).read_text(encoding="utf-8").strip()
        raw = out_dir / f"{scene['id']}.raw.wav"
        fitted = out_dir / f"{scene['id']}.wav"
        pcm = synthesize_with_retry(
            client,
            model=args.model,
            voice=args.voice,
            prompt=director + transcript + "\n--- TRANSCRIPT END ---",
        )
        write_pcm_wav(raw, pcm)

        raw_duration = duration(raw)
        target = max(3.0, float(scene["duration"]) - 2.0)
        ratio = raw_duration / target
        subprocess.run(
            [
                "ffmpeg",
                "-y",
                "-hide_banner",
                "-loglevel",
                "error",
                "-i",
                str(raw),
                "-af",
                f"{atempo_chain(ratio)},loudnorm=I=-16:TP=-1.5:LRA=8",
                "-ar",
                "24000",
                "-ac",
                "1",
                str(fitted),
            ],
            check=True,
        )
        report.append(
            {
                "scene": scene["id"],
                "raw_seconds": round(raw_duration, 3),
                "target_seconds": round(target, 3),
                "model": args.model,
                "voice": args.voice,
            }
        )
        raw.unlink(missing_ok=True)
        print(scene["id"], f"{raw_duration:.1f}s -> {target:.1f}s")

    inputs: list[str] = []
    filters: list[str] = []
    labels: list[str] = []
    for index, scene in enumerate(story["scenes"]):
        path = out_dir / f"{scene['id']}.wav"
        inputs += ["-i", str(path)]
        delay = int(round((float(scene["start"]) + 1.0) * 1000))
        filters.append(f"[{index}:a]adelay={delay}|{delay}[a{index}]")
        labels.append(f"[a{index}]")
    total = float(story["duration"])
    filters.append(
        f"{''.join(labels)}amix=inputs={len(labels)}:normalize=0,apad=whole_dur={total}[voice]"
    )
    narration = args.lesson / "audio" / "narration.wav"
    subprocess.run(
        [
            "ffmpeg",
            "-y",
            *inputs,
            "-filter_complex",
            ";".join(filters),
            "-map",
            "[voice]",
            "-t",
            str(total),
            "-ar",
            "24000",
            "-ac",
            "1",
            str(narration),
        ],
        check=True,
    )
    (out_dir / "generation-report.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(narration)


if __name__ == "__main__":
    main()
