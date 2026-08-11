#!/usr/bin/env python3
from __future__ import annotations
import argparse, json, subprocess
from pathlib import Path


def main():
    ap=argparse.ArgumentParser();ap.add_argument('lesson',type=Path);args=ap.parse_args()
    story=json.loads((args.lesson/'storyboard.json').read_text(encoding='utf-8'))
    voice=args.lesson/'audio'/'narration.wav'; bgm=args.lesson/'audio'/'bgm.wav'; out=args.lesson/'audio'/'mixed.m4a'
    if not voice.exists(): raise SystemExit(f'missing {voice}')
    if not bgm.exists(): raise SystemExit(f'missing {bgm}')
    subprocess.run(['ffmpeg','-y','-i',str(voice),'-i',str(bgm),'-filter_complex',
      '[1:a]highpass=f=80,lowpass=f=9000[bg];[bg][0:a]sidechaincompress=threshold=0.025:ratio=10:attack=20:release=450[duck];[0:a][duck]amix=inputs=2:weights=1 0.55:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=9[m]',
      '-map','[m]','-t',str(story['duration']),'-c:a','aac','-b:a','192k',str(out)],check=True)
    print(out)
if __name__=='__main__':main()
