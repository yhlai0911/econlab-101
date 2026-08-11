from __future__ import annotations

import json
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class ProjectContentTests(unittest.TestCase):
    def test_three_distinct_animation_types(self) -> None:
        manifest = json.loads((ROOT / "media/video-manifest.json").read_text(encoding="utf-8"))
        items = manifest["animations"]
        self.assertEqual(len(items), 3)
        self.assertEqual(
            {item["type"] for item in items},
            {"concept-choice", "micro-mechanism", "macro-system"},
        )
        for item in items:
            self.assertGreaterEqual(item["duration"], 300)
            self.assertLessEqual(item["duration"], 600)
            self.assertEqual(item["status"], "composition-ready")
            self.assertTrue((ROOT / item["composition"]).exists())

    def test_storyboards_are_contiguous_and_have_voice_scripts(self) -> None:
        for path in sorted((ROOT / "media").glob("*/storyboard.json")):
            board = json.loads(path.read_text(encoding="utf-8"))
            scenes = board["scenes"]
            self.assertEqual(scenes[0]["start"], 0)
            self.assertEqual(scenes[-1]["end"], board["duration"])
            cursor = 0
            for scene in scenes:
                self.assertEqual(scene["start"], cursor)
                self.assertEqual(scene["duration"], scene["end"] - scene["start"])
                transcript = path.parent / scene["transcript"]
                self.assertTrue(transcript.exists(), transcript)
                self.assertGreater(len(transcript.read_text(encoding="utf-8").strip()), 40)
                cursor = scene["end"]

    def test_compositions_contain_real_moving_objects(self) -> None:
        expectations = {
            "ch03-opportunity-cost": [".student", ".token", ".crate", "choiceKnob", "choiceDot"],
            "ch04-market-clearing": [".fan", ".ticket", ".buyer", ".ticket-agent", "newDemandLine"],
            "ch19-stagflation": [".flow-dot", ".worker", ".energy", ".smoke", "policyClock"],
        }
        for animation_id, needles in expectations.items():
            text = (ROOT / f"media/{animation_id}/composition/index.html").read_text(encoding="utf-8")
            for needle in needles:
                self.assertIn(needle, text)
            self.assertGreaterEqual(text.count("A.setTransform"), 4)
            self.assertIn("A.create({", text)
            self.assertNotIn("contenteditable", text)

    def test_ch04_marker_uses_active_shifted_demand_curve(self) -> None:
        text = (ROOT / "media/ch04-market-clearing/composition/index.html").read_text(encoding="utf-8")
        self.assertIn("setLine(el.newD,segment(100+shift,-10))", text)
        self.assertIn("const shiftQ=qd(shiftPrice,shift)", text)
        self.assertIn("setAttr(el.shiftP,'cx',x(shiftQ))", text)
        self.assertIn("setAttr(el.shiftP,'cy',y(shiftPrice))", text)

    def test_question_banks_cover_each_chapter(self) -> None:
        text = (ROOT / "js/chapter-data.js").read_text(encoding="utf-8")
        for chapter in ("ch03", "ch04", "ch19"):
            block = re.search(rf"\b{chapter}:\s*\{{(.*?)(?=\n\s*\}},?\n\s*(?:ch\d+|\}};))", text, re.S)
            self.assertIsNotNone(block, chapter)
        self.assertEqual(len(re.findall(r"\bquick\s*:\s*\[", text)), 3)
        self.assertEqual(len(re.findall(r"\bfinal\s*:\s*\[", text)), 3)
        self.assertGreaterEqual(text.count("{q:"), 42)

    def test_standalone_build_exists(self) -> None:
        path = ROOT / "econlab-101-v0.6-standalone.html"
        self.assertTrue(path.exists())
        text = path.read_text(encoding="utf-8")
        self.assertIn('content="v0.6-standalone"', text)
        self.assertIn("__ECON_COMPOSITIONS", text)
        self.assertNotIn('src="assets/platform.css"', text)


if __name__ == "__main__":
    unittest.main(verbosity=2)
