function getGoalMinutes(mode) {
  return Number(localStorage.getItem('goalMinutes_' + mode) || 0);
}
function setGoalMinutes(mode, minutes) {
  localStorage.setItem('goalMinutes_' + mode, minutes);
}

function renderGoalProgress(mode) {
  const goal = getGoalMinutes(mode);
  const progressElem = document.getElementById('goal-progress-' + mode);
  if (!goal) {
    progressElem.textContent = '未設定';
    return;
  }
  progressElem.textContent = `現在の設定：${goal}分`;
}

// 設定フォーム
document.getElementById('goal-form-day').addEventListener('submit', (e) => {
  e.preventDefault();
  const minutes = Number(document.getElementById('goal-minutes-day').value);
  if (minutes > 0) {
    setGoalMinutes('day', minutes);
    renderGoalProgress('day');
    e.target.reset();
  }
});
document.getElementById('goal-form-week').addEventListener('submit', (e) => {
  e.preventDefault();
  const minutes = Number(document.getElementById('goal-minutes-week').value);
  if (minutes > 0) {
    setGoalMinutes('week', minutes);
    renderGoalProgress('week');
    e.target.reset();
  }
});
document.getElementById('goal-form-month').addEventListener('submit', (e) => {
  e.preventDefault();
  const minutes = Number(document.getElementById('goal-minutes-month').value);
  if (minutes > 0) {
    setGoalMinutes('month', minutes);
    renderGoalProgress('month');
    e.target.reset();
  }
});

// 初期化
renderGoalProgress('day');
renderGoalProgress('week');
renderGoalProgress('month');