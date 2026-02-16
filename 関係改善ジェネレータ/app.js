/**
 * ふたりのモヤモヤ整理室 — app.js
 * 依存なし（バニラJS）
 */

'use strict';

/* ═══════════════════════════════════════════
   1. データ定義
   ═══════════════════════════════════════════ */

const AXES = ['安心', '共有', '尊重', '自由', '承認'];

const AXIS_CLASS = {
  '安心': 'fill-safety',
  '共有': 'fill-connection',
  '尊重': 'fill-respect',
  '自由': 'fill-autonomy',
  '承認': 'fill-recognition',
};

const CATEGORIES = [
  {
    id: 'A', name: '会話・距離感', emoji: '💬',
    items: [
      { id: 1,  text: 'わかってほしいけど、言うほどでもない' },
      { id: 2,  text: 'ちょっと寂しいけど、重く思われたくない' },
      { id: 3,  text: '最近、会話が減った気がする' },
      { id: 4,  text: '相手が上の空に見えるときがある' },
      { id: 5,  text: '話すタイミングを逃してしまう' },
    ],
  },
  {
    id: 'B', name: '尊重・言い方', emoji: '🗣️',
    items: [
      { id: 6,  text: '些細な言い方がずっと引っかかる' },
      { id: 7,  text: 'ちゃんと扱われていない気がする' },
      { id: 8,  text: '意見を流された感じがする' },
      { id: 9,  text: '比較されるとつらい' },
      { id: 10, text: '謝ってほしいのに流される' },
    ],
  },
  {
    id: 'C', name: '家事・負担・不公平感', emoji: '🏠',
    items: [
      { id: 11, text: '自分ばかり我慢している気がする' },
      { id: 12, text: '頑張りが見えない（気づかれない）' },
      { id: 13, text: '役割が偏っている気がする' },
      { id: 14, text: '休む罪悪感がある' },
      { id: 15, text: '期待すると疲れる' },
    ],
  },
  {
    id: 'D', name: '安心・信頼', emoji: '🌿',
    items: [
      { id: 16, text: '大事にされている確信がほしい' },
      { id: 17, text: '将来の話が曖昧で不安' },
      { id: 18, text: '連絡の頻度で不安になる' },
      { id: 19, text: '断られると見捨てられた気分になる' },
      { id: 20, text: '一度こじれると引きずる' },
    ],
  },
  {
    id: 'E', name: '自由・一人時間', emoji: '🌙',
    items: [
      { id: 21, text: '一人の時間が足りない' },
      { id: 22, text: '予定が詰まると息苦しい' },
      { id: 23, text: '断りたいのに断れない' },
      { id: 24, text: '期待に応え続けるのがしんどい' },
      { id: 25, text: '放っておいてほしい時がある' },
    ],
  },
  {
    id: 'F', name: '愛情表現', emoji: '🌸',
    items: [
      { id: 26, text: '本当は甘えたい' },
      { id: 27, text: 'もっと褒めてほしい' },
      { id: 28, text: '感謝されたい' },
      { id: 29, text: 'スキンシップが減って寂しい' },
      { id: 30, text: '特別扱いされたい' },
    ],
  },
];

const ITEM_AXES = {
  1:  ['共有'],        2:  ['共有', '安心'], 3:  ['共有'],
  4:  ['共有', '安心'],5:  ['共有'],
  6:  ['尊重'],        7:  ['尊重'],         8:  ['尊重', '承認'],
  9:  ['承認'],        10: ['尊重'],
  11: ['尊重'],        12: ['承認'],         13: ['尊重'],
  14: ['自由'],        15: ['安心'],
  16: ['安心'],        17: ['安心'],         18: ['安心'],
  19: ['安心'],        20: ['安心', '共有'],
  21: ['自由'],        22: ['自由'],         23: ['自由', '安心'],
  24: ['自由'],        25: ['自由'],
  26: ['共有'],        27: ['承認'],         28: ['承認'],
  29: ['共有'],        30: ['承認', '共有'],
};

const MAX_SCORE = (() => {
  const totals = {};
  AXES.forEach(a => (totals[a] = 0));
  Object.values(ITEM_AXES).forEach(axes => axes.forEach(a => totals[a]++));
  return Math.max(...Object.values(totals));
})();

