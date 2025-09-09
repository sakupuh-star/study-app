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

// 起動時に応援コメント表示
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
function addRecord(subject, minutes, memo) {
  const records = getRecords();
  records.push({
    date: new Date().toISOString().slice(0,10),
    subject,
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
    const li = document.createElement('li');
    li.textContent = `${r.date}｜${r.subject}｜${r.minutes}分${r.memo ? '｜' + r.memo : ''}`;
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

// グラフ描画
let chart;
function renderChart() {
  const ctx = document.getElementById('studyChart').getContext('2d');
  const records = getRecords();

  // 日付ごとに合計
  const dateMap = {};
  records.forEach(r => {
    dateMap[r.date] = (dateMap[r.date] || 0) + r.minutes;
  });
  const labels = Object.keys(dateMap).sort();
  const data = labels.map(date => dateMap[date]);

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

// 勉強記録フォーム
document.getElementById('study-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const subject = document.getElementById('subject').value.trim();
  const minutes = document.getElementById('minutes').value;
  const memo = document.getElementById('memo').value.trim();
  if (subject && minutes > 0) {
    addRecord(subject, minutes, memo);
    e.target.reset();
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
