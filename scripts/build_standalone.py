#!/usr/bin/env python3
from __future__ import annotations

import base64
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "econlab-101-v0.6-standalone.html"


def inline_composition(path: Path) -> str:
    html = path.read_text(encoding="utf-8")
    css = (ROOT / "assets/composition.css").read_text(encoding="utf-8")
    runtime = (ROOT / "assets/animation-runtime.js").read_text(encoding="utf-8")
    html = html.replace(
        '<link rel="stylesheet" href="../../../assets/composition.css">',
        f"<style>\n{css}\n</style>",
    )
    html = html.replace(
        '<script src="../../../assets/animation-runtime.js"></script>',
        f"<script>\n{runtime}\n</script>",
    )
    return html


def main() -> None:
    index = (ROOT / "index.html").read_text(encoding="utf-8")
    platform_css = (ROOT / "assets/platform.css").read_text(encoding="utf-8")
    chapter_data = (ROOT / "js/chapter-data.js").read_text(encoding="utf-8")
    platform_js = (ROOT / "js/platform.js").read_text(encoding="utf-8")

    compositions = {
        "ch03": base64.b64encode(inline_composition(ROOT / "media/ch03-opportunity-cost/composition/index.html").encode("utf-8")).decode("ascii"),
        "ch04": base64.b64encode(inline_composition(ROOT / "media/ch04-market-clearing/composition/index.html").encode("utf-8")).decode("ascii"),
        "ch19": base64.b64encode(inline_composition(ROOT / "media/ch19-stagflation/composition/index.html").encode("utf-8")).decode("ascii"),
    }
    blob_bootstrap = (
        "const __ECON_COMPOSITIONS="
        + json.dumps(compositions)
        + ";Object.entries(__ECON_COMPOSITIONS).forEach(([id,b64])=>{"
        + "const bin=atob(b64),bytes=Uint8Array.from(bin,c=>c.charCodeAt(0));"
        + "const html=new TextDecoder().decode(bytes);"
        + "window.ECON_CHAPTERS[id].animation=URL.createObjectURL(new Blob([html],{type:'text/html'}));"
        + "});"
    )

    index = index.replace(
        '<link rel="stylesheet" href="assets/platform.css">',
        f"<style>\n{platform_css}\n</style>",
    )
    index = index.replace(
        '<script src="js/chapter-data.js"></script><script src="js/platform.js"></script>',
        f"<script>\n{chapter_data}\n</script><script>\n{blob_bootstrap}\n</script><script>\n{platform_js}\n</script>",
    )
    index = index.replace(
        "</head>",
        '<meta name="econlab-build" content="v0.6-standalone">\n</head>',
    )
    OUT.write_text(index, encoding="utf-8")
    print(OUT)
    print(f"bytes={OUT.stat().st_size}")


if __name__ == "__main__":
    main()
