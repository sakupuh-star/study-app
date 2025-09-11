// ツンデレ風応援コメント30個
const cheerMessages = [
  "べ、別にあんたのために応援してるんじゃないんだからね！",
  "今日もそこそこ頑張ったみたいね。ちょっとは褒めてあげてもいいわ。",
  "サボったら許さないんだから…！ちゃんと続けなさいよ！",
  "が、頑張ってるのは認めてあげるわ。でも無理はしないでよね。",
  "こんなことで満足しちゃダメよ。もっと上を目指しなさい！",
  "…ちょっとだけ期待してるんだから。頑張りなさい！",
  "あんたならできるって…し、信じてるんだから！",
  "今日も勉強お疲れ様。…別に心配してるんじゃないからね。",
  "どうせ続かないと思ってたけど…意外とやるじゃない。",
  "たまには休みなさいよ、倒れたら困るし…別に心配してないけど！",
  "やればできるじゃない。…ま、当たり前よね！",
  "サボっても知らないんだから！あとで泣いても助けてあげないわよ。",
  "ちょっとだけ褒めてあげる。…ほんのちょっとだけよ！",
  "そんなに頑張らなくてもいいのに…ま、偉いと思うわ。",
  "あんまり無理しすぎると、後悔するんだからね！",
  "今日も…お疲れ様。な、なんでもない！",
  "結果が出なくても落ち込まないでよね。次があるんだから！",
  "あんたの努力は…ちゃんと見てるんだから。",
  "まだまだこれからよ。もっと上を目指しなさい！",
  "調子に乗らないでよね。でも…少しは認めてあげる。",
  "こんなにやるなんて…少し見直したかも。",
  "ほら、もっと自信持ちなさいよ！私がついてるんだから。",
  "できないって決めつけるなんて、あんたらしくないわよ。",
  "失敗したっていいじゃない。次、頑張ればいいのよ。",
  "応援なんてしないけど…が、頑張りなさいよ。",
  "本気出したら、もっとできるんでしょ？見せてみなさいよ！",
  "私が見てるんだから、気を抜かないでよね！",
  "あんたの頑張り…ちょっとだけ期待してるわ。",
  "目標達成したら…ま、少しくらい褒めてあげるわよ。",
  "諦めたらそこで終わりなんだから。最後までやりなさい！"
];

// 応援コメント表示
function showCheerMessage() {
  const idx = Math.floor(Math.random() * cheerMessages.length);
  document.getElementById('cheer-message').textContent = cheerMessages[idx];
}

// 目標時間（day, week, month）の取得
function getGoalMinutes(mode) {
  return Number(localStorage.getItem('goalMinutes_' + mode) || 0);
}

// ローカルストレージから記録を取得
function getRecords() {
  return JSON.parse(localStorage.getItem('studyRecords') || '[]');
}

// 記録を保存
function saveRecords(records) {
  localStorage.setItem('studyRecords', JSON.stringify(records));
}

// 記録を追加
function addRecord(subject, startTime, endTime, minutes, memo) {
  const records = getRecords();
  records.push({
    date: new Date().toISOString().slice(0,10),
    subject,
    startTime,
    endTime,
    minutes: Number(minutes),
    memo
  });
  saveRecords(records);
  renderRecords();
  renderChart();
  renderGoalProgressAll();
}

// 記録一覧表示
function renderRecords() {
  const list = document.getElementById('record-list');
  const records = getRecords();
  list.innerHTML = '';
  records.slice().reverse().forEach(r => {
    const timeInfo = r.startTime && r.endTime ? `｜${r.startTime}〜${r.endTime}` : '';
    const memoInfo = r.memo ? `｜${r.memo}` : '';
    const li = document.createElement('li');
    li.textContent = `${r.date}｜${r.subject}${timeInfo}｜${r.minutes}分${memoInfo}`;
    list.appendChild(li);
  });
}

// 目標と進捗の表示（共通化）
function renderGoalProgress(mode) {
  let goal = getGoalMinutes(mode);
  let progressElem = document.getElementById('goal-progress-' + mode);

  if (!progressElem) return; // ページによっては存在しない

  if (!goal) {
    progressElem.textContent = '';
    return;
  }
  let records = getRecords();
  let total = 0, msg = '';
  let remain = 0;
  if (mode === 'day') {
    // 今日
    const today = new Date().toISOString().slice(0,10);
    total = records.filter(r => r.date === today).reduce((sum, r) => sum + r.minutes, 0);
    remain = Math.max(0, goal - total);
    msg = `今日の勉強：${total}分 / 目標：${goal}分`;
    msg += `　残り：${remain}分`;
    if (total >= goal) msg += "　目標達成おめでとう！";
    else msg += `　あと${remain}分がんばって！`;
  } else if (mode === 'week') {
    // 今週
    const weekDates = getPastDates(7);
    total = records.filter(r => weekDates.includes(r.date)).reduce((sum, r) => sum + r.minutes, 0);
    remain = Math.max(0, goal - total);
    msg = `今週の勉強：${total}分 / 目標：${goal}分`;
    msg += `　残り：${remain}分`;
    if (total >= goal) msg += "　目標達成おめでとう！";
    else msg += `　あと${remain}分がんばって！`;
  } else if (mode === 'month') {
    // 今月
    const monthDates = getPastDates(30);
    total = records.filter(r => monthDates.includes(r.date)).reduce((sum, r) => sum + r.minutes, 0);
    remain = Math.max(0, goal - total);
    msg = `今月の勉強：${total}分 / 目標：${goal}分`;
    msg += `　残り：${remain}分`;
    if (total >= goal) msg += "　目標達成おめでとう！";
    else msg += `　あと${remain}分がんばって！`;
  }
  progressElem.textContent = msg;
}

