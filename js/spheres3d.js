/* ==========================================================================
   AURA • 3D MATTE SPHERES ENGINE (Three.js WebGL)
   Faithful recreation of the Figma Composition 2025/2026 reference:
   - Matte Slate Blue and Warm Almond Cream spheres
   - Realistic soft diffuse lighting & shadows
   - Interactive mouse parallax & scroll-driven orbit
   ========================================================================== */

window.initSpheres3D = function() {
  if (typeof THREE === 'undefined') return;

  const canvas = document.getElementById('spheres-canvas');
  if (!canvas) return;

  // Scene, Camera, Renderer
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 7.5);

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  // Lighting (Warm Studio Lighting from the Figma reference)
  const ambientLight = new THREE.AmbientLight(0xFFF8F0, 1.8);
  scene.add(ambientLight);

  const mainLight = new THREE.DirectionalLight(0xFFFFFF, 2.4);
  mainLight.position.set(5, 7, 6);
  scene.add(mainLight);

  const fillLight = new THREE.DirectionalLight(0xE0D4C5, 1.2);
  fillLight.position.set(-6, -3, 3);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0x5B717D, 1.5);
  rimLight.position.set(0, -6, -4);
  scene.add(rimLight);

  // Materials (Matte Finish from the reference)
  const slateBlueMaterial = new THREE.MeshStandardMaterial({
    color: 0x445660,
    roughness: 0.82,
    metalness: 0.08,
  });

  const creamAlmondMaterial = new THREE.MeshStandardMaterial({
    color: 0xEEDDC8,
    roughness: 0.88,
    metalness: 0.04,
  });

  const sphereGeom = new THREE.SphereGeometry(1, 48, 48);

  // Spheres Configuration (matching the Figma composition layout)
  const spheresData = [
    // 1. Top-Left Almond Cream sphere
    { mat: creamAlmondMaterial, r: 0.82, x: -1.8, y: 2.2, z: -1.2, speed: 1.1, phase: 0.2 },
    // 2. Center-Right Large Slate Blue sphere
    { mat: slateBlueMaterial, r: 1.55, x: 1.6, y: 1.4, z: -1.8, speed: 0.8, phase: 1.5 },
    // 3. Center-Left Large Slate Blue sphere
    { mat: slateBlueMaterial, r: 1.35, x: -1.6, y: -0.2, z: -0.8, speed: 0.9, phase: 2.8 },
    // 4. Center-Bottom Almond Cream sphere
    { mat: creamAlmondMaterial, r: 1.15, x: 0.3, y: -2.0, z: -0.4, speed: 1.2, phase: 4.1 },
    // 5. Far-Right Small Almond Cream sphere
    { mat: creamAlmondMaterial, r: 0.95, x: 2.4, y: -0.8, z: -1.5, speed: 1.0, phase: 5.3 },
    // 6. Background Subtle Small Slate Blue sphere
    { mat: slateBlueMaterial, r: 0.55, x: -2.4, y: -2.2, z: -3.0, speed: 0.7, phase: 3.2 }
  ];

  const spheresGroup = new THREE.Group();
  spheresGroup.position.set(-0.35, 0, 0);
  scene.add(spheresGroup);

  const sphereMeshes = spheresData.map(data => {
    const mesh = new THREE.Mesh(sphereGeom, data.mat);
    mesh.scale.set(data.r, data.r, data.r);
    mesh.position.set(data.x, data.y, data.z);
    mesh.userData = { ...data, originX: data.x, originY: data.y, originZ: data.z };
    spheresGroup.add(mesh);
    return mesh;
  });

  // Mouse Parallax State
  let mouseX = 0;
  let mouseY = 0;
  let targetMouseX = 0;
  let targetMouseY = 0;

  window.addEventListener('mousemove', (e) => {
    targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    targetMouseY = -(e.clientY / window.innerHeight - 0.5) * 2;
  });

  // Scroll Sync (Spheres stay visible across the entire experience)
  let scrollProgress = 0;
  window.addEventListener('scroll', () => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    scrollProgress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
  }, { passive: true });

  // Window Resize
  function handleResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener('resize', handleResize);

  // Animation Loop
  let clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const time = clock.getElapsedTime();

    // Mouse lerp
    mouseX += (targetMouseX - mouseX) * 0.05;
    mouseY += (targetMouseY - mouseY) * 0.05;

    // Subtle group tilt
    spheresGroup.rotation.y = mouseX * 0.25 + scrollProgress * 0.8;
    spheresGroup.rotation.x = -mouseY * 0.18;

    // Organic floating for each sphere
    sphereMeshes.forEach(mesh => {
      const u = mesh.userData;
      const floatY = Math.sin(time * u.speed + u.phase) * 0.18;
      const floatX = Math.cos(time * u.speed * 0.8 + u.phase) * 0.12;

      // Parallax depth offset
      const depthFactor = (u.originZ + 4) * 0.15;
      mesh.position.y = u.originY + floatY + (mouseY * depthFactor);
      mesh.position.x = u.originX + floatX + (mouseX * depthFactor);

      // Scroll expansion
      mesh.position.z = u.originZ + Math.sin(scrollProgress * Math.PI) * 0.6;
    });

    renderer.render(scene, camera);
  }

  animate();
};
