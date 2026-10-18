/* ==========================================================================
   KINETIX • 3D MASCOT & ADVANCED SHADER ENGINE (Three.js WebGL / GLSL)
   Includes:
   - Level Muy Avanzado: Interactive 3D Robot with Mouse Tracking & Lerp
   - Level Elite: Custom GLSL Shader Material with Vertex Displacement & Fresnel
   - Level 2026: AI Dialogue Terminal with Real-time 3D Gestures & Voice Synth
   ========================================================================== */

window.initMascot3D = function() {
  if (typeof THREE === 'undefined') {
    console.error('Three.js is not loaded');
    return;
  }

  const canvas = document.getElementById('mascot-canvas');
  if (!canvas) return;

  // Scene, Camera, Renderer
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0.15, 3.8);

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true
  });

  const updateSize = () => {
    const parent = canvas.parentElement;
    const w = parent && parent.clientWidth > 0 ? parent.clientWidth : window.innerWidth;
    const h = parent && parent.clientHeight > 0 ? parent.clientHeight : window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  };
  updateSize();

  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0x00f0ff, 2.8);
  keyLight.position.set(3, 4, 3);
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0xa855f7, 3.2);
  rimLight.position.set(-3, -2, -2);
  scene.add(rimLight);

  const eyeLight = new THREE.PointLight(0x00f0ff, 2.5, 10);
  eyeLight.position.set(0, 0.5, 2);
  scene.add(eyeLight);

  // Materials
  const armorMaterial = new THREE.MeshStandardMaterial({
    color: 0x141822,
    roughness: 0.2,
    metalness: 0.88,
  });

  const chromeMaterial = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.08,
    metalness: 0.96,
  });

  const visorMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x050608,
    roughness: 0.05,
    metalness: 0.1,
    transmission: 0.35,
    transparent: true,
    reflectivity: 0.95
  });

  const glowCyanMaterial = new THREE.MeshStandardMaterial({
    color: 0x00f0ff,
    emissive: 0x00f0ff,
    emissiveIntensity: 3.5,
    roughness: 0.1
  });

  // =========================================================================
  // NIVEL ELITE: CUSTOM GLSL SHADER (Quantum Holographic Core)
  // =========================================================================
  const quantumShaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0.0 },
      uColorA: { value: new THREE.Color(0x00f0ff) },
      uColorB: { value: new THREE.Color(0xff007f) },
      uColorC: { value: new THREE.Color(0xa855f7) }
    },
    vertexShader: `
      uniform float uTime;
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying float vDisplacement;

      void main() {
        vNormal = normalize(normalMatrix * normal);
        
        // 3D Wave Vertex Displacement (Simulating Quantum Plasma)
        float wave = sin(position.x * 3.5 + uTime * 2.5) * 
                     cos(position.y * 3.0 + uTime * 2.0) * 
                     sin(position.z * 3.5 + uTime * 1.5);
                     
        vDisplacement = wave;
        vec3 newPos = position + normal * (wave * 0.12);
        vPosition = newPos;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uColorA;
      uniform vec3 uColorB;
      uniform vec3 uColorC;
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying float vDisplacement;

      void main() {
        // Fresnel Edge Glow calculation
        vec3 viewDir = normalize(-vPosition);
        float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), 2.5);

        // Color interpolation based on wave displacement
        vec3 colorMix = mix(uColorA, uColorB, vDisplacement * 2.5 + 0.5);
        colorMix = mix(colorMix, uColorC, fresnel * 0.7);

        gl_FragColor = vec4(colorMix + fresnel * 0.5, 0.88);
      }
    `,
    transparent: true,
    wireframe: false
  });

  // Shader Hologram Orb (Elite Level)
  const shaderOrb = new THREE.Mesh(
    new THREE.SphereGeometry(0.38, 64, 64),
    quantumShaderMaterial
  );
  shaderOrb.position.set(0, 0.1, 0);
  shaderOrb.visible = false; // Toggled by user
  scene.add(shaderOrb);

  // =========================================================================
  // 3D ROBOT RIG
  // =========================================================================
  const robotRoot = new THREE.Group();
  scene.add(robotRoot);

  // 1. Torso
  const torso = new THREE.Mesh(
    new THREE.CylinderGeometry(0.48, 0.36, 0.75, 32),
    armorMaterial
  );
  torso.position.y = -0.45;
  robotRoot.add(torso);

  // Torso Core Reactor
  const coreMesh = new THREE.Mesh(
    new THREE.TorusGeometry(0.18, 0.04, 16, 32),
    glowCyanMaterial
  );
  coreMesh.position.set(0, -0.38, 0.44);
  robotRoot.add(coreMesh);

  // Shoulders
  const leftShoulder = new THREE.Mesh(new THREE.SphereGeometry(0.15, 24, 24), chromeMaterial);
  leftShoulder.position.set(-0.62, -0.22, 0);
  robotRoot.add(leftShoulder);

  const rightShoulder = new THREE.Mesh(new THREE.SphereGeometry(0.15, 24, 24), chromeMaterial);
  rightShoulder.position.set(0.62, -0.22, 0);
  robotRoot.add(rightShoulder);

  // 2. Neck Pivot & Head
  const neckPivot = new THREE.Group();
  neckPivot.position.set(0, 0.05, 0);
  robotRoot.add(neckPivot);

  const headGroup = new THREE.Group();
  neckPivot.add(headGroup);

  // Main Head Shell
  const headMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.58, 36, 36),
    armorMaterial
  );
  headMesh.scale.set(1.15, 1.0, 1.05);
  headGroup.add(headMesh);

  // Visor Glass
  const visorMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.54, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.5),
    visorMaterial
  );
  visorMesh.rotation.x = Math.PI * 0.5;
  visorMesh.scale.set(1.1, 0.85, 1.05);
  visorMesh.position.set(0, 0.03, 0.08);
  headGroup.add(visorMesh);

  // Robust Eyes (Sphere geometry compatible with all Three.js versions)
  const eyeGeom = new THREE.SphereGeometry(0.08, 20, 20);

  const leftEye = new THREE.Mesh(eyeGeom, glowCyanMaterial);
  leftEye.scale.set(1.2, 0.6, 0.8);
  leftEye.position.set(-0.2, 0.04, 0.54);
  headGroup.add(leftEye);

  const rightEye = new THREE.Mesh(eyeGeom, glowCyanMaterial);
  rightEye.scale.set(1.2, 0.6, 0.8);
  rightEye.position.set(0.2, 0.04, 0.54);
  headGroup.add(rightEye);

  // Floating Ears
  const earGeom = new THREE.CylinderGeometry(0.18, 0.18, 0.08, 24);
  const leftEar = new THREE.Mesh(earGeom, chromeMaterial);
  leftEar.rotation.z = Math.PI * 0.5;
  leftEar.position.set(-0.76, 0.05, 0);
  headGroup.add(leftEar);

  const leftEarRing = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.02, 16, 32), glowCyanMaterial);
  leftEarRing.rotation.y = Math.PI * 0.5;
  leftEarRing.position.set(-0.8, 0.05, 0);
  headGroup.add(leftEarRing);

  const rightEar = new THREE.Mesh(earGeom, chromeMaterial);
  rightEar.rotation.z = Math.PI * 0.5;
  rightEar.position.set(0.76, 0.05, 0);
  headGroup.add(rightEar);

  const rightEarRing = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.02, 16, 32), glowCyanMaterial);
  rightEarRing.rotation.y = Math.PI * 0.5;
  rightEarRing.position.set(0.8, 0.05, 0);
  headGroup.add(rightEarRing);

  // 3. Floating Background Particles
  const particleCount = 180;
  const particleGeom = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount * 3; i += 3) {
    particlePositions[i] = (Math.random() - 0.5) * 8;
    particlePositions[i + 1] = (Math.random() - 0.5) * 5;
    particlePositions[i + 2] = (Math.random() - 0.5) * 5 - 0.5;
  }
  particleGeom.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

  const particleMat = new THREE.PointsMaterial({
    color: 0x00f0ff,
    size: 0.04,
    transparent: true,
    opacity: 0.7
  });
  const particles = new THREE.Points(particleGeom, particleMat);
  scene.add(particles);

  // Mouse Tracking State
  let mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
  const coordDisplay = document.getElementById('mascot-coords');

  window.addEventListener('pointermove', (e) => {
    mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;

    if (coordDisplay) {
      coordDisplay.innerHTML = `
        <span>CURSOR X: ${(mouse.targetX).toFixed(2)}</span>
        <span>CURSOR Y: ${(mouse.targetY).toFixed(2)}</span>
        <span>PITCH: ${(-neckPivot.rotation.x * 57.3).toFixed(1)}°</span>
        <span>YAW: ${(neckPivot.rotation.y * 57.3).toFixed(1)}°</span>
      `;
    }
  });

  // Emotions
  let currentEmote = 'normal';

  window.setMascotEmote = function(emotion) {
    currentEmote = emotion;

    if (window.soundFx) {
      if (emotion === 'happy') window.soundFx.playBlip(780, 'sine', 0.12, 0.08);
      if (emotion === 'energy') window.soundFx.playHum(220, 0.4);
      if (emotion === 'surprise') window.soundFx.playBlip(1040, 'triangle', 0.15, 0.1);
      if (emotion === 'sleep') window.soundFx.playBlip(320, 'sine', 0.25, 0.05);
    }

    if (emotion === 'energy') {
      glowCyanMaterial.color.setHex(0xf59e0b);
      glowCyanMaterial.emissive.setHex(0xf59e0b);
      eyeLight.color.setHex(0xf59e0b);
    } else if (emotion === 'surprise') {
      glowCyanMaterial.color.setHex(0xff007f);
      glowCyanMaterial.emissive.setHex(0xff007f);
      eyeLight.color.setHex(0xff007f);
    } else {
      glowCyanMaterial.color.setHex(0x00f0ff);
      glowCyanMaterial.emissive.setHex(0x00f0ff);
      eyeLight.color.setHex(0x00f0ff);
    }
  };

  // Click on Canvas to trigger surprise
  canvas.addEventListener('click', () => {
    window.setMascotEmote('surprise');
    setTimeout(() => {
      window.setMascotEmote('normal');
      document.querySelectorAll('.emote-btn').forEach(b => b.classList.remove('active'));
      const normalBtn = document.querySelector('[data-emote="normal"]');
      if (normalBtn) normalBtn.classList.add('active');
    }, 1800);
  });

  // Emote button controls
  document.querySelectorAll('.emote-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      document.querySelectorAll('.emote-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const emote = btn.getAttribute('data-emote');
      window.setMascotEmote(emote);
    });
  });

  // Elite Shader Toggle
  window.toggleEliteShader = function() {
    const isShowingShader = shaderOrb.visible;
    shaderOrb.visible = !isShowingShader;
    robotRoot.visible = isShowingShader;
    if (window.soundFx) window.soundFx.playHum(160, 0.5);
    return !isShowingShader;
  };

  // Window Resize
  window.resizeMascotCanvas = updateSize;
  window.addEventListener('resize', updateSize);

  // Animation Loop
  let clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    // Update GLSL Shader time
    quantumShaderMaterial.uniforms.uTime.value = elapsedTime;

    // Smooth Mouse Tracking with Lerp
    mouse.x += (mouse.targetX - mouse.x) * 0.08;
    mouse.y += (mouse.targetY - mouse.y) * 0.08;

    neckPivot.rotation.y = mouse.x * 0.72;
    neckPivot.rotation.x = -mouse.y * 0.52;
    headGroup.rotation.z = -mouse.x * 0.18;

    torso.rotation.y = mouse.x * 0.28;
    torso.rotation.x = -mouse.y * 0.15;

    // Idle organic floating positioned comfortably
    const isDesktop = window.innerWidth > 960;
    const baseOffsetX = isDesktop ? -0.22 : 0;

    robotRoot.position.y = Math.sin(elapsedTime * 1.8) * 0.06;
    robotRoot.position.x = baseOffsetX + Math.cos(elapsedTime * 1.2) * 0.03;

    shaderOrb.position.y = Math.sin(elapsedTime * 2.0) * 0.08;
    shaderOrb.position.x = baseOffsetX;
    shaderOrb.rotation.y = elapsedTime * 0.4;
    shaderOrb.rotation.x = elapsedTime * 0.3;

    coreMesh.rotation.z += 0.03;
    leftEarRing.rotation.x += 0.02;
    rightEarRing.rotation.x += 0.02;

    // Emotion animations
    if (currentEmote === 'happy') {
      headGroup.position.y = Math.abs(Math.sin(elapsedTime * 8)) * 0.06;
      leftEye.scale.set(1.4, 0.3, 0.8);
      rightEye.scale.set(1.4, 0.3, 0.8);
    } else if (currentEmote === 'surprise') {
      headGroup.position.y = 0.12;
      leftEye.scale.set(1.6, 1.6, 1.6);
      rightEye.scale.set(1.6, 1.6, 1.6);
    } else if (currentEmote === 'sleep') {
      neckPivot.rotation.x = 0.35;
      leftEye.scale.set(1.2, 0.15, 0.8);
      rightEye.scale.set(1.2, 0.15, 0.8);
    } else if (currentEmote === 'energy') {
      coreMesh.rotation.z += 0.15;
      robotRoot.position.y += (Math.random() - 0.5) * 0.02;
      leftEye.scale.set(1.1, 1.1, 1.1);
      rightEye.scale.set(1.1, 1.1, 1.1);
    } else {
      const blink = Math.sin(elapsedTime * 2.2);
      if (blink > 0.97) {
        leftEye.scale.y = 0.1;
        rightEye.scale.y = 0.1;
      } else {
        leftEye.scale.set(1.2, 0.6, 0.8);
        rightEye.scale.set(1.2, 0.6, 0.8);
      }
    }

    particles.rotation.y = elapsedTime * 0.05;
    particles.rotation.x = mouse.y * 0.1;

    renderer.render(scene, camera);
  }

  animate();
  setTimeout(updateSize, 80);
};

