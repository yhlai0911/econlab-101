# Gemini TTS、Lyria 與 HyperFrames 管線

## 輸入

每支動畫目錄包含：

```text
storyboard.json
bgm-prompt.txt
audio/voice/s1.txt ...
composition/index.html
```

`storyboard.json` 是時間與場景的單一來源，旁白、字幕、音效、動畫與問題停點都應以它對齊。

## Gemini 3.1 Flash TTS

`scripts/generate_tts.py`：

1. 逐 scene 呼叫 Gemini Interactions API；
2. 使用清楚的 Audio Profile、Director Notes 與 Transcript 邊界；
3. 將 raw PCM 寫成 24kHz mono WAV；
4. 對 preview 模型的偶發錯誤做指數退避重試；
5. 以 FFmpeg 對齊 scene 時槽並正規化；
6. 組成完整 `narration.wav`。

不應一次生成 5–10 分鐘旁白，因為長輸出較可能出現音色與品質漂移。

## Lyria 3

`scripts/generate_bgm.py`：

1. 以 `lyria-3-clip-preview` 生成數個 30 秒 instrumental clip；
2. 保存實際音訊，不假設相同 prompt 可重建完全相同結果；
3. 以 FFmpeg crossfade；
4. loop 至章節長度；
5. 保持低音量，預留台灣華語旁白的頻譜空間。

## 混音

`scripts/mix_audio.py` 使用：

- high-pass／low-pass 清理 BGM；
- sidechain compression 讓旁白出現時 BGM 自動下降；
- loudness normalization；
- AAC 輸出。

## HyperFrames 與替代 renderer

`scripts/render_hyperframes.sh` 會先 lint，再由 HyperFrames CLI 逐幀渲染。composition 同時符合本地 deterministic seek protocol，因此即使 npm 無法安裝，也可由 Playwright＋FFmpeg 逐幀輸出。

正式發布至少應產生：

```text
video-16x9.mp4
video-9x16.mp4
poster.webp
captions.zh-TW.vtt
chapters.vtt
transcript.json
checkpoints.json
provenance.json
```

v0.6 先完成 16:9 composition、逐字稿、分鏡、API adapter 及無音訊 proof clips；實際 TTS／BGM 須由使用者憑證生成。
