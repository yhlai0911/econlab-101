export const scenes = [
  {
    id: 'hook',
    title: '決策現場',
    subtitle: '低票價真的比較公平嗎？',
    teacher: {
      objective: '先暴露「低價＝所有人受益」的直覺。',
      prompt: '先投票，不講答案；追問：若不靠價格分配，會改用什麼規則？',
      misconception: '低價會消除稀少性。',
    },
  },
  {
    id: 'demand',
    title: '需求解碼',
    subtitle: '點移動，還是整條線移動？',
    teacher: {
      objective: '區分需求量變動與需求變動。',
      prompt: '先只拖價格，再切換到「偏好改變」，要求學生描述圖形差異。',
      misconception: '買的人變多就一定是需求增加。',
    },
  },
  {
    id: 'supply',
    title: '供給解碼',
    subtitle: '票價與成本造成不同變化',
    teacher: {
      objective: '區分供給量變動與供給變動。',
      prompt: '比較票價上升、場租上升、加開場次。',
      misconception: '票價上升會使供給曲線右移。',
    },
  },
  {
    id: 'equilibrium',
    title: '均衡實驗室',
    subtitle: '親手製造短缺與過剩',
    teacher: {
      objective: '用數量缺口理解價格調整。',
      prompt: '先設低價問誰競價，再設高價問主辦方如何反應。',
      misconception: '均衡等於公平或理想。',
    },
  },
  {
    id: 'challenge',
    title: '衝擊挑戰',
    subtitle: '一次判斷一則市場新聞',
    teacher: {
      objective: '從事件辨識變數、曲線與方向。',
      prompt: '要求說出「哪個非價格因素改變」，不能只背左右移。',
      misconception: '看到價格變動就移動曲線。',
    },
  },
  {
    id: 'pbl',
    title: 'PBL 政策室',
    subtitle: '設計一套票務制度',
    teacher: {
      objective: '把供需模型轉成公平、效率與執行成本的取捨。',
      prompt: '沒有唯一答案；要求學生說明誰受益、誰承擔代價。',
      misconception: '只表態，不說機制與取捨。',
    },
  },
];

export const challenges = [
  {
    icon: '🔥',
    title: '歌手在短影音平台爆紅',
    detail: '票價尚未改變，更多人想買票。',
    options: ['需求右移', '需求左移', '沿需求線移動'],
    answer: '需求右移',
    why: '偏好改變是非價格因素，因此整條需求曲線右移。',
  },
  {
    icon: '🏟️',
    title: '場租與保全成本大幅上升',
    detail: '每增加一場演出的成本提高。',
    options: ['供給右移', '供給左移', '沿供給線移動'],
    answer: '供給左移',
    why: '成本提高使每一價格下願意提供的數量減少。',
  },
  {
    icon: '💸',
    title: '官方票價由 2,000 調高到 4,000 元',
    detail: '其他條件沒有改變。',
    options: ['需求右移', '需求左移', '沿需求線移動'],
    answer: '沿需求線移動',
    why: '改變的是票本身價格，所以是需求量變動。',
  },
  {
    icon: '📡',
    title: '低價付費直播同步開賣',
    detail: '直播能替代部分現場觀賞。',
    options: ['現場票需求右移', '現場票需求左移', '現場票供給右移'],
    answer: '現場票需求左移',
    why: '替代品更容易取得，使現場票需求減少。',
  },
];

export const policies = [
  {
    id: 'lottery',
    title: '低價實名抽籤',
    summary: '保留低票價，以抽籤分配稀缺門票。',
    focus: '偏重可負擔與程序公平。',
    tradeoff: '短缺仍存在，票未必到最願意支付的人手中。',
  },
  {
    id: 'dynamic',
    title: '完全動態定價',
    summary: '讓官方價格隨需求調整。',
    focus: '偏重配置效率與抑制轉售利潤。',
    tradeoff: '高需求時價格可能排除預算較低的歌迷。',
  },
  {
    id: 'hybrid',
    title: '雙軌混合制度',
    summary: '部分低價抽籤，部分浮動定價。',
    focus: '嘗試兼顧可負擔與價格訊號。',
    tradeoff: '規則較複雜，必須清楚說明比例與資格。',
  },
  {
    id: 'member',
    title: '會員優先制度',
    summary: '先提供忠誠會員購票資格。',
    focus: '偏重忠誠獎勵與可控的分配流程。',
    tradeoff: '新歌迷與非會員容易被排除。',
  },
];

export const defaults = {
  scene: 0,
  completed: [],
  teacher: false,
  reduceMotion: false,
  hookChoice: '',
  demandTab: 'price',
  demandPrice: 3,
  demandShift: 0,
  supplyTab: 'price',
  supplyPrice: 3,
  supplyShift: 0,
  marketPrice: 1.5,
  challengeIndex: 0,
  challengeAnswers: {},
  pblStep: 0,
  priority: '',
  policy: '',
  claim: '',
  cost: '',
  memo: '',
};
