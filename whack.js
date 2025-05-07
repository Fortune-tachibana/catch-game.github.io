document.addEventListener("DOMContentLoaded", () => {
  const slots = document.querySelectorAll(".slot");
  const timeDisplay = document.getElementById("time");
  const scoreDisplay = document.getElementById("score");
  const startBtn = document.getElementById("startBtn");

  // URL パラメータ取得
  const params = new URLSearchParams(window.location.search);
  const selectedChar = params.get("char") || "zundamon";
  const difficulty = params.get("diff") || "normal";
  const bgmOn = params.get("bgm") === "true";

  let score = 0;
  let timeLeft = 60;
  let gameInterval;
  let countdownInterval;
  let bgmAudio;

  // 出現間隔（ms） - 新しいキャラを出す頻度
  const intervalMap = {
    easy: 4000,
    normal: 1600,
    hard: 1000
  };

  // 表示時間（ms） - キャラが見える時間（出現中に叩ける時間）
  const durationMap = {
    easy: 4000,   // interval より長く
    normal: 2000,
    hard: 1200
  };

  const characters = [
    { src: `images/${selectedChar}_neutral.png`, good: true, point: 1 },
    { src: `images/${selectedChar}_sad.png`, good: false, point: -1 },
    { src: `images/${selectedChar}_smile.png`, good: true, point: 2 }
  ];

  function spawnCharacter() {
    const emptySlots = Array.from(slots).filter(slot => slot.children.length === 0);
    if (emptySlots.length === 0) return;

    const randomSlot = emptySlots[Math.floor(Math.random() * emptySlots.length)];
    const character = characters[Math.floor(Math.random() * characters.length)];
    const img = document.createElement("img");
    img.src = character.src;
    img.classList.add("active");
    img.style.cursor = "pointer";
    img.style.display = "block";
    img.onclick = () => {
      score += character.point;
      scoreDisplay.innerText = `スコア: ${score}`;
      img.remove();
    };
    randomSlot.appendChild(img);

    console.log("difficulty:", difficulty);
    console.log("duration:", durationMap[difficulty]);
    setTimeout(() => {
      console.log("timeout fired for:", img); // どの画像に対してタイマーが発火したか
      if (img.parentNode === randomSlot) {
        randomSlot.innerHTML = "";
        console.log("character removed");
      }
    }, durationMap[difficulty]);
  }


  function startGame() {
    score = 0;
    timeLeft = 60;
    scoreDisplay.innerText = `スコア: ${score}`;
    timeDisplay.innerText = `残り時間: ${timeLeft}`;

    if (bgmOn) {
      bgmAudio = new Audio("sounds/rough.mp3");
      bgmAudio.loop = true;
      bgmAudio.play();
    }

    gameInterval = setInterval(spawnCharacter, intervalMap[difficulty]);
    countdownInterval = setInterval(() => {
      timeLeft--;
      timeDisplay.innerText = `残り時間: ${timeLeft}`;
      if (timeLeft <= 0) endGame();
    }, 1000);
  }

  function endGame() {
    clearInterval(gameInterval);
    clearInterval(countdownInterval);
    slots.forEach(slot => slot.innerHTML = "")

    if (bgmAudio) {
      bgmAudio.pause();
      bgmAudio = null;
    }

    // ハイスコア保存
    saveHighScore(score); // ハイスコアを保存する関数を呼び出す
    alert(`ゲーム終了！あなたのスコア: ${score}`);
  }

  function saveHighScore(currentScore) {
    const scores = JSON.parse(localStorage.getItem("whackScores") || "[]");
    scores.push(currentScore);
    scores.sort((a, b) => b - a);
    const top3 = scores.slice(0, 3);
    localStorage.setItem("whackScores", JSON.stringify(top3));
  }

  startBtn.addEventListener("click", startGame);
});