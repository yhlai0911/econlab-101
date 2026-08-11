# EconLab 101｜經濟決策實驗室

以 **Bade／Parkin《基礎經濟學》中文第三版**為課程導航，將傳統章節轉化為可直接授課、可自行學習、可操作模型、可完成 PBL 的互動式 open course。

本儲存庫是第一個垂直切片 MVP：

> **CH04 需求與供給｜演唱會票價危機**

學生先面對「官方低票價是否真的比較公平」的決策，再依序操作需求、供給、短缺、過剩與市場均衡，最後替虛構音樂祭設計票務制度並產生政策備忘錄。

![EconLab 101 MVP 桌面版預覽](docs/preview-desktop.png)

更多畫面：[`均衡實驗室`](docs/preview-equilibrium.png)｜[`手機版`](docs/preview-mobile.png)

## MVP 已包含

- **六幕式課程旅程**：決策現場、需求解碼、供給解碼、均衡實驗室、衝擊挑戰、PBL 政策室。
- **學生自學模式**：每幕約 5–10 分鐘，具預測、操作、立即回饋與進度保存。
- **教師授課模式**：全螢幕、課堂計時、場景切換、每幕教學目的、追問與常見迷思。
- **原創供需模型引擎**：價格、需求衝擊、供給衝擊、短缺、過剩與均衡同步更新。
- **迷思診斷**：區分需求／需求量、供給／供給量，以及曲線移動與沿曲線移動。
- **PBL 任務**：比較低價抽籤、動態定價、混合票制與會員優先制度。
- **PWA 基礎**：安裝到手機、核心檔案快取、離線後仍可開啟已載入內容。
- **響應式畫面**：桌面三欄授課介面、平板簡化版、手機底部旅程導覽。

## 立即執行

不需安裝前端套件。

```bash
npm run dev
```

瀏覽：

```text
http://localhost:4173
```

也可以直接使用零相依的 Node 靜態伺服器：

```bash
npm run serve
```

## 測試

```bash
npm test
npm run check
```

測試涵蓋需求與供給斜率、均衡、短缺、需求衝擊、供給衝擊，以及課程內容完整性。

## 部署

### GitHub Pages

儲存庫已包含 `.github/workflows/pages.yml`。在 GitHub 的 **Settings → Pages** 將來源設為 **GitHub Actions**，再手動執行 `Publish GitHub Pages` workflow 即可發布；MVP 預設不自動消耗 Actions。

### Zeabur／其他 Docker 平台

儲存庫已包含 `Dockerfile` 與 `nginx.conf`，直接以 GitHub 儲存庫建立服務即可。

## 內容與教科書的關係

平台以教科書章節作為**課程覆蓋與閱讀導航**，但不把出版社教師配件公開搬上網站。

公開 MVP 中的：

- 教學文字
- 情境與數值
- SVG 圖形
- 互動程式
- 練習題
- PBL 任務

均為原創示範。出版社投影片、教師題庫、習題解答與受保護圖片均未納入儲存庫。

詳見：

- [`docs/ch04-crosswalk.md`](docs/ch04-crosswalk.md)
- [`docs/content-governance.md`](docs/content-governance.md)
- [`CONTENT-LICENSE.md`](CONTENT-LICENSE.md)

## MVP 的誠實界線

目前的「班級回應」使用示範分布，用來驗證教師端畫面；尚未提供跨裝置即時聚合、學生登入、班級管理與教師分析。

下一階段預定接入 Supabase：

1. 匿名 QR 加入課堂。
2. 即時投票與班級答案分布。
3. 學生帳號、進度同步與作品集。
4. 教師迷思儀表板。
5. 結構化內容 CMS 與全 20 章 course map。

## 技術選擇

MVP 使用零前端相依套件的原生 HTML、CSS、ES Modules 與 SVG：

- 啟動快，適合教室網路環境。
- 可直接部署到 GitHub Pages。
- 經濟圖形由方程式生成，容易檢驗。
- 後續可保留內容與模型層，再遷移到 Next.js／Supabase。

## 儲存庫結構

```text
.
├── index.html
├── assets/
│   ├── styles.css
│   └── *.svg
├── data/
│   └── chapter04.js
├── js/
│   ├── app.js
│   └── market-model.js
├── tests/
├── docs/
├── .github/workflows/
├── Dockerfile
└── sw.js
```

## 授權

- 程式碼：MIT License。
- 本專案原創教材內容：CC BY-NC-SA 4.0。
- 第三方與未來 OER：依各學習物件個別標示，不由整站授權覆蓋。
