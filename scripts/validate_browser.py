#!/usr/bin/env python3
from __future__ import annotations

import asyncio
import math
from pathlib import Path

from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parents[1]
STANDALONE = ROOT / "econlab-101-v0.6-standalone.html"


def point_line_distance(px: float, py: float, x1: float, y1: float, x2: float, y2: float) -> float:
    numerator = abs((y2 - y1) * px - (x2 - x1) * py + x2 * y1 - y2 * x1)
    denominator = math.hypot(y2 - y1, x2 - x1)
    return numerator / denominator


async def main() -> None:
    html = STANDALONE.read_text(encoding="utf-8")
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True,
            executable_path="/usr/bin/chromium",
            args=["--no-sandbox"],
        )
        page = await browser.new_page(viewport={"width": 1440, "height": 1000})
        errors: list[str] = []
        page.on("pageerror", lambda error: errors.append(str(error)))
        await page.set_content(html, wait_until="domcontentloaded")
        await page.wait_for_timeout(1200)

        assert await page.locator("#chapterTabs button").count() == 3
        assert not errors, errors

        # CH03: the PPF choice point must move between two seeks.
        frame03 = page.frames[1]
        assert await frame03.evaluate("window.__renderReady === true")
        await frame03.evaluate("window.renderSeek(132)")
        p1 = await frame03.locator("#choiceDot").evaluate("e => [Number(e.getAttribute('cx')), Number(e.getAttribute('cy'))]")
        await frame03.evaluate("window.renderSeek(177)")
        p2 = await frame03.locator("#choiceDot").evaluate("e => [Number(e.getAttribute('cx')), Number(e.getAttribute('cy'))]")
        assert p1 != p2, (p1, p2)

        # CH04: after the demand shift, the marker must lie on the active new line.
        await page.locator("#chapterTabs button").nth(1).click()
        await page.wait_for_timeout(800)
        frame04 = page.frames[1]
        assert await frame04.evaluate("window.__renderReady === true")
        await frame04.evaluate("window.renderSeek(178)")
        line = await frame04.locator("#newDemandLine").evaluate(
            "e => ['x1','y1','x2','y2'].map(k => Number(e.getAttribute(k)))"
        )
        marker = await frame04.locator("#shiftPoint").evaluate(
            "e => [Number(e.getAttribute('cx')), Number(e.getAttribute('cy'))]"
        )
        distance = point_line_distance(marker[0], marker[1], *line)
        assert distance < 0.75, {"marker": marker, "line": line, "distance": distance}

        # CH19: energy particles and cost waves must change position/scale over time.
        await page.locator("#chapterTabs button").nth(2).click()
        await page.wait_for_timeout(800)
        frame19 = page.frames[1]
        assert await frame19.evaluate("window.__renderReady === true")
        await frame19.evaluate("window.renderSeek(214)")
        e1 = await frame19.locator(".energy").first.evaluate("e => e.style.transform")
        w1 = await frame19.locator("#wave1").evaluate("e => [e.style.transform,e.style.opacity]")
        await frame19.evaluate("window.renderSeek(248)")
        e2 = await frame19.locator(".energy").first.evaluate("e => e.style.transform")
        w2 = await frame19.locator("#wave1").evaluate("e => [e.style.transform,e.style.opacity]")
        assert e1 != e2, (e1, e2)
        assert w1 != w2, (w1, w2)

        # Mobile uses the same chapter data, iframe composition and exercises.
        await page.set_viewport_size({"width": 390, "height": 844})
        await page.wait_for_timeout(300)
        body_width = await page.locator("body").evaluate("e => e.scrollWidth")
        assert body_width <= 390, body_width
        assert await page.locator(".question-card").count() == 6
        assert not errors, errors
        await browser.close()

    print("browser validation: PASS")


if __name__ == "__main__":
    asyncio.run(main())
