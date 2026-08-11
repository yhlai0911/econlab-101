# EconLab 101 v0.6｜三種章節動畫 MVP

以 Bade／Parkin《基礎經濟學》中文第三版為課程導航，驗證三種完全不同的經濟學知識，是否能由同一個 open-course 平台承載：

| MVP | 教學型態 | 真正運動的機制 |
|---|---|---|
| CH03 經濟問題 | 概念選擇型 | 人物移動、時間籌碼配置、PPF 點與交換商品 |
| CH04 需求與供給 | 微觀市場型 | 買家人流、票券、競價、容量與供需曲線 |
| CH19 總合供給與總合需求 | 總體系統型 | C／I／G／NX 支出流、能源粒子、成本波與政策時滯 |

這裡的「動畫」不是文字飛入或圖表淡入，而是角色、物件和經濟狀態由同一組方程式及時間軸驅動。即使關閉語音，畫面本身仍能呈現因果機制。

## 直接體驗

最方便的方式是開啟：

```text
econlab-101-v0.6-standalone.html
```

它是單一 HTML，已內嵌平台、三章教材與三個動畫 composition。

完整專案也可由靜態伺服器啟動：

```bash
python3 -m http.server 4173
```

再開啟：

```text
http://localhost:4173
```

## 每章 MVP 已包含

- 左文右動畫的互動書頁；手機沿用相同內容與順序。
- 5–7 分鐘可播放、暫停、倒帶、調速與精準 seek 的動畫 composition。
- 3 個概念展頁與展頁內立即應用題。
- 一個可由學生自行控制的經濟模型。
- 6 題核心練習與 8 題章末遷移題。
- 分場旁白稿、分鏡、BGM prompt 與 media manifest。
- Gemini 3.1 Flash TTS、Lyria 3、FFmpeg 與 HyperFrames 的自動化腳本。

## 動畫驗收標準

一個 composition 只有在符合以下條件時，才算「真正動畫」：

1. 角色或物件具有位置、方向、數量或狀態變化。
2. 動畫的狀態由經濟模型或情境參數產生。
3. 任意時間點可 deterministic seek，適合逐幀渲染。
4. 暫停與倒帶後，圖形、數值、人物與字幕仍一致。
5. 關閉旁白後，視覺仍能傳達主要因果關係。
6. 文字只作標示與解釋，不是主要運動畫面。

## 驗證

```bash
python scripts/build_standalone.py
python -m unittest discover -s tests -v
python scripts/validate_browser.py
```

目前自動驗證包含：

- 三種動畫型態與 5–10 分鐘長度。
- 分鏡時間連續性與旁白稿完整性。
- 動畫中真正存在可移動人物、物件與系統流。
- CH04 需求曲線平行移動後，價格點位於目前生效的新曲線。
- CH03 PPF 點隨選擇改變。
- CH19 能源粒子與成本波隨時間改變。
- 桌面與 390px 手機版無水平溢出。
- 三章題庫、模型及單檔 build 完整性。

## 影音製作管線

### 1. Gemini 3.1 Flash TTS

```bash
pip install -r requirements-media.txt
export GEMINI_API_KEY=...
python scripts/generate_tts.py media/ch04-market-clearing
```

旁白以 scene 為單位生成，以避免長音訊的音色漂移；再由 FFmpeg 依 storyboard 時間組合。

### 2. Lyria 3 BGM

```bash
python scripts/generate_bgm.py media/ch04-market-clearing
```

BGM 與旁白分離保存，平台未來可提供「旁白＋BGM／僅旁白／無聲字幕」切換。

### 3. 混音

```bash
python scripts/mix_audio.py media/ch04-market-clearing
```

FFmpeg 以 sidechain compression 在旁白出現時降低背景音樂。

### 4. HyperFrames

```bash
bash scripts/render_hyperframes.sh media/ch04-market-clearing
```

composition 也直接提供 `window.renderSeek(seconds)`，因此可由 HyperFrames 或其他免費逐幀擷取器渲染。若目前環境不能連線安裝 npm 套件，仍可用本專案的 Playwright＋FFmpeg deterministic renderer 驗證動畫。

## 目前沒有假裝完成的部分

- repository 中尚未包含 Gemini TTS 實際生成的旁白音檔。
- repository 中尚未包含 Lyria 實際生成的 BGM。
- 原因是本次執行環境沒有使用者的 `GEMINI_API_KEY`，也不應把金鑰寫入程式庫。
- 已完成旁白稿、分鏡、prompt、API adapter、混音與渲染腳本；取得合法憑證後即可逐章生成。
- 短 MP4 proof clips 是由 deterministic composition 逐幀輸出，只用來證明物件與機制確實運動，不是正式 5–7 分鐘成品。

## 專案結構

```text
.
├── index.html
├── econlab-101-v0.6-standalone.html
├── assets/
│   ├── platform.css
│   ├── composition.css
│   └── animation-runtime.js
├── js/
│   ├── chapter-data.js
│   └── platform.js
├── media/
│   ├── ch03-opportunity-cost/
│   ├── ch04-market-clearing/
│   ├── ch19-stagflation/
│   └── video-manifest.json
├── scripts/
│   ├── build_standalone.py
│   ├── generate_tts.py
│   ├── generate_bgm.py
│   ├── mix_audio.py
│   ├── render_hyperframes.sh
│   ├── render_proof_clips.py
│   └── validate_browser.py
├── tests/
│   └── test_project.py
└── docs/
    ├── animation-architecture.md
    └── media-pipeline.md
```

## 內容治理

公開 MVP 的文字、圖形、動畫、練習與 PBL 均為原創。Bade／Parkin 教科書與出版社教學配件只作章節 coverage、術語與教師備課對照，未將原書頁面、原圖、題庫或解答公開納入。

## 授權

- 程式碼：MIT License。
- 原創教材內容：CC BY-NC-SA 4.0。
- 第三方與未來 OER：依個別學習物件標示。
