import { challenges, policies } from './data.js';
import { curveSvg, escapeAttr, escapeHtml, marketSvg, money, round } from './visuals.js';

function header(label, title, lead) {
  return `<span class="step-label">${label}</span><h1>${title}</h1><p class="lead">${lead}</p>`;
}

function renderHook(state) {
  const feedback = !state.hookChoice
    ? ''
    : state.hookChoice === 'depends'
      ? '對。低價只決定「付多少錢」，還沒有決定「誰拿到票」。抽籤、排隊、網速與轉售市場都可能成為新的分配規則。'
      : '這個答案抓到一部分，但還不完整。低票價無法讓 10,000 張票同時滿足 80,000 人；真正關鍵是剩下的人如何被排除。';

  const choices = [
    ['everyone', '所有想看的人'],
    ['winners', '成功拿到低價票的人'],
    ['resellers', '二手轉售者'],
    ['depends', '不一定，要看票怎麼分'],
  ];

  return `
    <article class="focus-card">
      <div class="hero">
        <div>
          ${header(
            '第 1 幕 · 先做決定',
            '低票價，真的讓演唱會<em>更公平</em>嗎？',
            '官方票價只有 NT$1,500，但想買的人有 80,000，座位只有 10,000。先不要背定義，請先判斷。',
          )}
          <div class="question">
            <p>低價主要幫助了誰？</p>
            <div class="choices">
              ${choices
                .map(
                  ([id, label]) => `<button class="choice ${state.hookChoice === id ? 'selected' : ''}" data-hook="${id}">${label}</button>`,
                )
                .join('')}
            </div>
            <div class="reveal ${feedback ? 'show' : ''}">${feedback}</div>
          </div>
        </div>
        <div class="hero-visual">
          <article class="ticket">
            <div class="resale">轉售 NT$8,000</div>
            <small>QING CITY LIVE</small>
            <h3>青城音樂祭</h3>
            <div class="date">只有 10,000 個座位</div>
            <div class="price-row"><span>官方票價</span><b>NT$1,500</b></div>
          </article>
        </div>
      </div>
      <details class="deeper">
        <summary>想知道這與課本哪裡相連？</summary>
        <div class="deep-content"><b>核心概念：稀少性與市場配置。</b><br>價格降低不會增加固定座位，也不會消除超額需求；它只是改變誰能取得票，以及人們用金錢以外的什麼成本競爭。</div>
      </details>
    </article>`;
}

function renderDemand(state) {
  const price = Number(state.demandPrice);
  const shift = Number(state.demandShift);
  const quantity = Math.max(0, 95 - 10 * price + shift);
  const baselineQuantity = Math.max(0, 95 - 10 * price);
  const showingShift = state.demandTab === 'shift';

  const controls = showingShift
    ? `<div class="event-options">
        <button data-demand-shift="0" class="${shift === 0 ? 'active' : ''}">一般熱度</button>
        <button data-demand-shift="15" class="${shift === 15 ? 'active' : ''}">🔥 歌手爆紅</button>
      </div>`
    : `<div class="slider-head"><span>官方票價</span><output>${money(price)}</output></div>
      <input id="demandPrice" class="range" type="range" min="0.5" max="7.5" step="0.25" value="${price}">
      <div class="range-hints"><span>較低</span><span>較高</span></div>`;

  const takeawayTitle = showingShift
    ? shift
      ? '需求增加：整條曲線右移'
      : '偏好沒有改變：曲線留在原位'
    : '需求量變動：只是在同一條線上換一個點';

  const takeawayText = showingShift
    ? shift
      ? `同樣 ${money(price)} 下，想買的人由 ${round(baselineQuantity)} 千增為 ${round(quantity)} 千。`
      : '請按「歌手爆紅」，看看整條線怎麼移動。'
    : `目前需求量約 ${round(quantity)} 千張；曲線本身沒有移動。`;

  return `
    <article class="focus-card">
      ${header(
        '第 2 幕 · 需求',
        '買的人變多，未必叫做<em>需求增加</em>。',
        '先判斷改變的是「票價」，還是票價以外的因素。一次只操作一種變化。',
      )}
      <div class="lab-grid">
        <section class="graph-card">${curveSvg('demand', { price, shift, quantity })}</section>
        <section class="control-card">
          <div class="mode-tabs">
            <button data-demand-tab="price" class="${showingShift ? '' : 'active'}">改變票價</button>
            <button data-demand-tab="shift" class="${showingShift ? 'active' : ''}">歌手爆紅</button>
          </div>
          <div class="control-body">${controls}</div>
          <div class="one-line"><span>一句話記住</span><strong>${takeawayTitle}</strong><p>${takeawayText}</p></div>
        </section>
      </div>
      <details class="deeper">
        <summary>展開正式定義與方程式</summary>
        <div class="deep-content"><b>需求量變動：</b>貨品本身價格改變，沿著同一條需求曲線移動。<br><b>需求變動：</b>所得、偏好、相關商品價格等非價格因素改變，整條曲線位移。<br><span class="formula">Qd = 95 − 10P + 偏好衝擊</span></div>
      </details>
    </article>`;
}

