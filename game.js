const urlParams = new URLSearchParams(window.location.search);
const character = urlParams.get("character") || localStorage.getItem("selectedCharacter") || "zundamon";
const bgmEnabled = urlParams.get("bgm") === "1" || localStorage.getItem("playBGM") === "true";
const difficulty = localStorage.getItem("difficulty") || "normal";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const dpr = window.devicePixelRatio || 1;
canvas.style.width = `${window.innerWidth}px`;
canvas.style.height = `${window.innerHeight}px`;
canvas.width = window.innerWidth * dpr;
canvas.height = window.innerHeight * dpr;
ctx.scale(dpr, dpr);
ctx.imageSmoothingEnabled = true;

const bgm = document.getElementById("bgm");
const seCatch = document.getElementById("se-catch");
const seMiss = document.getElementById("se-miss");

let score = 0;
let timeLeft = 60;
let poisonCount = 0;
let objects = [];
let expressionTimeout = null;
let isGameOver = false;

let backgroundImages = ["春.jpg", "夏.jpg", "秋.jpg", "冬.jpg"];
let currentBG = 0;
function changeBackground() {
  document.getElementById("game-container").style.backgroundImage = `url('images/${backgroundImages[currentBG]}')`;
  currentBG = (currentBG + 1) % backgroundImages.length;
}
changeBackground();
setInterval(changeBackground, 15000);

const characterImages = {
  left: new Image(),
  right: new Image(),
  smileLeft: new Image(),
  smileRight: new Image(),
  sadLeft: new Image(),
  sadRight: new Image()
};

characterImages.left.src = `images/${character}_left.png`;
characterImages.right.src = `images/${character}_right.png`;
characterImages.smileLeft.src = `images/${character}_left_smile.png`;
characterImages.smileRight.src = `images/${character}_right_smile.png`;
characterImages.sadLeft.src = `images/${character}_left_sad.png`;
characterImages.sadRight.src = `images/${character}_right_sad.png`;

let currentCharacterImage = characterImages.right;

const foodImage = new Image();
const obstacleImage = new Image();
foodImage.src = `images/food_${character === "zundamon" ? "zunda" : "curryruce"}.png`;
obstacleImage.src = "images/obstacle.png";

const player = {
  x: canvas.width / dpr / 2,
  y: canvas.height / dpr - 150,
  width: 100,
  height: 140,
  speed: 10,
  moveLeft: false,
  moveRight: false,
  facing: "right"
};

// 難易度設定
let spawnInterval = 800;
let objectSpeedRange = [5, 8];
if (difficulty === "easy") {
  spawnInterval = 1000;
  objectSpeedRange = [3, 6];
} else if (difficulty === "hard") {
  spawnInterval = 600;
  objectSpeedRange = [7, 10];
}

function spawnObject() {
  const isPoison = Math.random() < 0.2;
  objects.push({
    x: Math.random() * (canvas.width / dpr - 50),
    y: -50,
    width: 50,
    height: 50,
    speed: objectSpeedRange[0] + Math.random() * (objectSpeedRange[1] - objectSpeedRange[0]),
    isPoison: isPoison
  });
}
setInterval(spawnObject, spawnInterval);

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(currentCharacterImage, player.x, player.y, player.width, player.height);
  for (let obj of objects) {
    const img = obj.isPoison ? obstacleImage : foodImage;
    ctx.drawImage(img, obj.x, obj.y, obj.width, obj.height);
  }
}

function update() {
  if (isGameOver) return;

  if (player.moveLeft) {
    player.x -= player.speed;
    player.facing = "left";
    if (!expressionTimeout) currentCharacterImage = characterImages.left;
  }
  if (player.moveRight) {
    player.x += player.speed;
    player.facing = "right";
    if (!expressionTimeout) currentCharacterImage = characterImages.right;
  }

  // 左右の壁に収まるように
  const maxX = canvas.width / dpr - player.width;
  player.x = Math.max(0, Math.min(maxX, player.x));

  for (let obj of objects) obj.y += obj.speed;

  for (let i = objects.length - 1; i >= 0; i--) {
    let obj = objects[i];
    if (
      obj.x < player.x + player.width &&
      obj.x + obj.width > player.x &&
      obj.y < player.y + player.height &&
      obj.y + obj.height > player.y
    ) {
      objects.splice(i, 1);
      clearTimeout(expressionTimeout);
      if (obj.isPoison) {
        poisonCount++;
        currentCharacterImage = player.facing === "left" ? characterImages.sadLeft : characterImages.sadRight;
        const missSound = new Audio("sounds/miss.mp3");
        missSound.play();
        if (poisonCount >= 3) endGame(false);
      } else {
        score++;
        currentCharacterImage = player.facing === "left" ? characterImages.smileLeft : characterImages.smileRight;
        const catchSound = new Audio("sounds/catch.mp3");
        catchSound.play();
      }
      expressionTimeout = setTimeout(() => {
        currentCharacterImage = player.facing === "left" ? characterImages.left : characterImages.right;
        expressionTimeout = null;
      }, 400);
    } else if (obj.y > canvas.height / dpr) {
      objects.splice(i, 1);
    }
  }

  document.getElementById("score").innerText = `スコア: ${score}`;
  document.getElementById("lives").innerText = `毒キャッチ可能数: ${3 - poisonCount}`;
}

function gameLoop() {
  draw();
  update();
  requestAnimationFrame(gameLoop);
}
gameLoop();

let timer = setInterval(() => {
  timeLeft--;
  document.getElementById("time").innerText = `残り時間: ${timeLeft}`;
  if (timeLeft <= 0) {
    clearInterval(timer);
    endGame(true);
  }
}, 1000);

function endGame(clear) {
  if (isGameOver) return;
  isGameOver = true;
  document.getElementById("result").classList.remove("hidden");
  document.getElementById("result-message").innerText = clear ? "ゲームクリア！" : "ゲームオーバー";
  document.getElementById("final-score").innerText = `スコア: ${score}`;
  bgm.pause();

  const scores = JSON.parse(localStorage.getItem("highScores") || "[]");
  scores.push(score);
  scores.sort((a, b) => b - a);
  localStorage.setItem("highScores", JSON.stringify(scores.slice(0, 3)));
}

document.addEventListener("keydown", (e) => {
  if (isGameOver) return;
  if (e.key === "ArrowLeft") player.moveLeft = true;
  if (e.key === "ArrowRight") player.moveRight = true;
});
document.addEventListener("keyup", (e) => {
  if (isGameOver) return;
  if (e.key === "ArrowLeft") player.moveLeft = false;
  if (e.key === "ArrowRight") player.moveRight = false;
});
canvas.addEventListener("touchstart", (e) => {
  if (isGameOver) return;
  e.preventDefault();
  const x = e.touches[0].clientX;
  if (x < window.innerWidth / 2) player.moveLeft = true;
  else player.moveRight = true;
}, { passive: false });
canvas.addEventListener("touchend", (e) => {
  e.preventDefault();
  if (isGameOver) return;
  player.moveLeft = false;
  player.moveRight = false;
});

// BGM再生処理
function tryPlayBGM() {
  if (bgmEnabled) {
    bgm.play().catch(() => {});
    document.removeEventListener("keydown", tryPlayBGM);
    document.removeEventListener("touchstart", tryPlayBGM);
    document.removeEventListener("click", tryPlayBGM);
  }
}
document.addEventListener("keydown", tryPlayBGM);
document.addEventListener("touchstart", tryPlayBGM);
document.addEventListener("click", tryPlayBGM);
