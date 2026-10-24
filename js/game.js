// Mini-jeu « pause café » : un crayon saute par-dessus des retours clients.
// Ne démarre que si on le lance : rien ne bouge tout seul.
(() => {
  const canvas = document.getElementById("game");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const startBtn = document.getElementById("game-start");
  const status = document.getElementById("game-status");
  const css = getComputedStyle(document.documentElement);
  const color = (name) => css.getPropertyValue(name).trim();
  const COLORS = {
    ink: color("--ink"), cream: color("--cream"), yellow: color("--yellow"),
    blue: color("--blue"), red: color("--red")
  };

  const H = 220, GROUND = 180, GRAVITY = 0.62, JUMP = -11.5;
  let W = 600;
  let texts = null;
  let state = "idle"; // idle | running | over
  let player, obstacles, speed, score, best = 0, spawnIn, raf = null, lastTime = 0;

  function resize() {
    const ratio = window.devicePixelRatio || 1;
    W = canvas.parentElement.clientWidth;
    canvas.width = W * ratio;
    canvas.height = H * ratio;
    canvas.style.height = `${H}px`;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    draw();
  }

  function reset() {
    player = { x: 56, y: GROUND, vy: 0, w: 34, h: 34 };
    obstacles = [];
    speed = 5;
    score = 0;
    spawnIn = 60;
  }

  function start() {
    reset();
    state = "running";
    status.textContent = "";
    startBtn.hidden = true;
    canvas.focus();
    lastTime = performance.now();
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(loop);
  }

  function jump() {
    if (state !== "running") { start(); return; }
    if (player.y >= GROUND) player.vy = JUMP;
  }

  function spawn() {
    const list = texts.obstacles;
    const label = list[Math.floor(Math.random() * list.length)];
    ctx.font = "600 14px 'Figtree', sans-serif";
    const w = ctx.measureText(label).width + 28;
    const tints = [COLORS.yellow, COLORS.cream, "#DCE4FB"];
    obstacles.push({ x: W + 10, w, h: 34, label, tint: tints[Math.floor(Math.random() * tints.length)] });
    spawnIn = 70 + Math.random() * 70 - Math.min(speed * 3, 30);
  }

  function loop(now) {
    const step = Math.min((now - lastTime) / 16.67, 3);
    lastTime = now;

    player.vy += GRAVITY * step;
    player.y = Math.min(player.y + player.vy * step, GROUND);
    if (player.y >= GROUND) player.vy = 0;

    spawnIn -= step;
    if (spawnIn <= 0) spawn();

    obstacles.forEach((o) => { o.x -= speed * step; });
    obstacles = obstacles.filter((o) => o.x + o.w > -10);

    speed += 0.0025 * step;
    score += 0.1 * step;

    const hit = obstacles.some((o) =>
      player.x + 6 < o.x + o.w && player.x + player.w - 6 > o.x &&
      player.y > GROUND - o.h + 6
    );

    draw();

    if (hit) {
      state = "over";
      best = Math.max(best, Math.floor(score));
      status.textContent = texts.over.replace("{s}", Math.floor(score));
      startBtn.textContent = texts.again;
      startBtn.hidden = false;
      draw();
      return;
    }
    raf = requestAnimationFrame(loop);
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawPencil(x, y) {
    // Crayon penché, la pointe vers l'avant.
    ctx.save();
    ctx.translate(x + 17, y - 17);
    ctx.rotate(player && player.vy < 0 ? -0.5 : -0.2);
    ctx.lineWidth = 3;
    ctx.strokeStyle = COLORS.ink;
    ctx.fillStyle = COLORS.yellow;
    roundRect(-22, -8, 34, 16, 3);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = COLORS.red;
    roundRect(-30, -8, 10, 16, 4);
    ctx.fill(); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(12, -8); ctx.lineTo(26, 0); ctx.lineTo(12, 8); ctx.closePath();
    ctx.fillStyle = COLORS.cream;
    ctx.fill(); ctx.stroke();
    ctx.restore();
  }

  function draw() {
    if (!texts) return;
    ctx.clearRect(0, 0, W, H);

    // Sol dessiné à la main
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let x = 0; x <= W; x += 20) ctx.lineTo(x, GROUND + 2 + Math.sin(x * 0.07) * 1.5);
    ctx.stroke();

    (obstacles || []).forEach((o) => {
      const y = GROUND - o.h;
      ctx.fillStyle = o.tint;
      roundRect(o.x, y, o.w, o.h, 17);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(o.x + 16, y + o.h - 1); ctx.lineTo(o.x + 10, y + o.h + 9); ctx.lineTo(o.x + 28, y + o.h - 1);
      ctx.fill();
      ctx.fillStyle = COLORS.ink;
      ctx.font = "600 14px 'Figtree', sans-serif";
      ctx.textBaseline = "middle";
      ctx.fillText(o.label, o.x + 14, y + o.h / 2 + 1);
    });

    drawPencil(player ? player.x : 56, player ? player.y : GROUND);

    ctx.fillStyle = COLORS.ink;
    ctx.font = "20px 'Luckiest Guy', sans-serif";
    ctx.textBaseline = "top";
    ctx.textAlign = "right";
    ctx.fillText(`${texts.score} ${Math.floor(score || 0)}   ${texts.best} ${best}`, W - 12, 12);
    ctx.textAlign = "left";

    if (state === "idle") {
      ctx.font = "600 15px 'Figtree', sans-serif";
      ctx.fillText(texts.hint, 12, 16);
    }
  }

  canvas.addEventListener("keydown", (event) => {
    if (event.code === "Space" || event.code === "ArrowUp") {
      event.preventDefault();
      jump();
    }
  });
  canvas.addEventListener("pointerdown", jump);
  startBtn.addEventListener("click", start);

  // Le jeu se met en pause s'il sort de l'écran.
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting && state === "running") {
        cancelAnimationFrame(raf);
        state = "over";
        startBtn.textContent = texts.again;
        startBtn.hidden = false;
      }
    }).observe(canvas);
  }

  document.addEventListener("langchange", (event) => {
    texts = event.detail.t("game");
    startBtn.textContent = state === "over" ? texts.again : texts.start;
    canvas.setAttribute("aria-label", texts.aria);
    draw();
  });

  window.addEventListener("resize", resize);
  if (document.fonts) document.fonts.ready.then(draw);
  reset();
  resize();
})();