function renderSupply(state) {
  const price = Number(state.supplyPrice);
  const shift = Number(state.supplyShift);
  const quantity = Math.max(0, -5 + 10 * price + shift);
  const baselineQuantity = Math.max(0, -5 + 10 * price);
  const showingShift = state.supplyTab === 'shift';

  const controls = showingShift
    ? `<div class="event-options">
        <button data-supply-shift="-15" class="${shift === -15 ? 'active' : ''}">🏟️ 場租上升</button>
        <button data-supply-shift="0" class="${shift === 0 ? 'active' : ''}">回到基準</button>
        <button data-supply-shift="15" class="${shift === 15 ? 'active' : ''}">➕ 加開場次</button>
      </div>`
    : `<div class="slider-head"><span>官方票價</span><output>${money(price)}</output></div>
      <input id="supplyPrice" class="range" type="range" min="0.5" max="7.5" step="0.25" value="${price}">
      <div class="range-hints"><span>較低</span><span>較高</span></div>`;

  const takeawayTitle = showingShift
    ? shift < 0
      ? '供給減少：整條曲線左移'
      : shift > 0
        ? '供給增加：整條曲線右移'
        : '成本與產能未變：曲線留在原位'
    : '供給量變動：只是在同一條線上換一個點';

  const takeawayText = showingShift
    ? shift
      ? `同樣 ${money(price)} 下，供給量由 ${round(baselineQuantity)} 千變為 ${round(quantity)} 千。`
      : '請選一個事件，看看整條線怎麼移動。'
    : `目前供給量約 ${round(quantity)} 千張；曲線本身沒有移動。`;

  return `
    <article class="focus-card">
      ${header(
        '第 3 幕 · 供給',
        '票價變高，和<em>供給增加</em>不是同一件事。',
        '票價改變只會讓主辦方沿原曲線調整供給量；成本或場次改變，才會移動整條供給曲線。',
      )}
      <div class="lab-grid">
        <section class="graph-card">${curveSvg('supply', { price, shift, quantity })}</section>
        <section class="control-card">
          <div class="mode-tabs">
            <button data-supply-tab="price" class="${showingShift ? '' : 'active'}">改變票價</button>
            <button data-supply-tab="shift" class="${showingShift ? 'active' : ''}">改變成本／場次</button>
          </div>
          <div class="control-body">${controls}</div>
          <div class="one-line"><span>一句話記住</span><strong>${takeawayTitle}</strong><p>${takeawayText}</p></div>
        </section>
      </div>
      <details class="deeper">
        <summary>展開正式定義與方程式</summary>
        <div class="deep-content"><b>供給量變動：</b>貨品本身價格改變，沿著同一條供給曲線移動。<br><b>供給變動：</b>生產成本、技術、賣方數量或產能改變，整條曲線位移。<br><span class="formula">Qs = −5 + 10P + 供給衝擊</span></div>
      </details>
    </article>`;
}

