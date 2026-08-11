export function curveSvg(type, { price, shift, quantity }) {
  const width = 720;
  const height = 420;
  const margin = { left: 64, right: 30, top: 30, bottom: 58 };
  const x = (q) => margin.left + (q / 100) * (width - margin.left - margin.right);
  const y = (p) => height - margin.bottom - (p / 8) * (height - margin.top - margin.bottom);

  const grids = [2, 4, 6]
    .map(
      (p) => `
        <line class="grid" x1="${margin.left}" y1="${y(p)}" x2="${width - margin.right}" y2="${y(p)}" />
        <text class="label" x="${margin.left - 13}" y="${y(p) + 4}" text-anchor="end">${p}</text>`,
    )
    .join('');

  let lines = '';
  if (type === 'demand') {
    const path = (value) =>
      `M ${x(Math.max(0, 95 + value))} ${y(0)} L ${x(Math.max(0, 15 + value))} ${y(8)}`;
    if (shift) lines += `<path class="demand baseline" d="${path(0)}" />`;
    lines += `
      <path class="demand" d="${path(shift)}" />
      <text class="curve-label" fill="var(--blue)" x="${x(Math.max(0, 22 + shift))}" y="${y(7.3)}">D${shift ? '₁' : ''}</text>`;
  } else {
    const path = (value) => {
      const p0 = Math.max(0, (5 - value) / 10);
      return `M ${x(0)} ${y(p0)} L ${x(Math.min(100, 75 + value))} ${y(8)}`;
    };
    if (shift) lines += `<path class="supply baseline" d="${path(0)}" />`;
    lines += `
      <path class="supply" d="${path(shift)}" />
      <text class="curve-label" fill="var(--danger)" x="${x(Math.min(100, 69 + shift))}" y="${y(7.4)}">S${shift ? '₁' : ''}</text>`;
  }

  const point = `
    <line class="guide" x1="${margin.left}" y1="${y(price)}" x2="${x(quantity)}" y2="${y(price)}" />
    <line class="guide" x1="${x(quantity)}" y1="${y(price)}" x2="${x(quantity)}" y2="${height - margin.bottom}" />
    <circle class="point" cx="${x(quantity)}" cy="${y(price)}" r="7" />`;

  return `
    <svg class="chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="${type === 'demand' ? '需求' : '供給'}曲線互動圖">
      <line class="axis" x1="${margin.left}" y1="${margin.top}" x2="${margin.left}" y2="${height - margin.bottom}" />
      <line class="axis" x1="${margin.left}" y1="${height - margin.bottom}" x2="${width - margin.right}" y2="${height - margin.bottom}" />
      ${grids}${lines}${point}
      <text class="axis-title" x="${margin.left}" y="18">票價（千元）</text>
      <text class="axis-title" x="${width - margin.right}" y="${height - 18}" text-anchor="end">票數（千張）</text>
    </svg>`;
}

export function marketSvg(price, demandQuantity, supplyQuantity, equilibriumPrice, equilibriumQuantity) {
  const width = 760;
  const height = 430;
  const margin = { left: 66, right: 30, top: 30, bottom: 58 };
  const x = (q) => margin.left + (q / 100) * (width - margin.left - margin.right);
  const y = (p) => height - margin.bottom - (p / 8) * (height - margin.top - margin.bottom);
  const grids = [2, 4, 6]
    .map((p) => `<line class="grid" x1="${margin.left}" y1="${y(p)}" x2="${width - margin.right}" y2="${y(p)}" />`)
    .join('');

  return `
    <svg class="chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="需求與供給市場均衡圖">
      <line class="axis" x1="${margin.left}" y1="${margin.top}" x2="${margin.left}" y2="${height - margin.bottom}" />
      <line class="axis" x1="${margin.left}" y1="${height - margin.bottom}" x2="${width - margin.right}" y2="${height - margin.bottom}" />
      ${grids}
      <path class="demand" d="M ${x(95)} ${y(0)} L ${x(15)} ${y(8)}" />
      <path class="supply" d="M ${x(0)} ${y(0.5)} L ${x(75)} ${y(8)}" />
      <text class="curve-label" fill="var(--blue)" x="${x(22)}" y="${y(7.3)}">D</text>
      <text class="curve-label" fill="var(--danger)" x="${x(69)}" y="${y(7.4)}">S</text>
      <line class="price-guide" x1="${margin.left}" y1="${y(price)}" x2="${width - margin.right}" y2="${y(price)}" />
      <circle class="point" cx="${x(equilibriumQuantity)}" cy="${y(equilibriumPrice)}" r="7" />
      <circle cx="${x(demandQuantity)}" cy="${y(price)}" r="6" fill="var(--blue)" />
      <circle cx="${x(supplyQuantity)}" cy="${y(price)}" r="6" fill="var(--danger)" />
      <text class="axis-title" x="${margin.left}" y="18">票價（千元）</text>
      <text class="axis-title" x="${width - margin.right}" y="${height - 18}" text-anchor="end">票數（千張）</text>
    </svg>`;
}

export function money(value) {
  return `NT$${Math.round(value * 1000).toLocaleString('zh-TW')}`;
}

export function round(value) {
  return Math.round(value);
}

export function escapeHtml(value = '') {
  return String(value).replace(/[&<>"]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
  })[character]);
}

export function escapeAttr(value = '') {
  return escapeHtml(value).replace(/'/g, '&#39;');
}
