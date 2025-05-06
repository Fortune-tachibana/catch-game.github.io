const urlParams = new URLSearchParams(window.location.search);
const character = urlParams.get("character") || localStorage.getItem("selectedCharacter") || "zundamon";
const bgmEnabled = urlParams.get("bgm") === "1" || localStorage.getItem("playBGM") === "true";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const dpr = window.devicePixelRatio || 1;

// スタイルサイズ（表示上のサイズ）
canvas.style.width = `${window.innerWidth}px`;
canvas.style.height = `${window.innerHeight}px`;

// 実サイズ（レンダリング解像度）
canvas.width = window.innerWidth * dpr;
canvas.height = window.innerHeight * dpr;

// スケーリング（描画座標を論理サイズに戻す）
ctx.scale(dpr, dpr);

// 画像補間を有効化（高画質に）
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
  x: window.innerWidth / 2,
  y: window.innerHeight - 150,
  width: 100,
  height: 140,
  speed: 10,
  moveLeft: false,
  moveRight: false,
  facing: "right"
};

function spawnObject() {
  const isPoison = Math.random() < 0.2;
  objects.push({
    x: Math.random() * (canvas.width - 50),
    y: -50,
    width: 50,
    height: 50,
    speed: 5 + Math.random() * 3,
    isPoison: isPoison
  });
}
setInterval(spawnObject, 800);

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(currentCharacterImage, player.x, player.y, player.width, player.height);
  for (let obj of objects) {
    const img = obj.isPoison ? obstacleImage : foodImage;
    ctx.drawImage(img, obj.x, obj.y, obj.width, obj.height);
  }
}

function update() {
  if (isGameOver) return; // ← 追加：終了後は何も更新しない
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

  player.x = Math.max(0, Math.min(window.innerWidth - player.width, player.x));

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
    } else if (obj.y > canvas.height) {
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
  if (isGameOver) return; // 念のため多重呼び出し防止
  isGameOver = true;      // ← 追加：操作無効化のため

  document.getElementById("result").classList.remove("hidden");
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
  if (isGameOver) return; // ← 追加
  if (e.key === "ArrowLeft") player.moveLeft = true;
  if (e.key === "ArrowRight") player.moveRight = true;
});

document.addEventListener("keyup", (e) => {
  if (isGameOver) return; // ← 追加
  if (e.key === "ArrowLeft") player.moveLeft = false;
  if (e.key === "ArrowRight") player.moveRight = false;
});

canvas.addEventListener("touchstart", (e) => {
  if (isGameOver) return; // ← 追加
  e.preventDefault();
  const x = e.touches[0].clientX;
  if (x < window.innerWidth / 2) player.moveLeft = true;
  else player.moveRight = true;
}, { passive: false });

canvas.addEventListener("touchend", (e) => {
  e.preventDefault();
  if (isGameOver) return; // ← 追加
  player.moveLeft = false;
  player.moveRight = false;
});

// BGMをユーザーの操作で再生
function tryPlayBGM() {
  if (bgmEnabled) {
    bgm.play().catch(() => {});
    // イベントリスナーを削除して、再生を確実に一度だけ実行
    document.removeEventListener("keydown", tryPlayBGM);
    document.removeEventListener("touchstart", tryPlayBGM);
    document.removeEventListener("click", tryPlayBGM);
  }
}

// 最初のユーザー操作時にBGMを再生するように設定
document.addEventListener("keydown", tryPlayBGM);
document.addEventListener("touchstart", tryPlayBGM);
document.addEventListener("click", tryPlayBGM);
