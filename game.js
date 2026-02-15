const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const W = canvas.width;
const H = canvas.height;

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
canvas.addEventListener('pointerdown', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  if (x <= W * 0.6) { // left side control
    dragging = true;
    movePaddleTo(y);
  }
  canvas.setPointerCapture(e.pointerId);
  if (waitingServe) serve();
});
canvas.addEventListener('pointermove', (e) => {
  if (!dragging) return;
  const rect = canvas.getBoundingClientRect();
  const y = e.clientY - rect.top;
  movePaddleTo(y);
});
canvas.addEventListener('pointerup', (e) => {
  dragging = false;
  canvas.releasePointerCapture(e.pointerId);
});
canvas.addEventListener('pointercancel', (e) => {
  dragging = false;
});

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
