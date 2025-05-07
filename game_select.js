
// キャラクター選択と音楽設定の保存
document.getElementById('zundamonBtn').addEventListener('click', () => {
    localStorage.setItem('selected_character', 'zundamon');
    alert('ずんだもんを選択しました');
});

document.getElementById('tsumugiBtn').addEventListener('click', () => {
    localStorage.setItem('selected_character', 'tsumugi');
    alert('つむぎを選択しました');
});

// 音楽設定の保存とゲーム開始
document.getElementById('startGameBtn').addEventListener('click', () => {
    const musicEnabled = document.getElementById('musicToggle').checked;
    localStorage.setItem('music_enabled', musicEnabled);

    // 選択したキャラクターがない場合、デフォルトで 'zundamon' を選択する
    const selectedCharacter = localStorage.getItem('selected_character') || 'zundamon';

    // キャラクター選択を確認してから遷移
    if (selectedCharacter) {
        location.href = "game.html"; // ゲーム画面に遷移
    } else {
        alert('キャラクターが選ばれていません');
    }
});
function saveHighScore(currentScore) {
    const scores = JSON.parse(localStorage.getItem("whackScores") || "[]");
    scores.push(currentScore);
    scores.sort((a, b) => b - a);
    const top3 = scores.slice(0, 3);
    localStorage.setItem("whackScores", JSON.stringify(top3));
  }