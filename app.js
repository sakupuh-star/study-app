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

// 目標時間の取得・保存
function getGoalMinutes() {
  return Number(localStorage.getItem('goalMinutes') || 0);
}
function setGoalMinutes(minutes) {
  localStorage.setItem('goalMinutes', minutes);
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
  renderGoalProgress();
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

// 目標と進捗の表示
function renderGoalProgress() {
  const goal = getGoalMinutes();
  if (!goal) {
    document.getElementById('goal-progress').textContent = '';
    return;
  }
  // 今日の日付
  const today = new Date().toISOString().slice(0,10);
  const records = getRecords().filter(r => r.date === today);
  const total = records.reduce((sum, r) => sum + r.minutes, 0);
  let msg = `今日の勉強：${total}分 / 目標：${goal}分`;
  if (total >= goal) {
    msg += "　目標達成おめでとう！";
  } else {
    msg += `　あと${goal-total}分がんばって！`;
  }
  document.getElementById('goal-progress').textContent = msg;
}

// ====== グラフ期間切替機能ここから ======
let chartRange = 'day'; // デフォルトは「1日」表示
let chart; // Chart.jsインスタンス

// 期間切替ボタンのイベント登録
window.addEventListener('DOMContentLoaded', () => {
  const rangeBtns = document.querySelectorAll('#chart-range button');
  rangeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      chartRange = btn.dataset.range;
      rangeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderChart();
    });
  });
  // 初期表示で「1日」ボタンをactiveに
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

  const goal = getGoalMinutes();
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
          label: '目標時間',
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
// ====== グラフ期間切替機能ここまで ======

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

// 目標設定フォーム
document.getElementById('goal-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const minutes = Number(document.getElementById('goal-minutes').value);
  if (minutes > 0) {
    setGoalMinutes(minutes);
    renderGoalProgress();
    renderChart();
    e.target.reset();
  }
});

// 初期化
showCheerMessage();
renderRecords();
renderGoalProgress();
renderChart();

document.getElementById('stop-btn').style.display = 'none';
document.getElementById('start-btn').style.display = '';
document.getElementById('subject').disabled = false;