function renderEquilibrium(state) {
  const price = Number(state.marketPrice);
  const demandQuantity = Math.max(0, 95 - 10 * price);
  const supplyQuantity = Math.max(0, -5 + 10 * price);
  const gap = Math.round(Math.abs(demandQuantity - supplyQuantity));
  const equilibriumPrice = 5;
  const equilibriumQuantity = 45;

  let className = 'equal';
  let headline = '市場剛好均衡';
  let description = '想買的數量等於願意提供的數量，價格沒有明顯調整壓力。';
  if (demandQuantity > supplyQuantity + 0.1) {
    className = 'shortage';
    headline = `短缺 ${gap} 千張`;
    description = '想買的人比票多，買方競爭使價格出現上升壓力。';
  } else if (supplyQuantity > demandQuantity + 0.1) {
    className = 'surplus';
    headline = `過剩 ${gap} 千張`;
    description = '票比買方多，主辦方有降價或縮減供給的誘因。';
  }

  return `
    <article class="focus-card">
      ${header(
        '第 4 幕 · 市場均衡',
        '價格不是老師指定的答案，而是市場的<em>調整訊號</em>。',
        '只拖動一個價格滑桿，觀察想買的數量與願意提供的數量何時相等。',
      )}
      <section class="graph-card" style="margin-top:26px">${marketSvg(
        price,
        demandQuantity,
        supplyQuantity,
        equilibriumPrice,
        equilibriumQuantity,
      )}</section>
      <div class="slider-head" style="max-width:720px;margin:18px auto 8px"><span>目前票價</span><output>${money(price)}</output></div>
      <input id="marketPrice" class="range" style="display:block;max-width:720px;margin:auto" type="range" min="0.5" max="8" step="0.25" value="${price}">
      <div class="market-result"><div class="big ${className}">${headline}</div><p>${description}</p></div>
      <div class="quick-set"><button data-market-set="1.5">官方低價</button><button data-market-set="5">找到均衡</button><button data-market-set="7">測試高價</button></div>
      <details class="deeper">
        <summary>看數字與計算</summary>
        <div class="deep-content">目前：<b>Qd = ${round(demandQuantity)} 千張</b>，<b>Qs = ${round(supplyQuantity)} 千張</b>。<br>均衡由 <span class="formula">95 − 10P = −5 + 10P</span> 求得：<b>P* = ${money(equilibriumPrice)}</b>、<b>Q* = ${equilibriumQuantity} 千張</b>。均衡只代表買賣雙方沒有立即改變價格與數量的壓力，不等於公平。</div>
      </details>
    </article>`;
}

function renderChallenge(state) {
  const index = Math.min(state.challengeIndex, challenges.length - 1);
  const challenge = challenges[index];
  const answer = state.challengeAnswers[index];

  return `
    <article class="focus-card">
      ${header(
        '第 5 幕 · 遷移練習',
        '一次只判斷<em>一則新聞</em>。',
        '先找出哪個因素改變，再決定是哪條曲線、往哪個方向移動。',
      )}
      <div class="challenge-wrap">
        <div class="challenge-progress">${challenges.map((_, itemIndex) => `<i class="${itemIndex === index ? 'active' : ''}"></i>`).join('')}</div>
        <article class="news-card">
          <div class="news-icon">${challenge.icon}</div>
          <h3>${challenge.title}</h3>
          <p>${challenge.detail}</p>
          <div class="challenge-choices">${challenge.options
            .map(
              (option) => `<button class="${answer === option ? 'selected' : ''}" data-challenge-answer="${escapeAttr(option)}">${option}</button>`,
            )
            .join('')}</div>
          ${answer ? renderChallengeFeedback(index, answer, challenge) : ''}
        </article>
      </div>
      <details class="deeper">
        <summary>需要一個固定判斷步驟？</summary>
        <div class="deep-content"><b>四步法：</b>① 找出市場；② 找出改變的因素；③ 判斷需求或供給；④ 判斷方向，再推論均衡價格與數量。</div>
      </details>
    </article>`;
}