const HONNE_TEMPLATES = {
  '安心': '「大丈夫」という確信がほしい気持ちが強いかもしれません。',
  '共有': 'もっとつながりたい、気持ちを分かち合いたいサインかも。',
  '尊重': 'ちゃんと見てもらえている、と感じたいのかもしれません。',
  '自由': '自分のペースや一人の時間が必要なサインかもしれません。',
  '承認': '努力や気持ちに気づいてほしい、という声が聞こえます。',
};

const HINT_TEMPLATES = {
  '安心': [
    { ng: 'なんで連絡くれないの？', ok: '不安になることがあって、確認させてほしい' },
    { ng: '私のこと気にしてないでしょ', ok: '大丈夫って言ってもらえると、すごく落ち着く' },
  ],
  '共有': [
    { ng: '最近全然話してくれないよね', ok: '最近、少しだけ話す時間がほしいなと思ってる' },
    { ng: 'いつも上の空じゃない？', ok: '10分だけ、今日のこと聞かせてほしい' },
  ],
  '尊重': [
    { ng: 'なんでそんな言い方するの？', ok: '言い方が強く感じてしまう時があって' },
    { ng: '話聞いてないでしょ', ok: '最後まで聞いてもらえると、すごく助かる' },
  ],
  '自由': [
    { ng: 'ちょっと放っておいてよ！', ok: '一人の時間があると元気になるタイプで、少し休ませてほしい' },
    { ng: '予定入れすぎ', ok: '今日は少しだけ自分の時間がほしいかも' },
  ],
  '承認': [
    { ng: '全然気づいてくれない', ok: '頑張ってるところ、気づいてもらえると嬉しい' },
    { ng: 'ありがとうも言ってくれないの？', ok: 'ありがとうって言ってもらえると、本当に救われる' },
  ],
};

const ACTION_TEMPLATES = {
  '安心': [
    '予定を先に共有し合う',
    '不安になったら一言で確認してみる',
    '寝る前に「今日はどうだった？」と聞く',
    '小さな「大丈夫」を積み重ねる',
  ],
  '共有': [
    '10分だけスマホを見ないで話す時間を作る',
    '寝る前に一言ふりかえりを言い合う',
    '今日あった小さな出来事を1つシェアする',
    '週に1回、ふたりでお気に入りの話をする',
  ],
  '尊重': [
    '話すとき最後まで遮らず聞く',
    '言い方を整える合図を決めておく',
    '「意見を聞かせて」と声に出す',
    '反論より「なるほど」から始めてみる',
  ],
  '自由': [
    '一人時間の枠を先にカレンダーに入れる',
    '断り方のテンプレを一緒に作っておく',
    '「今日は休む日」と宣言できるようにする',
    '充電時間は罪悪感なく使っていい',
  ],
  '承認': [
    '「ありがとう」を具体的に言う（何が嬉しかったか）',
    '相手の努力ポイントを1つ見つけて言葉にする',
    '「気づいてたよ」と一言添える',
    '頑張りを見つけたらその日のうちに伝える',
  ],
};

/* ═══════════════════════════════════════════
   2. 状態管理
   ═══════════════════════════════════════════ */

const state = {
  step: 1,
  selected: new Set(),
  scores: {},
  topAxes: [],
  async goto(n) { this.step = n; await render(); },
};

/* ═══════════════════════════════════════════
   3. スコア計算
   ═══════════════════════════════════════════ */

function calcScores(selected) {
  const raw = {};
  AXES.forEach(a => (raw[a] = 0));
  selected.forEach(id => {
    (ITEM_AXES[id] || []).forEach(a => { raw[a]++; });
  });
  const scores = {};
  AXES.forEach(a => {
    scores[a] = MAX_SCORE > 0 ? Math.round((raw[a] / MAX_SCORE) * 100) : 0;
  });
  const sorted = [...AXES].sort((a, b) => {
    if (scores[b] !== scores[a]) return scores[b] - scores[a];
    return AXES.indexOf(a) - AXES.indexOf(b); // 優先順：安心>共有>尊重>自由>承認
  });
  const topAxes = sorted.slice(0, 2).filter(a => scores[a] > 0);
  return { scores, topAxes };
}

/* ═══════════════════════════════════════════
   4. アドバイス生成
   ═══════════════════════════════════════════ */

