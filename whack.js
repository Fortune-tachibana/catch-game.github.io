document.addEventListener("DOMContentLoaded", () => {
  const slots = document.querySelectorAll(".slot");
  const timeDisplay = document.getElementById("time");
  const scoreDisplay = document.getElementById("score");
  const startBtn = document.getElementById("startBtn");

  let score = 0;
  let timeLeft = 60;
  let gameInterval;
  let countdownInterval;

  const characters = [
    { src: "images/zundamon_neutral.png", good: true },
    { src: "images/tsumugi_neutral.png", good: true },
    { src: "images/zundamon_sad.png", good: false },
    { src: "images/tsumugi_sad.png", good: false }
  ];

  function spawnCharacter() {
    // すべてのスロットを初期化
    slots.forEach(slot => {
      const img = slot.querySelector("img");
      img.style.display = "none";
      img.onclick = null;
    });
  
    const randomSlot = slots[Math.floor(Math.random() * slots.length)];
    const character = characters[Math.floor(Math.random() * characters.length)];
    const img = randomSlot.querySelector("img");
    img.src = character.src;
    img.style.display = "block";
  
    img.onclick = () => {
      if (character.good) score++;
      else score--;
      scoreDisplay.innerText = `スコア: ${score}`;
      img.style.display = "none";
    };
  
    setTimeout(() => {
      img.style.display = "none";
    }, showTime);
  }
  

  function startGame() {
    score = 0;
    timeLeft = 60;
    scoreDisplay.innerText = `スコア: ${score}`;
    timeDisplay.innerText = `残り時間: ${timeLeft}`;
    gameInterval = setInterval(spawnCharacter, 600);
    countdownInterval = setInterval(() => {
      timeLeft--;
      timeDisplay.innerText = `残り時間: ${timeLeft}`;
      if (timeLeft <= 0) endGame();
    }, 1000);
  }

  function endGame() {
    clearInterval(gameInterval);
    clearInterval(countdownInterval);
    slots.forEach(slot => slot.innerHTML = "");
    alert(`ゲーム終了！あなたのスコア: ${score}`);
  }

  startBtn.addEventListener("click", startGame);
});
