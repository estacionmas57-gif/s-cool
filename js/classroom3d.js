/* ==========================================================================
   SYNAPSE LEARNING SYSTEMS • 3D MODERN CLASSROOM ENVIRONMENT
   Procedural Three.js Architectural School Environment
   Interactive Stations:
     1. Station 1 (Chalkboard): Saber 11 / Preicfes (Vector)
     2. Station 2 (Student Desk & Tablet): Pulse Agenda Virtual
     3. Station 3 (Interactive Guide Station): Morpho Guías Web
   Camera orchestrated via GSAP ScrollTrigger
   ========================================================================== */

(function () {
  let scene, camera, renderer;
  let chalkboardMesh, tabletScreenMesh, guideStationGroup;
  let particles, particleData = [];
  let sunLight;
  let isInitialized = false;

  // Camera trajectory keyframes for the 3 stations
  const cameraStations = [
    // 0: Vista General Panorámica del Aula
    {
      pos: new THREE.Vector3(0, 3.2, 6.2),
      look: new THREE.Vector3(0, 2.0, -3.5)
    },
    // 1: Zoom al Tablero (Saber 11 / Preicfes Vector)
    {
      pos: new THREE.Vector3(0, 2.35, -3.2),
      look: new THREE.Vector3(0, 2.35, -7.4)
    },
    // 2: Descenso al Pupitre y Tablet del Estudiante (Pulse Agenda Virtual)
    {
      pos: new THREE.Vector3(-1.35, 1.85, -1.5),
      look: new THREE.Vector3(-1.8, 1.08, -2.8)
    },
    // 3: Giro a la Estación de Guías Escolares (Morpho Guías)
    {
      pos: new THREE.Vector3(3.8, 2.3, -1.8),
      look: new THREE.Vector3(6.8, 2.0, -3.2)
    }
  ];

  // Current interpolated camera target
  const currentCamPos = cameraStations[0].pos.clone();
  const currentCamLook = cameraStations[0].look.clone();
  const targetCamPos = cameraStations[0].pos.clone();
  const targetCamLook = cameraStations[0].look.clone();

  // Mouse Parallax
  let mouseX = 0, mouseY = 0;
  let targetMouseX = 0, targetMouseY = 0;

  // --- Dynamic Canvas Textures for Realism ---
  function createChalkboardTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Slate deep chalkboard background
    ctx.fillStyle = '#142922';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle chalk dust and texture gradients
    const grad = ctx.createRadialGradient(1024, 512, 100, 1024, 512, 900);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.04)');
    grad.addColorStop(0.6, 'rgba(255, 255, 255, 0.015)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0.25)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Chalk border line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 4;
    ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

    // Header Title
    ctx.font = 'bold 54px "Space Grotesk", sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.fillText('PRUEBAS DE ESTADO • SABER 11 // VECTOR', 1024, 130);

    ctx.font = '32px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#D4A359';
    ctx.fillText('DIAGNÓSTICO OFICIAL ICFES & ENTRENAMIENTO POR COMPETENCIAS', 1024, 185);

    // Divider
    ctx.strokeStyle = 'rgba(212, 163, 89, 0.4)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(300, 220);
    ctx.lineTo(1748, 220);
    ctx.stroke();

    // 5 Areas Badges
    const areas = [
      'Lectura Crítica',
      'Matemáticas',
      'Ciencias Naturales',
      'Sociales y Ciudadanas',
      'Inglés'
    ];

    areas.forEach((area, i) => {
      const x = 320 + i * 280;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.beginPath();
      ctx.roundRect(x - 120, 260, 240, 60, 12);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.font = 'bold 22px "Space Grotesk", sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(area, x, 298);
    });

    // Formulas & Tactical Diagrams (Tactile Chalk Style)
    ctx.textAlign = 'left';
    ctx.font = 'bold 36px "Space Grotesk", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillText('1. Descarte Lógico de Distractores', 120, 410);

    ctx.font = '28px "Space Grotesk", monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.fillText('ΔP = (Racha_Diaria * Batallas_1v1) / Tiempo_Respuesta', 120, 465);
    ctx.fillText('f(x) = ∫ P(Acierto | Dificultad_Item) dx', 120, 520);
    ctx.fillText('Vector_Score: [92, 88, 86, 84, 95] ➔ Percentil 99.4%', 120, 575);

    // Right Side: Score Target
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(212, 163, 89, 0.12)';
    ctx.beginPath();
    ctx.roundRect(1380, 390, 480, 260, 24);
    ctx.fill();
    ctx.strokeStyle = 'rgba(212, 163, 89, 0.4)';
    ctx.stroke();

    ctx.font = 'bold 26px "Space Grotesk", sans-serif';
    ctx.fillStyle = '#D4A359';
    ctx.fillText('META INSTITUCIONAL', 1620, 450);

    ctx.font = 'bold 88px "Outfit", sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('420 / 500', 1620, 550);

    ctx.font = '24px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#A3E635';
    ctx.fillText('★ Beca Excelencia Académica', 1620, 605);

    // Bottom Quote
    ctx.font = 'italic 26px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillText('"La práctica diaria transforma la incertidumbre del examen en dominio automático."', 1024, 920);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    return texture;
  }

  function createTabletScreenTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 680;
    const ctx = canvas.getContext('2d');

    // Modern tablet OS interface (Dark sleek slate)
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Top Header Bar
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(0, 0, canvas.width, 70);

    ctx.font = 'bold 28px "Space Grotesk", sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('⚡ PULSE // AGENDA ESCOLAR INSTITUCIONAL', 36, 46);

    ctx.font = '22px "Space Grotesk", sans-serif';
    ctx.fillStyle = '#10B981';
    ctx.textAlign = 'right';
    ctx.fillText('● 100% SINCRONIZADO', canvas.width - 36, 46);

    // Student Card
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.beginPath();
    ctx.roundRect(36, 100, canvas.width - 72, 140, 16);
    ctx.fill();

    ctx.font = 'bold 32px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('Estudiante: Mateo Gómez • Grado 11-A', 60, 155);

    ctx.font = '24px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#94A3B8';
    ctx.fillText('Promedio General: 4.8 / 5.0 • Puesto en Curso: 1º • Asistencia: 100%', 60, 200);

    // Dual Cards
    // Card Left: Boletines
    ctx.fillStyle = 'rgba(30, 41, 59, 0.9)';
    ctx.beginPath();
    ctx.roundRect(36, 265, 450, 240, 16);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.stroke();

    ctx.font = 'bold 24px "Space Grotesk", sans-serif';
    ctx.fillStyle = '#38BDF8';
    ctx.fillText('BOLETINES & NOTAS', 60, 315);

    ctx.font = '20px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('• Periodo 3: Consolidado al 100%', 60, 365);
    ctx.fillText('• 1 Clic: PDF Oficial descargable', 60, 410);
    ctx.fillText('• Ranking automático generado', 60, 455);

    // Card Right: Acuses & Observador
    ctx.fillStyle = 'rgba(30, 41, 59, 0.9)';
    ctx.beginPath();
    ctx.roundRect(520, 265, 468, 240, 16);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.stroke();

    ctx.font = 'bold 24px "Space Grotesk", sans-serif';
    ctx.fillStyle = '#F59E0B';
    ctx.fillText('CIRCULARES Y ACUDIENTES', 544, 315);

    ctx.font = '20px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('• Circular #14: Confirmada por padres', 544, 365);
    ctx.fillText('• Acuse digital con fecha y hora oficial', 544, 410);
    ctx.fillText('• Observador escolar con respaldo legal', 544, 455);

    // Bottom Status Bar
    ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
    ctx.beginPath();
    ctx.roundRect(36, 530, canvas.width - 72, 90, 14);
    ctx.fill();

    ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#10B981';
    ctx.fillText('✔ Panel de Rectoría Activo: 640 familias conectadas en tiempo real sin fotocopias.', 60, 584);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    return texture;
  }

  function initClassroom3D() {
    if (typeof THREE === 'undefined') return;

    const canvas = document.getElementById('spheres-canvas');
    if (!canvas) return;

    // --- 1. Scene & Camera ---
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xF7F3EE);
    scene.fog = new THREE.FogExp2(0xF7F3EE, 0.024);

    const aspect = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera(40, aspect, 0.1, 100);
    camera.position.copy(currentCamPos);
    camera.lookAt(currentCamLook);

    // --- 2. WebGL Renderer ---
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;

    // --- 3. Lighting (Warm Sunlight through classroom windows) ---
    const ambientLight = new THREE.AmbientLight(0xEAE3D8, 0.85);
    scene.add(ambientLight);

    // Sun coming from left windows
    sunLight = new THREE.DirectionalLight(0xFFF1D0, 1.9);
    sunLight.position.set(-12, 9, -2);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 35;
    sunLight.shadow.camera.left = -10;
    sunLight.shadow.camera.right = 10;
    sunLight.shadow.camera.top = 10;
    sunLight.shadow.camera.bottom = -10;
    sunLight.shadow.bias = -0.0004;
    scene.add(sunLight);

    // Subtle warm point light over student desk
    const deskSpot = new THREE.PointLight(0xFFE8C2, 1.1, 8);
    deskSpot.position.set(-1.8, 3.2, -2.5);
    scene.add(deskSpot);

    // Chalkboard spotlight
    const boardSpot = new THREE.SpotLight(0xFFFFFF, 1.4, 12, Math.PI / 4, 0.4);
    boardSpot.position.set(0, 4.8, -4.5);
    boardSpot.target.position.set(0, 2.4, -7.4);
    scene.add(boardSpot);
    scene.add(boardSpot.target);

    // --- 4. Materials ---
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0xD8C3A8,
      roughness: 0.55,
      metalness: 0.05
    });

    const wallMat = new THREE.MeshStandardMaterial({
      color: 0xF5F0EB,
      roughness: 0.85
    });

    const woodDeskMat = new THREE.MeshStandardMaterial({
      color: 0xC89F74,
      roughness: 0.45,
      metalness: 0.05
    });

    const metalLegMat = new THREE.MeshStandardMaterial({
      color: 0x2A323D,
      roughness: 0.35,
      metalness: 0.8
    });

    // --- 5. Room Geometry ---
    // Floor
    const floorGeo = new THREE.PlaneGeometry(24, 24);
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    scene.add(floor);

    // Back Wall (Front of classroom)
    const backWallGeo = new THREE.PlaneGeometry(24, 9);
    const backWall = new THREE.Mesh(backWallGeo, wallMat);
    backWall.position.set(0, 4.5, -7.5);
    backWall.receiveShadow = true;
    scene.add(backWall);

    // Left Wall with Window Cutouts
    const leftWallGeo = new THREE.PlaneGeometry(24, 9);
    const leftWall = new THREE.Mesh(leftWallGeo, wallMat);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-8.5, 4.5, 0);
    leftWall.receiveShadow = true;
    scene.add(leftWall);

    // Right Wall
    const rightWallGeo = new THREE.PlaneGeometry(24, 9);
    const rightWall = new THREE.Mesh(rightWallGeo, wallMat);
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.position.set(8.5, 4.5, 0);
    rightWall.receiveShadow = true;
    scene.add(rightWall);

    // --- 6. STATION 1: TABLERO / CHALKBOARD ---
    const boardFrameGeo = new THREE.BoxGeometry(7.6, 3.2, 0.12);
    const boardFrameMat = new THREE.MeshStandardMaterial({ color: 0x785A3C, roughness: 0.6 });
    const boardFrame = new THREE.Mesh(boardFrameGeo, boardFrameMat);
    boardFrame.position.set(0, 2.5, -7.42);
    boardFrame.castShadow = true;
    boardFrame.receiveShadow = true;
    scene.add(boardFrame);

    const chalkboardTexture = createChalkboardTexture();
    const boardSurfaceGeo = new THREE.PlaneGeometry(7.2, 2.8);
    const boardSurfaceMat = new THREE.MeshStandardMaterial({
      map: chalkboardTexture,
      roughness: 0.65,
      metalness: 0.05
    });
    chalkboardMesh = new THREE.Mesh(boardSurfaceGeo, boardSurfaceMat);
    chalkboardMesh.position.set(0, 2.5, -7.34);
    chalkboardMesh.receiveShadow = true;
    scene.add(chalkboardMesh);

    // Chalk tray
    const trayGeo = new THREE.BoxGeometry(7.4, 0.08, 0.22);
    const tray = new THREE.Mesh(trayGeo, boardFrameMat);
    tray.position.set(0, 0.86, -7.32);
    tray.castShadow = true;
    scene.add(tray);

    // --- 7. STATION 2: HERO STUDENT DESK & TABLET ---
    function createDesk(x, z, isHero = false) {
      const deskGroup = new THREE.Group();
      deskGroup.position.set(x, 0, z);

      // Top surface
      const topGeo = new THREE.BoxGeometry(1.4, 0.06, 0.8);
      const top = new THREE.Mesh(topGeo, woodDeskMat);
      top.position.y = 0.95;
      top.castShadow = true;
      top.receiveShadow = true;
      deskGroup.add(top);

      // Metal legs
      const legGeo = new THREE.CylinderGeometry(0.024, 0.024, 0.95, 12);
      const legPositions = [
        [-0.62, 0.475, -0.32],
        [0.62, 0.475, -0.32],
        [-0.62, 0.475, 0.32],
        [0.62, 0.475, 0.32]
      ];
      legPositions.forEach(([lx, ly, lz]) => {
        const leg = new THREE.Mesh(legGeo, metalLegMat);
        leg.position.set(lx, ly, lz);
        leg.castShadow = true;
        deskGroup.add(leg);
      });

      // Modern Chair
      const seatGeo = new THREE.BoxGeometry(0.5, 0.04, 0.5);
      const seat = new THREE.Mesh(seatGeo, woodDeskMat);
      seat.position.set(0, 0.55, 0.55);
      seat.castShadow = true;
      deskGroup.add(seat);

      const backGeo = new THREE.BoxGeometry(0.5, 0.35, 0.04);
      const back = new THREE.Mesh(backGeo, woodDeskMat);
      back.position.set(0, 0.85, 0.78);
      back.castShadow = true;
      deskGroup.add(back);

      if (isHero) {
        // Tablet body
        const tabletBodyGeo = new THREE.BoxGeometry(0.48, 0.02, 0.32);
        const tabletBodyMat = new THREE.MeshStandardMaterial({ color: 0x1E242C, metalness: 0.85, roughness: 0.25 });
        const tabletBody = new THREE.Mesh(tabletBodyGeo, tabletBodyMat);
        tabletBody.position.set(0, 0.99, -0.05);
        tabletBody.rotation.x = -0.22; // Propped up facing student
        tabletBody.castShadow = true;
        deskGroup.add(tabletBody);

        // Tablet glowing screen
        const tabletScreenGeo = new THREE.PlaneGeometry(0.45, 0.29);
        const tabletTexture = createTabletScreenTexture();
        const tabletScreenMat = new THREE.MeshBasicMaterial({
          map: tabletTexture
        });
        tabletScreenMesh = new THREE.Mesh(tabletScreenGeo, tabletScreenMat);
        tabletScreenMesh.position.set(0, 1.002, -0.05);
        tabletScreenMesh.rotation.x = -Math.PI / 2 - 0.22;
        deskGroup.add(tabletScreenMesh);

        // Digital stylus
        const penGeo = new THREE.CylinderGeometry(0.007, 0.007, 0.24, 10);
        const penMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.2 });
        const pen = new THREE.Mesh(penGeo, penMat);
        pen.rotation.z = Math.PI / 3;
        pen.rotation.x = Math.PI / 2;
        pen.position.set(0.38, 0.99, -0.05);
        deskGroup.add(pen);
      }

      scene.add(deskGroup);
      return deskGroup;
    }

    // Hero Desk at front-left
    createDesk(-1.8, -2.8, true);

    // Other Desks to populate the classroom naturally
    createDesk(1.8, -2.8, false);
    createDesk(-1.8, -0.8, false);
    createDesk(1.8, -0.8, false);
    createDesk(0, 0.8, false);

    // --- 8. STATION 3: INTERACTIVE GUIDES STATION (MORPHO) ---
    guideStationGroup = new THREE.Group();
    guideStationGroup.position.set(7.2, 0, -3.2);

    // Modular Bookshelf
    const shelfGeo = new THREE.BoxGeometry(0.8, 3.4, 3.8);
    const shelfMat = new THREE.MeshStandardMaterial({ color: 0xC89F74, roughness: 0.5 });
    const shelf = new THREE.Mesh(shelfGeo, shelfMat);
    shelf.position.set(0, 1.7, 0);
    shelf.castShadow = true;
    shelf.receiveShadow = true;
    guideStationGroup.add(shelf);

    // Floating Illuminated Digital Guide Displays
    const guideTitles = [
      { color: 0x38BDF8, y: 2.3, z: -1.0, title: 'FÍSICA 10' },
      { color: 0x10B981, y: 1.8, z: 0.0, title: 'QUÍMICA 11' },
      { color: 0xF59E0B, y: 1.3, z: 1.0, title: 'ÉTICA WEB' }
    ];

    guideTitles.forEach((g) => {
      const guideSlabGeo = new THREE.BoxGeometry(0.12, 0.55, 0.42);
      const guideSlabMat = new THREE.MeshStandardMaterial({
        color: g.color,
        roughness: 0.2,
        emissive: g.color,
        emissiveIntensity: 0.35
      });
      const slab = new THREE.Mesh(guideSlabGeo, guideSlabMat);
      slab.position.set(-0.48, g.y, g.z);
      slab.rotation.y = -0.3;
      slab.castShadow = true;
      guideStationGroup.add(slab);
    });

    scene.add(guideStationGroup);

    // --- 9. Floating Sunbeam Particles (Dust Motes) ---
    const pCount = 80;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);

    for (let i = 0; i < pCount; i++) {
      const px = -6 + Math.random() * 12;
      const py = 0.5 + Math.random() * 4.5;
      const pz = -6 + Math.random() * 10;
      pPos[i * 3] = px;
      pPos[i * 3 + 1] = py;
      pPos[i * 3 + 2] = pz;
      particleData.push({
        origY: py,
        speed: 0.002 + Math.random() * 0.005,
        sway: Math.random() * Math.PI * 2
      });
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));

    const pMat = new THREE.PointsMaterial({
      color: 0xFFF7E6,
      size: 0.06,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });
    particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // --- 10. Event Listeners ---
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('mousemove', onMouseMove);

    isInitialized = true;
    animate();
  }

  function onWindowResize() {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function onMouseMove(e) {
    targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  }

  // Camera Trajectory interpolator called from ScrollTrigger (progression 0.0 to 1.0)
  function setClassroomProgress(p) {
    const clamped = Math.max(0, Math.min(1, p));

    // Map 0 -> 1 smoothly through cameraStations [0, 1, 2, 3]
    // 0.00 -> 0.15: Establishing Wide shot (0)
    // 0.15 -> 0.45: Move toward Station 1 (Tablero - Saber 11)
    // 0.45 -> 0.72: Move toward Station 2 (Pupitre - Pulse Agenda)
    // 0.72 -> 1.00: Move toward Station 3 (Guías - Morpho)
    let segIdx = 0;
    let segT = 0;

    if (clamped < 0.33) {
      segIdx = 0;
      segT = clamped / 0.33;
    } else if (clamped < 0.66) {
      segIdx = 1;
      segT = (clamped - 0.33) / 0.33;
    } else {
      segIdx = 2;
      segT = (clamped - 0.66) / 0.34;
    }

    // Smooth cubic easing for camera interpolation
    const easeT = segT * segT * (3 - 2 * segT);

    const fromStation = cameraStations[segIdx];
    const toStation = cameraStations[segIdx + 1];

    targetCamPos.lerpVectors(fromStation.pos, toStation.pos, easeT);
    targetCamLook.lerpVectors(fromStation.look, toStation.look, easeT);
  }

  function animate() {
    requestAnimationFrame(animate);

    // Smooth mouse parallax
    mouseX += (targetMouseX - mouseX) * 0.05;
    mouseY += (targetMouseY - mouseY) * 0.05;

    // Smooth camera motion
    currentCamPos.lerp(targetCamPos, 0.08);
    currentCamLook.lerp(targetCamLook, 0.08);

    camera.position.x = currentCamPos.x + mouseX * 0.25;
    camera.position.y = currentCamPos.y - mouseY * 0.18;
    camera.position.z = currentCamPos.z;
    camera.lookAt(currentCamLook.x + mouseX * 0.15, currentCamLook.y, currentCamLook.z);

    // Animate subtle dust motes
    if (particles) {
      const posAttr = particles.geometry.attributes.position;
      for (let i = 0; i < particleData.length; i++) {
        const d = particleData[i];
        d.sway += 0.01;
        posAttr.array[i * 3 + 1] = d.origY + Math.sin(d.sway) * 0.18;
      }
      posAttr.needsUpdate = true;
    }

    renderer.render(scene, camera);
  }

  window.initClassroom3D = initClassroom3D;
  window.setClassroomProgress = setClassroomProgress;
})();
