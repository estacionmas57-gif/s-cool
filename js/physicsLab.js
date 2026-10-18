/* ==========================================================================
   KINETIX • INTERACTIVE PHYSICS LAB: W = F · d · cos(θ)
   ========================================================================== */

window.initPhysicsLab = function() {
  const canvas = document.getElementById('physics-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  // UI elements
  const sliderF = document.getElementById('slider-force');
  const sliderTheta = document.getElementById('slider-angle');
  const valF = document.getElementById('val-force');
  const valTheta = document.getElementById('val-angle');
  const bigWorkNumber = document.getElementById('big-work-number');
  const btnLaunch = document.getElementById('btn-launch-cart');
  const btnReset = document.getElementById('btn-reset-cart');
  const hudPos = document.getElementById('hud-cart-pos');
  const hudWork = document.getElementById('hud-work-calc');

  // Simulation State
  let width, height;
  let force = 60; // Newtons
  let angleDeg = 25; // Degrees
  let mass = 8.0; // kg
  let cartX = 80; // pixels
  let cartStartX = 80;
  let velocity = 0;
  let distanceMeters = 0;
  let workDoneJoules = 0;
  let isDraggingVector = false;
  let isSimulating = false;

  // Track & Scaling: 50 pixels = 1 meter
  const PIXELS_PER_METER = 50;

  // Particle Sparks
  const sparks = [];

  function resizeCanvas() {
    const parent = canvas.parentElement;
    const parentRect = parent ? parent.getBoundingClientRect() : null;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    let cw = rect.width;
    let ch = rect.height;

    if (!cw || cw < 50) {
      cw = parentRect && parentRect.width > 50 ? parentRect.width : 800;
    }
    if (!ch || ch < 50) {
      ch = parentRect && parentRect.height > 50 ? parentRect.height : 520;
    }

    width = canvas.width = Math.floor(cw * dpr);
    height = canvas.height = Math.floor(ch * dpr);

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
  }

  window.resizePhysicsCanvas = resizeCanvas;
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Sync sliders & variables
  function updateFromSliders() {
    force = parseFloat(sliderF.value);
    angleDeg = parseFloat(sliderTheta.value);
    valF.textContent = `${force} N`;
    valTheta.textContent = `${angleDeg}°`;
    calculateWork();
  }

  if (sliderF && sliderTheta) {
    sliderF.addEventListener('input', updateFromSliders);
    sliderTheta.addEventListener('input', updateFromSliders);
  }

  function calculateWork() {
    const rad = (angleDeg * Math.PI) / 180;
    const effectiveF = force * Math.cos(rad);
    workDoneJoules = Math.max(0, effectiveF * distanceMeters);

    if (bigWorkNumber) {
      bigWorkNumber.textContent = workDoneJoules.toFixed(1);
    }
    if (hudWork) {
      hudWork.textContent = `TRABAJO (W): ${workDoneJoules.toFixed(1)} J`;
    }
  }

  // Mouse Interaction with Vector Arrow
  canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    // Arrow tip coordinate
    const originX = cartX;
    const originY = (canvas.height / (window.devicePixelRatio || 1)) * 0.65 - 40;
    const rad = (-angleDeg * Math.PI) / 180;
    const tipX = originX + Math.cos(rad) * (force * 1.5);
    const tipY = originY + Math.sin(rad) * (force * 1.5);

    const dist = Math.hypot(mx - tipX, my - tipY);
    if (dist < 28) {
      isDraggingVector = true;
      if (window.soundFx) window.soundFx.playSnap();
    }
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDraggingVector) return;

    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const originX = cartX;
    const originY = (canvas.height / (window.devicePixelRatio || 1)) * 0.65 - 40;

    const dx = mx - originX;
    const dy = my - originY;

    // Calculate length (force) and angle
    let rawDist = Math.hypot(dx, dy) / 1.5;
    force = Math.min(120, Math.max(10, Math.round(rawDist)));

    let rad = Math.atan2(-dy, dx);
    let deg = Math.round((rad * 180) / Math.PI);
    angleDeg = Math.min(75, Math.max(-45, deg));

    // Update controls
    if (sliderF) sliderF.value = force;
    if (sliderTheta) sliderTheta.value = angleDeg;
    if (valF) valF.textContent = `${force} N`;
    if (valTheta) valTheta.textContent = `${angleDeg}°`;

    calculateWork();
  });

  window.addEventListener('mouseup', () => {
    isDraggingVector = false;
  });

  // Launch Button
  if (btnLaunch) {
    btnLaunch.addEventListener('click', () => {
      isSimulating = true;
      if (window.soundFx) window.soundFx.playHum(180, 0.5);
    });
  }

  // Reset Button
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      isSimulating = false;
      cartX = cartStartX;
      velocity = 0;
      distanceMeters = 0;
      workDoneJoules = 0;
      calculateWork();
      if (window.soundFx) window.soundFx.playBlip(300, 'sine', 0.1, 0.04);
    });
  }

  // Spark Generator
  function emitSparks(x, y) {
    for (let i = 0; i < 3; i++) {
      sparks.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.7) * 4,
        vy: -Math.random() * 3,
        life: 1.0,
        color: Math.random() > 0.5 ? '#00f0ff' : '#ff007f'
      });
    }
  }

  // Animation Loop
  let lastTime = performance.now();

  function render(now) {
    requestAnimationFrame(render);
    const dt = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;

    const displayW = canvas.width / (window.devicePixelRatio || 1);
    const displayH = canvas.height / (window.devicePixelRatio || 1);

    ctx.clearRect(0, 0, displayW, displayH);

    const trackY = displayH * 0.65;
    const maxTrackX = displayW - 120;

    // 1. Simulation Physics Update
    if (isSimulating) {
      const rad = (angleDeg * Math.PI) / 180;
      const F_parallel = force * Math.cos(rad);
      const friction = 12.0; // N friction force
      const netForce = Math.max(0, F_parallel - friction);

      const accel = netForce / mass; // m/s^2
      velocity += accel * dt;

      // Friction decelerates if applied force stops
      if (F_parallel <= friction) {
        velocity = Math.max(0, velocity - 1.5 * dt);
        if (velocity === 0) isSimulating = false;
      }

      const dxPixels = velocity * PIXELS_PER_METER * dt;
      cartX += dxPixels;

      if (cartX >= maxTrackX) {
        cartX = maxTrackX;
        isSimulating = false;
        velocity = 0;
      }

      distanceMeters = (cartX - cartStartX) / PIXELS_PER_METER;
      calculateWork();

      if (hudPos) {
        hudPos.textContent = `DESPLAZAMIENTO (d): ${distanceMeters.toFixed(2)} m`;
      }

      // Emit sparks from wheel contact
      if (velocity > 0.2) {
        emitSparks(cartX - 30, trackY);
        emitSparks(cartX + 30, trackY);
      }
    }

    // 2. Draw Futuristic Levitating Track
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(40, trackY);
    ctx.lineTo(displayW - 40, trackY);
    ctx.stroke();

    // Track Measurement Ticks (Meters)
    for (let x = cartStartX; x < displayW - 60; x += PIXELS_PER_METER) {
      const m = Math.round((x - cartStartX) / PIXELS_PER_METER);
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, trackY);
      ctx.lineTo(x, trackY + 10);
      ctx.stroke();

      ctx.fillStyle = 'rgba(148, 163, 184, 0.7)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillText(`${m}m`, x - 7, trackY + 24);
    }

    // Track Glow Line
    const gradient = ctx.createLinearGradient(40, trackY, displayW - 40, trackY);
    gradient.addColorStop(0, 'rgba(0, 240, 255, 0.1)');
    gradient.addColorStop(0.5, 'rgba(0, 240, 255, 0.5)');
    gradient.addColorStop(1, 'rgba(168, 85, 247, 0.1)');
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 3;
    ctx.stroke();

    // 3. Draw Sparks
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.x += s.vx;
      s.y += s.vy;
      s.vy += 0.15; // Gravity
      s.life -= dt * 2.5;

      if (s.life <= 0) {
        sparks.splice(i, 1);
        continue;
      }

      ctx.fillStyle = s.color;
      ctx.globalAlpha = s.life;
      ctx.beginPath();
      ctx.arc(s.x, s.y, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;
    }

    // 4. Draw Physics Cart
    const cartW = 86;
    const cartH = 38;
    const cartY = trackY - cartH - 12;

    // Cart Body (Glassmorphic chassis)
    ctx.save();
    ctx.shadowColor = 'rgba(0, 240, 255, 0.4)';
    ctx.shadowBlur = 20;

    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#00f0ff';
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(cartX - cartW / 2, cartY, cartW, cartH, 8);
    } else {
      ctx.rect(cartX - cartW / 2, cartY, cartW, cartH);
    }
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Cart Energy Core
    ctx.fillStyle = '#00f0ff';
    ctx.beginPath();
    ctx.arc(cartX, cartY + cartH / 2, 7, 0, Math.PI * 2);
    ctx.fill();

    // Wheels
    const wheelR = 10;
    const wheelY = trackY - wheelR;
    const rotationAngle = (cartX / wheelR);

    [-26, 26].forEach((offset) => {
      const wx = cartX + offset;
      ctx.save();
      ctx.translate(wx, wheelY);
      ctx.rotate(rotationAngle);

      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, wheelR, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Spokes
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-wheelR, 0);
      ctx.lineTo(wheelR, 0);
      ctx.moveTo(0, -wheelR);
      ctx.lineTo(0, wheelR);
      ctx.stroke();
      ctx.restore();
    });

    // 5. Draw Interactive Force Vector Arrow (F)
    const originX = cartX;
    const originY = cartY + 10;
    const rad = (-angleDeg * Math.PI) / 180;
    const arrowLen = force * 1.5;
    const tipX = originX + Math.cos(rad) * arrowLen;
    const tipY = originY + Math.sin(rad) * arrowLen;

    // Dotted guide line for angle
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(originX + arrowLen + 15, originY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Angle Arc
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(originX, originY, 32, 0, -rad, angleDeg < 0);
    ctx.stroke();

    ctx.fillStyle = '#a855f7';
    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.fillText(`${angleDeg}°`, originX + 38, originY - (rad * 16));

    // Main Vector Arrow Line
    ctx.save();
    ctx.shadowColor = '#ff007f';
    ctx.shadowBlur = 15;
    ctx.strokeStyle = '#ff007f';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(tipX, tipY);
    ctx.stroke();

    // Arrow Head
    const headLen = 14;
    const headAngle = Math.PI / 7;
    ctx.fillStyle = '#ff007f';
    ctx.beginPath();
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(
      tipX - headLen * Math.cos(rad - headAngle),
      tipY - headLen * Math.sin(rad - headAngle)
    );
    ctx.lineTo(
      tipX - headLen * Math.cos(rad + headAngle),
      tipY - headLen * Math.sin(rad + headAngle)
    );
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Interactive Drag Handle on Tip
    ctx.fillStyle = isDraggingVector ? '#ffffff' : 'rgba(255, 0, 127, 0.4)';
    ctx.strokeStyle = '#ff007f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(tipX, tipY, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Label on Vector
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px "Space Grotesk", sans-serif';
    ctx.fillText(`F = ${force} N`, tipX + 12, tipY - 8);
  }

  requestAnimationFrame(render);
};
