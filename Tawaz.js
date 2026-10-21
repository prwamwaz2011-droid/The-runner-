const game = document.getElementById("game");
const player = document.getElementById("player");
const objectsContainer = document.getElementById("objects");

const scoreDisplay = document.getElementById("score");
const coinsDisplay = document.getElementById("coins");

const startScreen = document.getElementById("start-screen");
const gameOverScreen = document.getElementById("game-over");

const finalScore = document.getElementById("final-score");
const finalCoins = document.getElementById("final-coins");

const startButton = document.getElementById("start-btn");
const restartButton = document.getElementById("restart-btn");

const leftButton = document.getElementById("left-btn");
const rightButton = document.getElementById("right-btn");
const jumpButton = document.getElementById("jump-btn");

let lane = 1;

let score = 0;
let coins = 0;

let running = false;
let jumping = false;

let jumpTimeout;
let animationFrame;
let lastTime = 0;

let spawnTimer = 0;
let difficultyTimer = 0;
let gameSpeed = 230;

let objects = [];

const lanePositions = [30, 50, 70];

function updatePlayerPosition() {
player.style.left = lanePositions[lane] + "%";
}

function moveLeft() {
if (!running) return;

if (lane > 0) {
    lane--;
    updatePlayerPosition();
}

}

function moveRight() {
if (!running) return;

if (lane < 2) {
    lane++;
    updatePlayerPosition();
}

}

function jump() {
if (!running || jumping) return;

jumping = true;
player.classList.add("jumping");

clearTimeout(jumpTimeout);

jumpTimeout = setTimeout(() => {
    jumping = false;
    player.classList.remove("jumping");
}, 650);

}

function createObject() {
const isCoin = Math.random() < 0.42;

const object = document.createElement("div");

object.className = isCoin ? "object coin" : "object obstacle";
object.textContent = isCoin
    ? "🪙"
    : ["🪨", "🪵", "🌳"][Math.floor(Math.random() * 3)];

const objectLane = Math.floor(Math.random() * 3);

object.style.left = lanePositions[objectLane] + "%";
object.style.top = "-50px";

objectsContainer.appendChild(object);

objects.push({
    element: object,
    lane: objectLane,
    y: -50,
    type: isCoin ? "coin" : "obstacle",
    collected: false
});

}

function clearObjects() {
objects.forEach(object => object.element.remove());
objects = [];
}

function startGame() {
cancelAnimationFrame(animationFrame);
clearTimeout(jumpTimeout);
clearObjects();

lane = 1;
score = 0;
coins = 0;

gameSpeed = 230;
spawnTimer = 0;
difficultyTimer = 0;
lastTime = 0;

jumping = false;
running = true;

player.classList.remove("jumping");

scoreDisplay.textContent = score;
coinsDisplay.textContent = coins;

updatePlayerPosition();

startScreen.classList.add("hidden");
gameOverScreen.classList.add("hidden");

animationFrame = requestAnimationFrame(gameLoop);

}

function endGame() {
if (!running) return;

running = false;

cancelAnimationFrame(animationFrame);
clearTimeout(jumpTimeout);

finalScore.textContent = score;
finalCoins.textContent = coins;

gameOverScreen.classList.remove("hidden");

}

function gameLoop(timestamp) {
if (!running) return;

if (!lastTime) {
    lastTime = timestamp;
}

// Limit large time jumps if the browser tab becomes inactive.
const deltaTime = Math.min((timestamp - lastTime) / 1000, 0.05);

lastTime = timestamp;

score += Math.floor(deltaTime * 10);
scoreDisplay.textContent = score;

spawnTimer += deltaTime;
difficultyTimer += deltaTime;

if (spawnTimer >= 0.9) {
    createObject();
    spawnTimer = 0;
}

if (difficultyTimer >= 8) {
    gameSpeed = Math.min(gameSpeed + 18, 500);
    difficultyTimer = 0;
}

const gameHeight = game.clientHeight;
const playerCollisionY = gameHeight - 100;

for (let i = objects.length - 1; i >= 0; i--) {
    const object = objects[i];

    object.y += gameSpeed * deltaTime;

    object.element.style.top = object.y + "px";

    const objectHeight = object.element.offsetHeight || 35;

    const verticalDistance = Math.abs(
        object.y + objectHeight / 2 - playerCollisionY
    );

    const sameLane = object.lane === lane;
    const closeEnough = verticalDistance < 38;

    if (
        sameLane &&
        closeEnough &&
        !object.collected
    ) {
        if (object.type === "coin") {
            coins++;
            coinsDisplay.textContent = coins;

            object.collected = true;
            object.element.remove();

            objects.splice(i, 1);
            continue;
        } else if (!jumping) {
            endGame();
            return;
        }
    }

    if (object.y > gameHeight + 60) {
        object.element.remove();
        objects.splice(i, 1);
    }
}

animationFrame = requestAnimationFrame(gameLoop);

}

startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", startGame);

leftButton.addEventListener("click", moveLeft);
rightButton.addEventListener("click", moveRight);
jumpButton.addEventListener("click", jump);

document.addEventListener("keydown", event => {
if (
["ArrowLeft", "ArrowRight", "ArrowUp", " "].includes(event.key)
) {
event.preventDefault();
}

if (event.repeat) return;

if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
    moveLeft();
}

if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
    moveRight();
}

if (
    event.key === "ArrowUp" ||
    event.key === " " ||
    event.key.toLowerCase() === "w"
) {
    jump();
}

});

let touchStartX = 0;
let touchStartY = 0;

game.addEventListener("touchstart", event => {
const touch = event.changedTouches[0];

touchStartX = touch.clientX;
touchStartY = touch.clientY;

}, { passive: true });

game.addEventListener("touchend", event => {
const touch = event.changedTouches[0];

const dx = touch.clientX - touchStartX;
const dy = touch.clientY - touchStartY;

if (Math.max(Math.abs(dx), Math.abs(dy)) < 30) {
    return;
}

if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 0) {
        moveRight();
    } else {
        moveLeft();
    }
} else if (dy < 0) {
    jump();
}

}, { passive: true });

updatePlayerPosition();