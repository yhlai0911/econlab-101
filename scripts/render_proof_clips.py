#!/usr/bin/env python3
from __future__ import annotations

import asyncio
import shutil
import subprocess
from pathlib import Path

from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "previews"
TMP_ROOT = Path("/tmp/econlab-v06-proof")
FPS = 12
SECONDS = 8

CLIPS = [
    ("ch03-opportunity-cost", 124.0, 184.0),
    ("ch04-market-clearing", 132.0, 200.0),
    ("ch19-stagflation", 210.0, 268.0),
]


def inline_composition(animation_id: str) -> str:
    html = (ROOT / f"media/{animation_id}/composition/index.html").read_text(encoding="utf-8")
    css = (ROOT / "assets/composition.css").read_text(encoding="utf-8")
    runtime = (ROOT / "assets/animation-runtime.js").read_text(encoding="utf-8")
    html = html.replace(
        '<link rel="stylesheet" href="../../../assets/composition.css">',
        f"<style>{css}</style>",
    )
    html = html.replace(
        '<script src="../../../assets/animation-runtime.js"></script>',
        f"<script>{runtime}</script>",
    )
    return html


async def render_frames(page, animation_id: str, start: float, end: float) -> Path:
    frame_dir = TMP_ROOT / animation_id
    shutil.rmtree(frame_dir, ignore_errors=True)
    frame_dir.mkdir(parents=True)
    await page.set_content(inline_composition(animation_id), wait_until="domcontentloaded")
    await page.wait_for_function("window.__renderReady === true")
    total = FPS * SECONDS
    for index in range(total):
        progress = index / max(1, total - 1)
        time_value = start + (end - start) * progress
        await page.evaluate("time => window.renderSeek(time)", time_value)
        await page.screenshot(
            path=str(frame_dir / f"frame-{index:04d}.jpg"),
            type="jpeg",
            quality=91,
        )
    return frame_dir


def encode(animation_id: str, frame_dir: Path) -> Path:
    output = OUT_DIR / f"{animation_id}-proof.mp4"
    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-hide_banner",
            "-loglevel",
            "error",
            "-framerate",
            str(FPS),
            "-i",
            str(frame_dir / "frame-%04d.jpg"),
            "-c:v",
            "libx264",
            "-preset",
            "medium",
            "-crf",
            "20",
            "-pix_fmt",
            "yuv420p",
            "-movflags",
            "+faststart",
            str(output),
        ],
        check=True,
    )
    return output


async def main() -> None:
    OUT_DIR.mkdir(exist_ok=True)
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True,
            executable_path="/usr/bin/chromium",
            args=["--no-sandbox", "--disable-dev-shm-usage"],
        )
        for animation_id, start, end in CLIPS:
            page = await browser.new_page(viewport={"width": 1280, "height": 720})
            frames = await render_frames(page, animation_id, start, end)
            output = encode(animation_id, frames)
            print(output)
            await page.close()
        await browser.close()
    shutil.rmtree(TMP_ROOT, ignore_errors=True)


if __name__ == "__main__":
    asyncio.run(main())
