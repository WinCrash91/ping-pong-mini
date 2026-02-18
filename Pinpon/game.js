const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const W = canvas.width;
const H = canvas.height;

const VERSION = '1.0.2';

const paddle = { x: 20, y: H/2 - 40, w: 12, h: 80, speed: 6 };
const cpu = { x: W-32, y: H/2 - 40, w: 12, h: 80, speed: 5 };
const ball = { x: W/2, y: H/2, r: 8, vx: 0, vy: 0, speed: 6 };

let playerScore = 0;
let cpuScore = 0;
let waitingServe = true;

const keys = {};

window.addEventListener('keydown', (e) => {
  keys[e.key.toLowerCase()] = true;
  if (e.key === ' ') serve();
});
window.addEventListener('keyup', (e) => keys[e.key.toLowerCase()] = false);

// Touch / pointer controls (drag on left half)
let dragging = false;

// iOS Safari prefers touch events; also prevent scroll
canvas.style.touchAction = 'none';

function handleStart(x, y, pointerId) {
  if (x <= W * 0.6) {
    dragging = true;
    movePaddleTo(y);
  }
  if (waitingServe) serve();
}
function handleMove(y) {
  if (!dragging) return;
  movePaddleTo(y);
}
function handleEnd() {
  dragging = false;
}

canvas.addEventListener('pointerdown', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  if (canvas.setPointerCapture) canvas.setPointerCapture(e.pointerId);
  handleStart(x, y, e.pointerId);
  e.preventDefault();
});
canvas.addEventListener('pointermove', (e) => {
  const rect = canvas.getBoundingClientRect();
  const y = e.clientY - rect.top;
  handleMove(y);
  e.preventDefault();
});
canvas.addEventListener('pointerup', (e) => {
  handleEnd();
  if (canvas.releasePointerCapture) canvas.releasePointerCapture(e.pointerId);
  e.preventDefault();
});
canvas.addEventListener('pointercancel', () => handleEnd());

canvas.addEventListener('touchstart', (e) => {
  const rect = canvas.getBoundingClientRect();
  const t = e.touches[0];
  const x = t.clientX - rect.left;
  const y = t.clientY - rect.top;
  handleStart(x, y);
  e.preventDefault();
}, { passive: false });
canvas.addEventListener('touchmove', (e) => {
  const rect = canvas.getBoundingClientRect();
  const t = e.touches[0];
  const y = t.clientY - rect.top;
  handleMove(y);
  e.preventDefault();
}, { passive: false });
canvas.addEventListener('touchend', (e) => { handleEnd(); e.preventDefault(); }, { passive: false });

function movePaddleTo(y) {
  paddle.y = y - paddle.h / 2;
  paddle.y = Math.max(0, Math.min(H - paddle.h, paddle.y));
}

function serve() {
  if (!waitingServe) return;
  waitingServe = false;
  const dir = Math.random() > 0.5 ? 1 : -1;
  ball.vx = dir * ball.speed;
  ball.vy = (Math.random() * 2 - 1) * ball.speed * 0.6;
}

function resetBall(scoredByPlayer) {
  if (scoredByPlayer) playerScore++; else cpuScore++;
  ball.x = W/2; ball.y = H/2; ball.vx = 0; ball.vy = 0;
  waitingServe = true;
}

function update() {
  // Player movement
  if (keys['w']) paddle.y -= paddle.speed;
  if (keys['s']) paddle.y += paddle.speed;
  paddle.y = Math.max(0, Math.min(H - paddle.h, paddle.y));

  // CPU movement (simple AI)
  const target = ball.y - cpu.h/2;
  if (cpu.y < target) cpu.y += cpu.speed;
  else if (cpu.y > target) cpu.y -= cpu.speed;
  cpu.y = Math.max(0, Math.min(H - cpu.h, cpu.y));

  if (!waitingServe) {
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Wall bounce
    if (ball.y - ball.r < 0 || ball.y + ball.r > H) ball.vy *= -1;

    // Paddle collisions
    if (ball.x - ball.r < paddle.x + paddle.w &&
        ball.y > paddle.y && ball.y < paddle.y + paddle.h) {
      ball.vx *= -1;
      // add spin
      const delta = (ball.y - (paddle.y + paddle.h/2)) / (paddle.h/2);
      ball.vy = delta * ball.speed;
      ball.x = paddle.x + paddle.w + ball.r;
    }

    if (ball.x + ball.r > cpu.x &&
        ball.y > cpu.y && ball.y < cpu.y + cpu.h) {
      ball.vx *= -1;
      const delta = (ball.y - (cpu.y + cpu.h/2)) / (cpu.h/2);
      ball.vy = delta * ball.speed;
      ball.x = cpu.x - ball.r;
    }

    // Score
    if (ball.x < 0) resetBall(false);
    if (ball.x > W) resetBall(true);
  }
}

function draw() {
  ctx.clearRect(0, 0, W, H);

  // center line
  ctx.strokeStyle = '#333';
  ctx.setLineDash([8, 8]);
  ctx.beginPath();
  ctx.moveTo(W/2, 0); ctx.lineTo(W/2, H); ctx.stroke();
  ctx.setLineDash([]);

  // paddles
  ctx.fillStyle = '#eee';
  ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);
  ctx.fillRect(cpu.x, cpu.y, cpu.w, cpu.h);

  // ball
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
  ctx.fill();

  // score
  ctx.fillStyle = '#bbb';
  ctx.font = '20px Arial';
  ctx.fillText(playerScore, W/2 - 40, 30);
  ctx.fillText(cpuScore, W/2 + 25, 30);

  // version
  ctx.font = '12px Arial';
  ctx.fillStyle = '#666';
  ctx.fillText('v' + VERSION, W - 44, H - 10);

  if (waitingServe) {
    ctx.font = '14px Arial';
    ctx.fillText('Pulsa ESPACIO para sacar', W/2 - 90, H - 20);
  }
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();
