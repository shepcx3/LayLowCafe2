// Lay Low Cafe — opening animation (about 2 seconds).
// One continuous motion: a line-art disco ball drops in spinning and sparkling,
// stretches and melts into the LAY LOW logo while still turning, then the logo
// falls back into its place in the header as the page appears.
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
  // Timeline in ms. Phases overlap slightly so the motion never stops.
  const T = { morphStart: 750, morphEnd: 1450, landEnd: 2150 };

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
  let W, H, cx, cy, R, logoRect;
  const logo = new Image();
  logo.src = brand ? brand.currentSrc || brand.src : "assets/img/logo.png";

  function layout() {
    W = innerWidth; H = innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + "px"; canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    R = Math.min(W, H) * 0.22;
    cx = W / 2; cy = H / 2;
    const w = Math.min(W * 0.72, 520);
    const h = w * ((logo.naturalHeight / logo.naturalWidth) || 0.253);
    logoRect = { x: cx - w / 2, y: cy - h / 2, w, h };
  }

  // ---------- easing ----------
  const clamp = (v) => Math.min(Math.max(v, 0), 1);
  const lerp = (a, b, u) => a + (b - a) * u;
  const smooth = (a, b, v) => { const u = clamp((v - a) / (b - a)); return u * u * (3 - 2 * u); };
  const easeOut = (u) => 1 - Math.pow(1 - u, 3);
  const easeInOut = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);

  // ---------- disco ball ----------
  const TILT = 0.32, LATS = 12, LONGS = 18;
  const lat = (i) => -Math.PI / 2 + (i / LATS) * Math.PI;
  const lon = (j, rot) => (j / LONGS) * Math.PI * 2 + rot;
  function project(la, lo) {
    const x = Math.cos(la) * Math.sin(lo), y = Math.sin(la), z = Math.cos(la) * Math.cos(lo);
    return { x: x * R, y: -(y * Math.cos(TILT) - z * Math.sin(TILT)) * R, z: y * Math.sin(TILT) + z * Math.cos(TILT) };
  }
  function curve(sample) {
    // front half solid, back half faint, for depth
    let run = [], front = null;
    const flush = () => { ctx.globalAlpha = (front ? 1 : 0.12) * ballAlpha; ctx.beginPath(); run.forEach((p, k) => (k ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))); ctx.stroke(); };
    for (let s = 0; s <= 40; s++) {
      const p = sample(s / 40), f = p.z > 0;
      if (front !== null && f !== front) { run.push(p); flush(); run = []; }
      run.push(p); front = f;
    }
    flush();
  }
  let ballAlpha = 1;
  const flashes = [];
  function drawBall(rot, now) {
    if (Math.random() < 0.5) flashes.push([1 + Math.floor(Math.random() * (LATS - 2)), Math.floor(Math.random() * LONGS), now]);
    for (let k = flashes.length - 1; k >= 0; k--) {
      const [i, j, born] = flashes[k], age = (now - born) / 380;
      if (age > 1) { flashes.splice(k, 1); continue; }
      const c = [project(lat(i), lon(j, rot)), project(lat(i + 1), lon(j, rot)), project(lat(i + 1), lon(j + 1, rot)), project(lat(i), lon(j + 1, rot))];
      if (c.some((p) => p.z <= 0.05)) continue;
      ctx.globalAlpha = Math.sin(age * Math.PI) * 0.8 * ballAlpha;
      ctx.fillStyle = GOLD;
      ctx.beginPath(); c.forEach((p, n) => (n ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))); ctx.fill();
    }
    ctx.strokeStyle = INK;
    for (let i = 1; i < LATS; i++) curve((u) => project(lat(i), u * Math.PI * 2));
    for (let j = 0; j < LONGS; j++) curve((u) => project(-Math.PI / 2 + u * Math.PI, lon(j, rot)));
  }

  // Four-point sparkles, like the reference art
  const sparkles = [
    { a: -2.35, d: 1.45, s: 0.24, p: 0 }, { a: -2.0, d: 1.2, s: 0.11, p: 0.3 },
    { a: -2.75, d: 1.3, s: 0.14, p: 0.6 }, { a: 0.75, d: 1.45, s: 0.19, p: 0.45 }, { a: -0.6, d: 1.4, s: 0.1, p: 0.8 },
  ];
  function drawSparkles(now, burst, alpha) {
    ctx.strokeStyle = INK; ctx.lineWidth = 2;
    sparkles.forEach((s) => {
      const pulse = 0.7 + 0.3 * Math.sin(now / 160 + s.p * 6.28);
      const d = s.d * R * (1 + burst * 0.8);
      const x = cx + Math.cos(s.a) * d, y = cy + Math.sin(s.a) * d, size = s.s * R * pulse * (1 + burst * 0.6);
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.moveTo(x, y - size);
      ctx.quadraticCurveTo(x, y, x + size, y); ctx.quadraticCurveTo(x, y, x, y + size);
      ctx.quadraticCurveTo(x, y, x - size, y); ctx.quadraticCurveTo(x, y, x, y - size);
      ctx.stroke();
    });
  }

  // ---------- timeline ----------
  let start = null, raf, done = false, landing = false;
  // Spin fast, then let the spin ease off as the ball becomes the logo
  const rotAt = (t) => (t < T.morphStart ? t / 210 : T.morphStart / 210 + ((t - T.morphStart) / 210) * (1 - 0.5 * clamp((t - T.morphStart) / (T.morphEnd - T.morphStart))));

  function frame(now) {
    if (done || landing) return;
    if (start === null) start = now;
    const t = now - start;
    ctx.clearRect(0, 0, W, H);

    // Let the page lay out and paint behind the opaque overlay early, so the
    // landing isn't held up by the browser's first full-page paint.
    if (t > 120 && root.classList.contains("intro")) {
      root.classList.remove("intro");
      if (brand) brand.style.visibility = "hidden";
    }

    // m: 0 = round ball, 1 = logo shape
    const m = easeInOut(clamp((t - T.morphStart) / (T.morphEnd - T.morphStart)));
    const drop = easeOut(clamp(t / 450));
    const ballY = lerp(-R * 0.6, 0, drop);

    // The ball's silhouette stretches into the logo's proportions
    const sx = lerp(1, (logoRect.w / 2) / R, m);
    const sy = lerp(1, (logoRect.h / 2) / R, m);

    // string retracts as the ball morphs
    ctx.globalAlpha = 1 - smooth(0, 0.4, m);
    ctx.strokeStyle = INK; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, cy + ballY - R * sy * 0.95); ctx.stroke();

    // ball (grid + outline), squashed by sx/sy, fading as the letters arrive
    ballAlpha = 1 - smooth(0.4, 0.9, m);
    ctx.save();
    ctx.translate(cx, cy + ballY);
    ctx.scale(sx, sy);
    ctx.lineWidth = 1.8 / Math.sqrt(sx * sy);
    drawBall(rotAt(t), now);
    ctx.globalAlpha = ballAlpha;
    ctx.lineWidth = 2.4 / Math.sqrt(sx * sy);
    ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();

    // the logo grows out of the squashed ball
    const la = smooth(0.35, 0.88, m);
    if (la > 0) {
      const k = lerp(0.9, 1, la);
      ctx.globalAlpha = la;
      ctx.drawImage(logo, cx - (logoRect.w * k) / 2, cy - (logoRect.h * k) / 2, logoRect.w * k, logoRect.h * k);
    }

    drawSparkles(now, smooth(0, 1, m), 1 - smooth(0.3, 0.8, m));
    ctx.globalAlpha = 1;

    if (m > 0.97) return land();
    raf = requestAnimationFrame(frame);
  }

  // The finished logo falls back into the header while the page appears
  function land() {
    landing = true;
    cancelAnimationFrame(raf);
    ctx.clearRect(0, 0, W, H);
    root.classList.remove("intro");
    const img = logo.cloneNode();
    img.className = "intro-logo";
    Object.assign(img.style, { left: logoRect.x + "px", top: logoRect.y + "px", width: logoRect.w + "px" });
    overlay.append(img);
    if (!brand) return finish();
    brand.style.visibility = "hidden";
    const b = brand.getBoundingClientRect();
    const s = b.width / logoRect.w;
    const dx = b.left - logoRect.x, dy = b.top - logoRect.y;
    const dur = T.landEnd - T.morphEnd;
    // Per-keyframe easing: a quick start, a small overshoot, then a soft settle
    img.animate(
      [
        { transform: "translate(0, 0) scale(1)", easing: "cubic-bezier(0.5, 0, 0.25, 1)" },
        { transform: `translate(${dx - b.width * 0.03}px, ${dy - b.height * 0.03}px) scale(${s * 1.06})`, offset: 0.7, easing: "ease-in-out" },
        { transform: `translate(${dx + b.width * 0.01}px, ${dy + b.height * 0.01}px) scale(${s * 0.98})`, offset: 0.86, easing: "ease-out" },
        { transform: `translate(${dx}px, ${dy}px) scale(${s})` },
      ],
      { duration: dur, fill: "forwards" }
    );
    // Fade only the backdrop, so the logo stays solid while it lands
    overlay.animate(
      [{ backgroundColor: "rgba(246, 239, 225, 1)" }, { backgroundColor: "rgba(246, 239, 225, 0)" }],
      { duration: dur, easing: "ease-out", fill: "forwards" }
    );
    setTimeout(finish, dur);
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
  addEventListener("resize", () => { if (!landing) layout(); });

  const go = () => { layout(); raf = requestAnimationFrame(frame); };
  if (logo.complete && logo.naturalWidth) go();
  else { logo.onload = go; logo.onerror = finish; }
})();