// =========================================================================
// NIVEL 2026: AI MIND DIALOGUE & SPEECH TERMINAL
// =========================================================================
window.askAetherAI = function(question) {
  const terminalLog = document.getElementById('ai-terminal-output');
  const terminalStatus = document.getElementById('ai-status-indicator');
  if (!terminalLog) return;

  if (window.soundFx) window.soundFx.playHum(300, 0.3);

  // Set AI state to 'processing'
  if (terminalStatus) terminalStatus.textContent = 'AETHER 2026 // PROCESANDO...';
  window.setMascotEmote('energy');

  const knowledgeBase = {
    'trabajo': 'El Trabajo Mecánico (W) ocurre cuando una Fuerza (F) desplaza un objeto a lo largo de una distancia (d). Si la fuerza es perpendicular al movimiento, ¡el trabajo es cero!',
    'luz': 'La velocidad de la luz en el vacío es de exactamente 299,792,458 m/s. Nada con masa puede acelerar hasta alcanzar esa velocidad cósmica.',
    'gravedad': 'La gravedad no es solo una atracción: según la Relatividad General, la masa deforma la geometría del propio espacio-tiempo.',
    'supernova': '¡ALERTA DE SUPERNOVA! Liberando 10^44 Joules de energía estelar en un colapso gravitatorio. Todos los sensores al 100% de potencia.',
    'default': 'He procesado tu consulta cuántica en tiempo real. Todos los parámetros vectoriales y de simulación están operando a máxima fidelidad.'
  };

  const qLower = question.toLowerCase();
  let answer = knowledgeBase['default'];

  if (qLower.includes('trabajo') || qLower.includes('w=') || qLower.includes('fuerza')) {
    answer = knowledgeBase['trabajo'];
  } else if (qLower.includes('luz')) {
    answer = knowledgeBase['luz'];
  } else if (qLower.includes('gravedad')) {
    answer = knowledgeBase['gravedad'];
  } else if (qLower.includes('supernova') || qLower.includes('energía')) {
    answer = knowledgeBase['supernova'];
  }

  setTimeout(() => {
    terminalLog.innerHTML = `<strong>AETHER:</strong> `;
    let i = 0;
    const interval = setInterval(() => {
      if (i < answer.length) {
        terminalLog.innerHTML += answer.charAt(i);
        if (i % 3 === 0 && window.soundFx) {
          window.soundFx.playBlip(550 + (i % 5) * 40, 'triangle', 0.03, 0.015);
        }
        i++;
      } else {
        clearInterval(interval);
        if (terminalStatus) terminalStatus.textContent = 'AETHER 2026 // ONLINE & READY';
        window.setMascotEmote('happy');
        setTimeout(() => window.setMascotEmote('normal'), 2500);
      }
    }, 22);
  }, 400);
};
