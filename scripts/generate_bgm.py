#!/usr/bin/env python3
"""Generate low-density instrumental lesson beds with Lyria 3 Clip.

Requires GEMINI_API_KEY. Lyria output remains separate so learners can disable
BGM while retaining narration.
"""
from __future__ import annotations
import argparse, base64, json, os, subprocess
from pathlib import Path
from google import genai


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("lesson", type=Path)
    ap.add_argument("--clips", type=int, default=3)
    ap.add_argument("--model", default=os.getenv("LYRIA_MODEL", "lyria-3-clip-preview"))
    args = ap.parse_args()
    if not os.getenv("GEMINI_API_KEY"):
        raise SystemExit("GEMINI_API_KEY is required")
    story = json.loads((args.lesson / "storyboard.json").read_text(encoding="utf-8"))
    prompt = (args.lesson / "bgm-prompt.txt").read_text(encoding="utf-8").strip()
    client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
    out = args.lesson / "audio" / "music"
    out.mkdir(parents=True, exist_ok=True)
    clips = []
    for i in range(args.clips):
        interaction = client.interactions.create(
            model=args.model,
            input=prompt + f"\nVariation {i+1}: maintain the same palette but vary the sparse motif.",
            response_format={"type": "audio"},
        )
        if not interaction.output_audio:
            raise RuntimeError("Lyria returned no audio")
        path = out / f"lyria-{i:02d}.mp3"
        path.write_bytes(base64.b64decode(interaction.output_audio.data))
        clips.append(path)
        print(path)

    # Crossfade short clips, loop to lesson duration, and keep BGM quiet.
    cmd = ["ffmpeg", "-y"]
    for p in clips:
        cmd += ["-i", str(p)]
    if len(clips) == 1:
        graph = "[0:a]aresample=48000[m]"
    else:
        parts, previous = [], "0:a"
        for i in range(1, len(clips)):
            label = f"x{i}"
            parts.append(f"[{previous}][{i}:a]acrossfade=d=2:c1=tri:c2=tri[{label}]")
            previous = label
        graph = ";".join(parts) + f";[{previous}]aresample=48000[m]"
    stitched = out / "stitched.wav"
    subprocess.run(cmd + ["-filter_complex", graph, "-map", "[m]", str(stitched)], check=True)
    total = float(story["duration"])
    bgm = args.lesson / "audio" / "bgm.wav"
    subprocess.run([
        "ffmpeg", "-y", "-stream_loop", "-1", "-i", str(stitched), "-t", str(total),
        "-af", f"volume=-25dB,afade=t=in:st=0:d=2,afade=t=out:st={max(0,total-4)}:d=4",
        str(bgm)
    ], check=True)
    print(bgm)

if __name__ == "__main__":
    main()