function buildAdvice(topAxes, scores) {
  const result = [];
  const sorted = [...AXES].sort((a, b) => {
    if (scores[b] !== scores[a]) return scores[b] - scores[a];
    return AXES.indexOf(a) - AXES.indexOf(b);
  });
  const extra = sorted.find(a => !topAxes.includes(a) && scores[a] > 0) || sorted[0];
  const axes3 = [...topAxes, extra].slice(0, 3);
  axes3.forEach((axis, i) => {
    const templates = HINT_TEMPLATES[axis] || HINT_TEMPLATES['共有'];
    const t = templates[i % templates.length];
    result.push({ axis, ng: t.ng, ok: t.ok });
  });
  return result;
}

function buildActions(topAxes) {
  const axes = topAxes.length >= 2 ? topAxes : [...topAxes, AXES[0]];
  const actions = [];
  axes.slice(0, 2).forEach(axis => {
    const list = ACTION_TEMPLATES[axis] || [];
    actions.push({ axis, text: list[0] || '' }, { axis, text: list[1] || '' });
  });
  return actions.filter(a => a.text);
}

function buildShareText(topAxes, actions) {
  const top1 = topAxes[0] || '共有';
  const honne = {
    '安心': '少し不安を感じることがあって',
    '共有': '最近もう少しつながりたいなと感じていて',
    '尊重': '自分の気持ちをちゃんと受け取ってほしくて',
    '自由': '自分のペースが少し崩れている感じがして',
    '承認': '頑張りに気づいてもらえると嬉しいと思っていて',
  };
  const actionText = actions[0]?.text || '少し話す時間を作る';
  return (
    `最近、${honne[top1] || 'こう感じることがあって'}。\n` +
    `責めたいんじゃなくて、「${actionText}」できたらいいなと思ってる。\n` +
    `よければ少しだけ話せる？`
  );
}

/* ═══════════════════════════════════════════
   5. localStorage
   ═══════════════════════════════════════════ */

const STORAGE_KEY = 'moyamoya_history';

function storageSave(selectedIds, scores, topAxes) {
  const history = storageLoad();
  const entry = {
    id: Date.now(),
    date: new Date().toLocaleString('ja-JP', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    }),
    selectedIds: [...selectedIds],
    scores,
    topAxes,
  };
  history.unshift(entry);
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 3))); } catch {}
}

function storageLoad() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}

/* ═══════════════════════════════════════════
   6. トースト
   ═══════════════════════════════════════════ */

let toastTimer = null;
function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 3200);
}

/* ═══════════════════════════════════════════
   7. ステップインジケーター
   ═══════════════════════════════════════════ */

function renderStepIndicator(step) {
  const dots = [1, 2, 3].map(n => {
    let cls = 'step-dot';
    if (n < step) cls += ' done';
    else if (n === step) cls += ' active';
    return `<div class="${cls}" aria-hidden="true"></div>`;
  }).join('');
  return `<div class="step-indicator" aria-label="ステップ ${step}/3">${dots}</div>`;
}

/* ═══════════════════════════════════════════
   8. Step1
   ═══════════════════════════════════════════ */

function renderStep1() {
  const app = document.getElementById('app');

  const categoriesHTML = CATEGORIES.map(cat => {
    const itemsHTML = cat.items.map(item => {
      const checked = state.selected.has(item.id) ? 'checked' : '';
      return `
        <div class="check-item">
          <label>
            <input type="checkbox" id="item-${item.id}" data-id="${item.id}"
                   ${checked} aria-label="${item.text}" />
            <span class="check-item-text">${item.text}</span>
          </label>
        </div>`;
    }).join('');
    return `
      <div class="category-card">
        <div class="category-header">
          <span class="category-emoji" aria-hidden="true">${cat.emoji}</span>
          <div>
            <div class="category-label">愛情表現</div>
          </div>
        </div>
        <div class="check-list">${itemsHTML}</div>
      </div>`;
  }).join('');

  app.innerHTML = `
    <header class="app-header">
      <div class="app-logo">
        <div class="app-logo-icon" aria-hidden="true">🌿</div>
        <h1 class="app-title">ふたりのモヤモヤ整理室</h1>
      </div>
      <p class="app-subtitle">あいてに対して感じていることをすべて選んでください。<br>あなたが感じている「モヤモヤ」をできる限り言語化します</p>
    </header>
    ${renderStepIndicator(1)}
    <div class="selected-count" id="selected-count" aria-live="polite">
      <span class="count-num" id="count-num">${state.selected.size}</span> 件チェック中
    </div>
    <div class="category-section">${categoriesHTML}</div>
    <button class="btn btn-primary" id="btn-next" aria-label="気持ちを整理する">
      ✦ 整理する
    </button>
  `;

  document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', () => {
      const id = Number(cb.dataset.id);
      cb.checked ? state.selected.add(id) : state.selected.delete(id);
      document.getElementById('count-num').textContent = state.selected.size;
    });
  });

  document.getElementById('btn-next').addEventListener('click', async () => {
    if (state.selected.size === 0) {
      showToast('ひとつだけでもOK。気になるものに✓してみてください');
      return;
    }
    await state.goto(2);
  });
}