function renderChallengeFeedback(index, answer, challenge) {
  const next = index < challenges.length - 1
    ? '<div class="inline-next"><button id="nextChallenge">下一題 →</button></div>'
    : '<div class="challenge-feedback"><strong>四題完成。</strong><br>你已練習把生活事件翻譯成需求與供給的變化。</div>';
  return `<div class="challenge-feedback"><strong>${answer === challenge.answer ? '答對了。' : '再看一次變動的原因。'}</strong><br>${challenge.why}</div>${next}`;
}

function renderPbl(state) {
  const step = state.pblStep;
  const selected = policies.find((policy) => policy.id === state.policy);
  let body = '';

  if (step === 0) {
    const priorities = [
      ['affordable', '💰', '可負擔'],
      ['fair', '⚖️', '程序公平'],
      ['efficient', '⚡', '配置效率'],
    ];
    body = `<div class="priority-grid">${priorities
      .map(
        ([id, icon, label]) => `<button class="${state.priority === id ? 'active' : ''}" data-priority="${id}"><span>${icon}</span><strong>${label}</strong></button>`,
      )
      .join('')}</div>${state.priority ? '<div class="pbl-actions"><button id="pblNext">下一步：比較制度 →</button></div>' : ''}`;
  }

  if (step === 1) {
    body = `<div class="policy-list">${policies
      .map(
        (policy) => `<button class="policy-item ${state.policy === policy.id ? 'active' : ''}" data-policy="${policy.id}"><strong>${policy.title}</strong><span>${policy.summary}</span></button>`,
      )
      .join('')}</div>${selected ? `<div class="policy-detail"><strong>${selected.focus}</strong><br>${selected.tradeoff}</div><div class="pbl-actions"><button id="pblNext">選擇這個方案 →</button></div>` : ''}`;
  }

  if (step === 2) {
    body = `<div class="memo">
      <label>一句話說明：你為什麼選「${selected?.title || '這個方案'}」？</label>
      <textarea id="claimInput" placeholder="例如：我選擇混合制度，因為……">${escapeHtml(state.claim)}</textarea>
      <label>這個方案最大的代價或副作用是什麼？</label>
      <textarea id="costInput" placeholder="例如：規則更複雜，而且……">${escapeHtml(state.cost)}</textarea>
      <div class="pbl-actions"><button id="generateMemo">形成政策結論</button></div>
      ${state.memo ? `<article class="memo-preview"><h3>你的政策結論</h3><strong>方案：</strong>${selected?.title}<br><strong>理由：</strong>${escapeHtml(state.claim)}<br><strong>承認的代價：</strong>${escapeHtml(state.cost)}<br><br><strong>經濟學檢查：</strong>你的回答同時包含主張、配置機制與取捨，已不只是表態。</article>` : ''}
    </div>`;
  }

  const instruction = step === 0
    ? '第一步：你最優先想保護什麼？'
    : step === 1
      ? '第二步：選擇一套分配規則'
      : '第三步：說明理由與代價';

  return `
    <article class="focus-card">
      ${header(
        '第 6 幕 · PBL',
        '沒有完美政策，只有可以被說清楚的<em>取捨</em>。',
        '替青城音樂祭設計票務制度。平台一次只問你一個決策，不需要先寫長篇報告。',
      )}
      <div class="pbl-steps"><i class="${step === 0 ? 'active' : ''}"></i><i class="${step === 1 ? 'active' : ''}"></i><i class="${step === 2 ? 'active' : ''}"></i></div>
      <h3 style="text-align:center">${instruction}</h3>
      ${body}
      <details class="deeper">
        <summary>回到經濟學模型</summary>
        <div class="deep-content">低價不會消除短缺，只會把分配方式改成抽籤、排隊、資格或二手交易；動態定價能減少短缺，卻會改變不同所得者取得門票的機會。PBL 的重點是用模型說明這些機制，而不是找唯一正確答案。</div>
      </details>
    </article>`;
}

export function renderScene(id, state) {
  const renderers = {
    hook: renderHook,
    demand: renderDemand,
    supply: renderSupply,
    equilibrium: renderEquilibrium,
    challenge: renderChallenge,
    pbl: renderPbl,
  };
  return renderers[id](state);
}