// 過去N日分の日付（YYYY-MM-DD文字列配列）を返す
function getPastDates(days) {
  const arr = [];
  const now = new Date();
  for (let i = 0; i < days; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    arr.push(d.toISOString().slice(0,10));
  }
  return arr;
}

// 全ての目標進捗表示
function renderGoalProgressAll() {
  renderGoalProgress('day');
  renderGoalProgress('week');
  renderGoalProgress('month');
}

// ====== グラフ期間切替機能 ======
let chartRange = 'day'; // デフォルトは「1日」表示
let chart; // Chart.jsインスタンス

window.addEventListener('DOMContentLoaded', () => {
  // 期間切替ボタン
  const rangeBtns = document.querySelectorAll('#chart-range button');
  rangeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      chartRange = btn.dataset.range;
      rangeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderChart();
    });
  });
  document.querySelector('#chart-range button[data-range="day"]').classList.add('active');
});

// レコードを期間でフィルタ
function filterRecordsByRange(records, range) {
  const now = new Date();
  let from;
  if (range === 'day') {
    from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else if (range === 'week') {
    from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
  } else if (range === 'month') {
    from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
  }
  return records.filter(r => new Date(r.date) >= from);
}

// 日付ごとにデータを集計
function aggregateStudyData(records, range) {
  const map = {};
  records.forEach(r => {
    const d = new Date(r.date);
    const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    map[key] = (map[key] || 0) + r.minutes;
  });
  const labels = [];
  const data = [];
  const now = new Date();
  let days = 1;
  if (range === 'day') days = 1;
  else if (range === 'week') days = 7;
  else if (range === 'month') days = 30;
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    labels.push(`${d.getMonth() + 1}/${d.getDate()}`);
    data.push(map[key] || 0);
  }
  return { labels, data };
}

// グラフ描画
function renderChart() {
  const ctx = document.getElementById('studyChart').getContext('2d');
  const records = getRecords();
  const filtered = filterRecordsByRange(records, chartRange);
  const { labels, data } = aggregateStudyData(filtered, chartRange);

  // 目標線
  let goal = 0;
  if (chartRange === 'day') goal = getGoalMinutes('day');
  else if (chartRange === 'week') goal = getGoalMinutes('week') / 7;
  else if (chartRange === 'month') goal = getGoalMinutes('month') / 30;
  const goalLine = goal ? labels.map(_ => goal) : null;

  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: '日ごとの勉強時間（分）',
          data,
          backgroundColor: '#1d72b8'
        },
        ...(goalLine ? [{
          label: '目標時間(1日あたり)',
          type: 'line',
          data: goalLine,
          borderColor: 'red',
          borderWidth: 2,
          fill: false,
          pointRadius: 0
        }] : [])
      ]
    },
    options: {
      scales: { y: { beginAtZero: true } }
    }
  });
}
// ====== グラフ期間切替ここまで ======

// タイマー機能
let startTime = null;

document.getElementById('start-btn').addEventListener('click', () => {
  startTime = new Date();
  document.getElementById('start-btn').style.display = 'none';
  document.getElementById('stop-btn').style.display = '';
  document.getElementById('timer-info').textContent = `開始: ${startTime.toLocaleTimeString()}`;
  document.getElementById('subject').disabled = false;
});

document.getElementById('stop-btn').addEventListener('click', () => {
  if (!startTime) return;
  const endTime = new Date();
  const subject = document.getElementById('subject').value.trim();
  const memo = document.getElementById('memo').value.trim();
  const minutes = Math.max(1, Math.round((endTime - startTime) / 60000));
  if (subject) {
    addRecord(
      subject,
      startTime.toTimeString().slice(0,5),
      endTime.toTimeString().slice(0,5),
      minutes,
      memo
    );
    document.getElementById('study-form').reset();
    document.getElementById('timer-info').textContent = '';
    startTime = null;
    document.getElementById('start-btn').style.display = '';
    document.getElementById('stop-btn').style.display = 'none';
  } else {
    alert('科目を入力してください');
  }
});

// 初期化
showCheerMessage();
renderRecords();
renderGoalProgressAll();
renderChart();

document.getElementById('stop-btn').style.display = 'none';
document.getElementById('start-btn').style.display = '';
document.getElementById('subject').disabled = false;