/* ═══════════════════════════════════════════
   9. Step2
   ═══════════════════════════════════════════ */

function renderStep2() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="step2-wrap">
      <div class="paper-anim" aria-hidden="true">
        <div class="paper-sheet"></div>
        <div class="paper-sheet"></div>
        <div class="paper-sheet"></div>
      </div>
      <div>
        <div class="step2-title">気持ちを整理しています…</div>
        <div class="step2-sub">責める言葉を、<br>"伝わる言葉"に翻訳中</div>
      </div>
      <div class="dot-loader" aria-label="読み込み中">
        <span></span><span></span><span></span>
      </div>
    </div>
  `;
  setTimeout(async () => {
    const result = calcScores(state.selected);
    state.scores  = result.scores;
    state.topAxes = result.topAxes;
    await state.goto(3);
  }, 2200);
}

/* ═══════════════════════════════════════════
   10. Step3
   ═══════════════════════════════════════════ */

async function renderStep3() {
  const app = document.getElementById('app');
  const { scores, topAxes } = state;
  const advices  = buildAdvice(topAxes, scores);
  const actions  = buildActions(topAxes);
  const shareMsg = buildShareText(topAxes, actions);

  const honneSentences = topAxes.length > 0
    ? topAxes.map(a => `<em>${a}がほしい</em>気持ちが、今は強いかもしれません。`).join('<br>')
    : '今はゆっくり、自分の気持ちを大切にする時間かもしれません。';

  const barsHTML = AXES.map(axis => `
    <div class="score-row">
      <span class="score-label">${axis}</span>
      <div class="score-track">
        <div class="score-fill ${AXIS_CLASS[axis]}" data-pct="${scores[axis]}"
             style="width:0%" role="progressbar"
             aria-valuenow="${scores[axis]}" aria-valuemin="0" aria-valuemax="100"
             aria-label="${axis} ${scores[axis]}%"></div>
      </div>
      <span class="score-pct">${scores[axis]}%</span>
    </div>`).join('');

  const hintsHTML = advices.map(a => `
    <div class="hint-item">
      <div class="hint-ng">
        <span class="hint-badge badge-ng">NG</span>
        <span class="hint-text">${escapeHTML(a.ng)}</span>
      </div>
      <div class="hint-ok">
        <span class="hint-badge badge-ok">OK</span>
        <span class="hint-text">${escapeHTML(a.ok)}</span>
      </div>
    </div>`).join('');

  const actionsHTML = actions.map(a => `
    <div class="action-item">
      <span class="action-axis">${a.axis}</span>
      <span class="action-text">${escapeHTML(a.text)}</span>
    </div>`).join('');

  const dateStr = new Date().toLocaleDateString('ja-JP', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  app.innerHTML = `
    <div class="result-header">
      <div class="result-emoji" aria-hidden="true">🌿</div>
      <div class="result-title">整理できました</div>
      <div class="result-date">${dateStr}</div>
    </div>
    ${renderStepIndicator(3)}

    <section class="result-card" aria-label="今のあなたの本音">
      <div class="result-card-header">
        <div class="result-card-icon icon-honne" aria-hidden="true">🌸</div>
        <div>
          <div class="result-card-title">今のあなたの本音</div>
          <div class="result-card-sub">今日の関係バランス</div>
        </div>
      </div>
      <p class="honne-text">${honneSentences}</p>
      <div class="score-bars" aria-label="5つの欲求軸スコア">${barsHTML}</div>
      <p class="score-note text-note">※ 診断ではありません。今の気持ちの傾向を可視化したものです。</p>
    </section>

    <section class="result-card" aria-label="伝え方のヒント">
      <div class="result-card-header">
        <div class="result-card-icon icon-hint" aria-hidden="true">💌</div>
        <div>
          <div class="result-card-title">伝え方のヒント</div>
          <div class="result-card-sub">責める言葉 → 伝わる言葉</div>
        </div>
      </div>
      <div class="hint-items">${hintsHTML}</div>
    </section>

    <section class="result-card" aria-label="今週の小さなアクション">
      <div class="result-card-header">
        <div class="result-card-icon icon-action" aria-hidden="true">✦</div>
        <div>
          <div class="result-card-title">今週の小さなアクション</div>
          <div class="result-card-sub">できそうなものひとつだけでもOK</div>
        </div>
      </div>
      <div class="action-grid">${actionsHTML}</div>
    </section>

    <section class="result-card" aria-label="共有用メッセージ">
      <div class="result-card-header">
        <div class="result-card-icon icon-share" aria-hidden="true">📩</div>
        <div>
          <div class="result-card-title">共有用メッセージ</div>
          <div class="result-card-sub">そのままコピーして使えます</div>
        </div>
      </div>
      <div class="share-text" id="share-text">${escapeHTML(shareMsg)}</div>
      <button class="btn-copy" id="btn-copy" aria-label="メッセージをコピー">
        <span id="copy-icon">📋</span>
        <span id="copy-label">コピーする</span>
      </button>
    </section>

    <div class="result-actions">
      <button class="btn btn-secondary btn-block" id="btn-retry">もう一度やる</button>
      <button class="btn btn-ghost btn-block" id="btn-back-keep">選択を保持して戻る</button>
      <button class="btn btn-primary btn-block" onclick="location.href='../index.html'">← トップページへ戻る</button>
    </div>
  `;

  // バーアニメ
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.querySelectorAll('.score-fill').forEach(el => {
        el.style.width = el.dataset.pct + '%';
      });
    });
  });

  document.getElementById('btn-copy').addEventListener('click', () => {
    const btn   = document.getElementById('btn-copy');
    const label = document.getElementById('copy-label');
    const icon  = document.getElementById('copy-icon');
    const reset = () => {
      btn.classList.remove('copied');
      label.textContent = 'コピーする';
      icon.textContent  = '📋';
    };
    navigator.clipboard.writeText(shareMsg).then(() => {
      btn.classList.add('copied');
      label.textContent = 'コピーしました！';
      icon.textContent  = '✓';
      setTimeout(reset, 2500);
    }).catch(() => {
      // フォールバック（古いブラウザ）
      const ta = document.createElement('textarea');
      ta.value = shareMsg;
      ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast('コピーしました');
    });
  });

  document.getElementById('btn-retry').addEventListener('click', async () => {
    state.selected.clear();
    await state.goto(1);
  });

  document.getElementById('btn-back-keep').addEventListener('click', async () => {
    await state.goto(1);
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Save diagnosis result to Firestore
  if (window.saveDiagnosisResult) {
    // 認証状態を確認してから保存
    const currentUser = window.getCurrentUser ? window.getCurrentUser() : null;
    if (!currentUser) {
      console.log('🔐 認証状態をリフレッシュします...');
      if (window.refreshAuthState) {
        await window.refreshAuthState();
      }
    }
    
    window.saveDiagnosisResult({
      diagnosisId: "relationship",
      diagnosisTitle: "ふたりのモヤモヤ整理室",
      resultType: topAxes[0] || "unknown",
      resultEmoji: "🌿",
      resultDesc: `${topAxes.slice(0, 3).join('・')}の傾向があります`,
      scores: scores,
      maxScore: 25
    });
  }
}

/* ═══════════════════════════════════════════
   11. メインレンダラー
   ═══════════════════════════════════════════ */

async function render() {
  switch (state.step) {
    case 1: renderStep1(); break;
    case 2: renderStep2(); break;
    case 3: await renderStep3(); break;
    default: renderStep1();
  }
  window.scrollTo({ top: 0, behavior: 'instant' });
}

/* ═══════════════════════════════════════════
   12. ユーティリティ
   ═══════════════════════════════════════════ */

function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/* ── 起動 ── */
(async () => {
  await render();
})();