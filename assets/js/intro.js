// Lay Low Cafe — opening animation.
// A line-art disco ball spins and sparkles, its mirror tiles fly apart and
// re-form as the LAY LOW logo, and the logo drops into its place in the header.
//
// The tiny script in <head> adds html.intro (which hides the page) only when the
// intro should play: once per browser tab, never with reduced motion. This file
// does nothing if that class is missing, and the head script removes the class
// on its own after a few seconds if anything here fails.
(() => {
  const root = document.documentElement;
  if (!root.classList.contains("intro")) return;

  const INK = "#1f1c16";
  const GOLD = "#f3b53b";
  const BG = "#f6efe1";
  const T = { spin: 1700, morph: 950, fade: 350, fly: 800 }; // ms

  const brand = document.querySelector(".brand img");
  const overlay = document.createElement("div");
  overlay.className = "intro-overlay";
  overlay.setAttribute("aria-hidden", "true");
  const canvas = document.createElement("canvas");
  const skip = document.createElement("button");
  skip.type = "button";
  skip.className = "intro-skip";
  skip.textContent = "Skip intro";
  overlay.append(canvas, skip);
  document.body.append(overlay);

  const ctx = canvas.getContext("2d");
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let W, H, cx, cy, R;
  function resize() {
    W = innerWidth; H = innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + "px"; canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    R = Math.min(W, H) * 0.24;
    cx = W / 2; cy = H / 2 + R * 0.12;
  }
  resize();

  // ---------- Sphere geometry ----------
  const TILT = 0.32;                 // look slightly down on the ball
  const LATS = 12, LONGS = 18;       // grid of mirror tiles
  const lat = (i) => -Math.PI / 2 + (i / LATS) * Math.PI;
  const lon = (j, rot) => (j / LONGS) * Math.PI * 2 + rot;

  function project(la, lo) {
    const x = Math.cos(la) * Math.sin(lo);
    const y = Math.sin(la);
    const z = Math.cos(la) * Math.cos(lo);
    // rotate around X by TILT
    const y2 = y * Math.cos(TILT) - z * Math.sin(TILT);
    const z2 = y * Math.sin(TILT) + z * Math.cos(TILT);
    return { x: cx + x * R, y: cy - y2 * R, z: z2 };
  }

  function strokePath(points, alpha) {
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    points.forEach((p, k) => (k ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
    ctx.stroke();
  }

  // Draw a curve in front and back halves (back half faint, for depth)
  function strokeCurve(sample) {
    let run = [], front = null;
    for (let s = 0; s <= 48; s++) {
      const p = sample(s / 48);
      const isFront = p.z > 0;
      if (front !== null && isFront !== front) {
        run.push(p);
        strokePath(run, front ? 1 : 0.12);
        run = [];
      }
      run.push(p);
      front = isFront;
    }
    strokePath(run, front ? 1 : 0.12);
  }

  // Twinkling tiles: [latIndex, lonIndex, born]
  const flashes = [];
  function drawBall(rot, t) {
    // string
    const top = project(Math.PI / 2, 0);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, top.y); ctx.stroke();

    // tile flashes (behind the grid lines)
    if (Math.random() < 0.55) flashes.push([1 + Math.floor(Math.random() * (LATS - 2)), Math.floor(Math.random() * LONGS), t]);
    for (let k = flashes.length - 1; k >= 0; k--) {
      const [i, j, born] = flashes[k];
      const age = (t - born) / 450;
      if (age > 1) { flashes.splice(k, 1); continue; }
      const c = [project(lat(i), lon(j, rot)), project(lat(i + 1), lon(j, rot)), project(lat(i + 1), lon(j + 1, rot)), project(lat(i), lon(j + 1, rot))];
      if (c.some((p) => p.z <= 0.05)) continue;
      ctx.globalAlpha = Math.sin(age * Math.PI) * 0.85;
      ctx.fillStyle = GOLD;
      ctx.beginPath(); c.forEach((p, n) => (n ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))); ctx.fill();
    }

    // grid
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.8;
    for (let i = 1; i < LATS; i++) strokeCurve((u) => project(lat(i), u * Math.PI * 2));
    for (let j = 0; j < LONGS; j++) strokeCurve((u) => project(-Math.PI / 2 + u * Math.PI, lon(j, rot)));

    // outline
    ctx.globalAlpha = 1;
    ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
  }

  // Four-point sparkles around the ball, like the reference art
  const sparkles = [
    { dx: -1.25, dy: -0.95, s: 0.26, p: 0 },
    { dx: -0.78, dy: -0.88, s: 0.12, p: 0.35 },
    { dx: -1.05, dy: -0.55, s: 0.15, p: 0.7 },
    { dx: 1.12, dy: 0.95, s: 0.2, p: 0.5 },
    { dx: 1.2, dy: -0.75, s: 0.1, p: 0.15 },
  ];
  function sparkle(x, y, size) {
    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.quadraticCurveTo(x, y, x + size, y);
    ctx.quadraticCurveTo(x, y, x, y + size);
    ctx.quadraticCurveTo(x, y, x - size, y);
    ctx.quadraticCurveTo(x, y, x, y - size);
    ctx.stroke();
  }
  function drawSparkles(t, fadeOut) {
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2;
    sparkles.forEach((s) => {
      const pulse = 0.65 + 0.35 * Math.sin((t / 260) + s.p * Math.PI * 2);
      ctx.globalAlpha = (1 - fadeOut);
      sparkle(cx + s.dx * R, cy + s.dy * R, s.s * R * pulse);
    });
  }

  // ---------- Logo target points ----------
  const logo = new Image();
  logo.src = brand ? brand.currentSrc || brand.src : "assets/img/logo.png";
  let targets = [], logoRect;
  function buildTargets() {
    const w = Math.min(W * 0.78, 560);
    const h = w * (logo.naturalHeight / logo.naturalWidth || 0.253);
    logoRect = { x: cx - w / 2, y: H / 2 - h / 2, w, h };
    const off = document.createElement("canvas");
    off.width = Math.round(w); off.height = Math.round(h);
    const o = off.getContext("2d");
    o.drawImage(logo, 0, 0, off.width, off.height);
    const data = o.getImageData(0, 0, off.width, off.height).data;
    const step = Math.max(3, Math.round(w / 150));
    for (let y = 0; y < off.height; y += step)
      for (let x = 0; x < off.width; x += step)
        if (data[(y * off.width + x) * 4 + 3] > 140) targets.push({ x: logoRect.x + x, y: logoRect.y + y });
  }

  // Particles start on the visible tile corners of the ball
  function buildParticles(rot) {
    const starts = [];
    for (let i = 1; i < LATS; i++)
      for (let j = 0; j < LONGS * 2; j++) {
        const p = project(lat(i), (j / (LONGS * 2)) * Math.PI * 2 + rot);
        if (p.z > 0) starts.push(p);
      }
    // add points along the outline so the silhouette dissolves too
    for (let a = 0; a < 60; a++) starts.push({ x: cx + Math.cos(a / 60 * Math.PI * 2) * R, y: cy + Math.sin(a / 60 * Math.PI * 2) * R });
    const shuffled = targets.slice().sort(() => Math.random() - 0.5);
    return shuffled.map((tgt, k) => {
      const s = starts[k % starts.length];
      return { sx: s.x, sy: s.y, tx: tgt.x, ty: tgt.y, delay: Math.random() * 0.35, spin: Math.random() * Math.PI };
    });
  }

  const ease = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);

  // ---------- Timeline ----------
  let start = null, particles = null, done = false, raf;
  const rotAt = (t) => t / 520; // radians

  function frame(now) {
    if (done) return;
    if (start === null) start = now;
    const t = now - start;
    ctx.clearRect(0, 0, W, H);

    if (t < T.spin) {
      // ball eases in from slightly above, then spins
      const drop = Math.min(t / 600, 1);
      ctx.save();
      ctx.translate(0, -(1 - ease(drop)) * R * 0.5);
      drawBall(rotAt(t), now);
      ctx.restore();
      drawSparkles(now, 0);
    } else if (t < T.spin + T.morph + T.fade) {
      if (!particles) particles = buildParticles(rotAt(T.spin));
      const m = Math.min((t - T.spin) / T.morph, 1);
      const fade = Math.max((t - T.spin - T.morph) / T.fade, 0);
      drawSparkles(now, Math.min(m * 2, 1));
      ctx.fillStyle = INK;
      particles.forEach((p) => {
        const u = ease(Math.min(Math.max((m - p.delay) / (1 - 0.35), 0), 1));
        // arc outward a little on the way, like tiles flung off the ball
        const bow = Math.sin(u * Math.PI) * R * 0.25;
        const x = p.sx + (p.tx - p.sx) * u + Math.cos(p.spin) * bow;
        const y = p.sy + (p.ty - p.sy) * u + Math.sin(p.spin) * bow;
        const size = 4 - u * 1.2;
        ctx.globalAlpha = 1 - fade;
        ctx.fillRect(x - size / 2, y - size / 2, size, size);
        if (u < 0.9 && Math.random() < 0.02) { ctx.fillStyle = GOLD; ctx.fillRect(x - 2, y - 2, 4, 4); ctx.fillStyle = INK; }
      });
      ctx.globalAlpha = fade;
      ctx.drawImage(logo, logoRect.x, logoRect.y, logoRect.w, logoRect.h);
    } else {
      return fly();
    }
    ctx.globalAlpha = 1;
    raf = requestAnimationFrame(frame);
  }

  // The logo drops from the centre of the screen into the header
  function fly() {
    ctx.clearRect(0, 0, W, H);
    root.classList.remove("intro");
    const img = logo.cloneNode();
    img.className = "intro-logo";
    Object.assign(img.style, { left: logoRect.x + "px", top: logoRect.y + "px", width: logoRect.w + "px" });
    overlay.append(img);
    if (!brand) return finish();
    brand.style.visibility = "hidden";
    const b = brand.getBoundingClientRect();
    const scale = b.width / logoRect.w;
    const dx = b.left - logoRect.x, dy = b.top - logoRect.y;
    img.animate(
      [
        { transform: "translate(0, 0) scale(1)" },
        { transform: `translate(${dx}px, ${dy - 14}px) scale(${scale})`, offset: 0.8 },
        { transform: `translate(${dx}px, ${dy}px) scale(${scale})` },
      ],
      { duration: T.fly, easing: "cubic-bezier(0.65, 0, 0.35, 1)", fill: "forwards" }
    );
    overlay.animate([{ backgroundColor: BG }, { backgroundColor: "rgba(246, 239, 225, 0)" }], { duration: T.fly, easing: "ease-in", fill: "forwards" });
    setTimeout(finish, T.fly);
  }

  function finish() {
    if (done) return;
    done = true;
    cancelAnimationFrame(raf);
    root.classList.remove("intro");
    if (brand) brand.style.visibility = "";
    overlay.remove();
    try { sessionStorage.setItem("intro-seen", "1"); } catch {}
    removeEventListener("keydown", finish);
  }

  skip.addEventListener("click", finish);
  overlay.addEventListener("pointerdown", finish);
  addEventListener("keydown", finish);
  addEventListener("resize", () => { if (!particles) { resize(); targets = []; if (logo.complete) buildTargets(); } });

  const go = () => { buildTargets(); raf = requestAnimationFrame(frame); };
  if (logo.complete && logo.naturalWidth) go();
  else { logo.onload = go; logo.onerror = finish; }
})();
