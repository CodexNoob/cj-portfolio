import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import heroEnvironment from '../assets/images/creative-hero.jpg';
import aboutTunnel from '../assets/images/creative-about.jpg';
import contactGallery from '../assets/images/creative-contact.jpg';
import projectGallery from '../assets/images/creative-projects.jpg';
import eventCore from '../assets/images/event-core-menu-ui.webp';
import devPilot from '../assets/images/devpilot-dashboard-ui.webp';
import accountingCrm from '../assets/images/personal-crm-dashboard.png';
import luxKitchens from '../assets/images/lux-kitchens-designer-ui.webp';
import cjAssistant from '../assets/images/cj-ai-assistant-card.png';
import helpDesk from '../assets/images/helpdesk-ticketing-card.webp';

gsap.registerPlugin(ScrollTrigger);

const imageSets = {
  hero: heroEnvironment,
  about: aboutTunnel,
  contact: contactGallery,
};

const productScreens = [eventCore, devPilot, accountingCrm, luxKitchens, cjAssistant, helpDesk];
const palette = {
  dark: 0x101820,
  frame: 0x151c22,
  metal: 0x68747b,
  warm: 0xc49a62,
  ivory: 0xe8edf0,
  teal: 0x6eaaa5,
};

function box(scene, position, size, material, castShadow = true) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.position.set(...position);
  mesh.castShadow = castShadow;
  mesh.receiveShadow = true;
  scene.add(mesh);
  return mesh;
}

function loadTexture(url, renderer) {
  const texture = new THREE.TextureLoader().load(url);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
  return texture;
}

function addImageEnvironment(scene, url, camera, renderer, z = -18, crop = 1) {
  const texture = loadTexture(url, renderer);
  // The user reference contains sample dashboard metrics; use only its text-free atmospheric crop.
  texture.repeat.x = crop;
  const aspect = texture.image?.width && texture.image?.height
    ? texture.image.width / texture.image.height
    : 16 / 9;
  const distance = camera.position.z - z;
  const height = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * distance;
  const width = height * camera.aspect;
  const coverWidth = Math.max(width, height * aspect);
  const coverHeight = Math.max(height, width / aspect);
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(coverWidth, coverHeight),
    new THREE.MeshBasicMaterial({ map: texture, toneMapped: false, fog: false }),
  );
  plane.position.set(0, 1.1, z);
  plane.renderOrder = -10;
  scene.add(plane);
  return plane;
}

function makeDesk(scene, renderer) {
  const wood = new THREE.MeshStandardMaterial({ color: 0x262521, roughness: 0.32, metalness: 0.18 });
  const darkMetal = new THREE.MeshStandardMaterial({ color: palette.frame, roughness: 0.26, metalness: 0.78 });
  const keys = new THREE.MeshStandardMaterial({ color: 0x424b50, roughness: 0.58, metalness: 0.3 });
  const screenMaterials = [eventCore, devPilot].map((src) => new THREE.MeshBasicMaterial({
    map: loadTexture(src, renderer), toneMapped: false,
  }));

  box(scene, [0, -1.43, 0], [10, 0.22, 3.5], wood);
  for (const x of [-4.35, 4.35]) box(scene, [x, -2.25, 0], [0.18, 1.65, 0.18], darkMetal);
  box(scene, [0, -1.78, -0.9], [7.5, 0.1, 0.12], darkMetal);

  [-1.55, 1.55].forEach((x, i) => {
    box(scene, [x, 1.0, -1.0], [3.05, 1.82, 0.16], darkMetal);
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(2.86, 1.61), screenMaterials[i]);
    screen.position.set(x, 1.0, -0.905);
    scene.add(screen);
    box(scene, [x, -0.02, -1.0], [0.13, 0.85, 0.14], darkMetal);
    box(scene, [x, -0.44, -0.78], [0.86, 0.1, 0.68], darkMetal);
  });

  // One instanced keyboard gives the desk tangible detail without dozens of draw calls.
  const keyGeometry = new THREE.BoxGeometry(0.16, 0.045, 0.15);
  const keyCount = 12 * 5;
  const keyMesh = new THREE.InstancedMesh(keyGeometry, keys, keyCount);
  const dummy = new THREE.Object3D();
  let keyIndex = 0;
  for (let row = 0; row < 5; row += 1) {
    for (let col = 0; col < 12; col += 1) {
      dummy.position.set((col - 5.5) * 0.2, -1.295, 1.0 + row * 0.2);
      dummy.updateMatrix();
      keyMesh.setMatrixAt(keyIndex++, dummy.matrix);
    }
  }
  keyMesh.castShadow = true;
  scene.add(keyMesh);

  const mouse = new THREE.Mesh(new THREE.SphereGeometry(0.24, 24, 16), darkMetal);
  mouse.scale.set(0.8, 0.4, 1.25);
  mouse.position.set(1.75, -1.29, 1.45);
  mouse.castShadow = true;
  scene.add(mouse);

  const lamp = new THREE.Group();
  lamp.position.set(3.65, -1.28, -0.25);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 1.25, 12), darkMetal);
  stem.position.y = 0.65;
  stem.rotation.z = -0.15;
  lamp.add(stem);
  const shade = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.38, 24, 1, true),
    new THREE.MeshStandardMaterial({ color: palette.warm, roughness: 0.35, metalness: 0.58, side: THREE.DoubleSide }));
  shade.position.set(-0.08, 1.25, 0);
  shade.rotation.z = Math.PI;
  lamp.add(shade);
  scene.add(lamp);
  const practical = new THREE.PointLight(0xffd29a, 5, 8, 2);
  practical.position.set(3.55, -0.2, 0);
  scene.add(practical);
}

function makeCorridor(scene) {
  const metal = new THREE.MeshStandardMaterial({ color: 0x655040, metalness: 0.58, roughness: 0.38 });
  const luminous = new THREE.MeshStandardMaterial({ color: 0xf1a64f, emissive: 0xc86b22, emissiveIntensity: 0.55, metalness: 0.25, roughness: 0.3 });
  for (let i = 0; i < 6; i += 1) {
    const z = 4 - i * 3.7;
    const scale = 1 - i * 0.07;
    const width = 11 * scale;
    const height = 6.5 * scale;
    const depth = 0.28 * scale;
    box(scene, [-width / 2, 0.6, z], [depth, height, depth], metal);
    box(scene, [width / 2, 0.6, z], [depth, height, depth], metal);
    box(scene, [0, 0.6 + height / 2, z], [width + depth, depth, depth], i % 2 ? metal : luminous);
    const light = new THREE.PointLight(0xf69d46, 4.5 - i * 0.35, 11, 2);
    light.position.set(0, 2.2 * scale, z - 0.7);
    scene.add(light);
  }
}

function makeProjectMonitor(scene, renderer, index, textureUrl) {
  const screenZ = -index * 11.5;
  const side = index % 2 === 0 ? 1 : -1; // presentations travel right to left
  const centerX = side * 0.8;
  const frame = new THREE.MeshStandardMaterial({ color: palette.frame, metalness: 0.82, roughness: 0.24 });
  const edge = new THREE.MeshStandardMaterial({ color: index % 2 ? palette.teal : palette.warm, metalness: 0.68, roughness: 0.27 });
  const screenTexture = loadTexture(textureUrl, renderer);
  const screenMaterial = new THREE.MeshBasicMaterial({ map: screenTexture, toneMapped: false });

  box(scene, [centerX, 0.8, screenZ], [8.05, 4.65, 0.26], frame);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(7.78, 4.38), screenMaterial);
  screen.position.set(centerX, 0.8, screenZ + 0.145);
  scene.add(screen);
  box(scene, [centerX, -1.73, screenZ - 0.05], [0.28, 1.55, 0.32], frame);
  box(scene, [centerX, -2.55, screenZ + 0.25], [1.75, 0.13, 1.25], edge);

  const plinth = new THREE.MeshStandardMaterial({
    color: index % 2 ? 0x121d23 : 0x1a1714,
    metalness: 0.48,
    roughness: 0.38,
  });
  box(scene, [centerX, -3.15, screenZ], [11, 0.24, 7.4], plinth, false);
  const accent = new THREE.PointLight(index % 2 ? 0x75b8ad : 0xd2a86a, 7, 14, 2);
  accent.position.set(centerX - side * 4.7, 2.6, screenZ + 1.8);
  scene.add(accent);
}

function createRenderer(canvas) {
  try {
    return new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: window.innerWidth < 760 ? 'low-power' : 'high-performance',
      precision: 'highp',
    });
  } catch {
    return null;
  }
}

function setupScene(canvas) {
  const section = canvas.closest('section');
  const kind = canvas.dataset.scene;
  const renderer = createRenderer(canvas);
  if (!renderer || !section) return () => {};

  const mobile = window.matchMedia('(max-width: 760px)').matches;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  renderer.shadowMap.enabled = !mobile;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(kind === 'contact' ? 0xdfe8ed : 0x0b1117);
  scene.fog = new THREE.FogExp2(kind === 'about' ? 0x241a14 : 0x0b1117, kind === 'projects' ? 0.002 : 0.004);
  const camera = new THREE.PerspectiveCamera(kind === 'projects' ? 34 : 38, 1, 0.1, 150);
  camera.position.set(0, 1.3, kind === 'hero' ? 11 : kind === 'about' ? 18 : kind === 'projects' ? 12 : 13);

  const ambient = new THREE.HemisphereLight(kind === 'contact' ? 0xffffff : 0xc8d7e2, 0x211a16, kind === 'contact' ? 2.3 : 1.35);
  scene.add(ambient);
  const key = new THREE.DirectionalLight(kind === 'contact' ? 0xffffff : 0xe6edf2, kind === 'contact' ? 2.8 : 3.4);
  key.position.set(-5, 8, 8);
  key.castShadow = !mobile;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.near = 0.5;
  key.shadow.camera.far = 45;
  scene.add(key);

  if (imageSets[kind]) addImageEnvironment(scene, imageSets[kind], camera, renderer, kind === 'about' ? -28 : -18);
  if (kind === 'projects') addImageEnvironment(scene, projectGallery, camera, renderer, -72, 0.34);
  if (kind === 'hero') makeDesk(scene, renderer);
  if (kind === 'about') makeCorridor(scene);
  if (kind === 'projects') {
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(38, 100),
      new THREE.MeshStandardMaterial({ color: 0x0c1218, roughness: 0.32, metalness: 0.45 }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, -3.31, -26);
    floor.receiveShadow = true;
    scene.add(floor);
    const cards = Array.from(section.querySelectorAll('.project-card'));
    productScreens.slice(0, cards.length).forEach((src, i) => makeProjectMonitor(scene, renderer, i, src));
  }
  if (kind === 'contact') {
    const porcelain = new THREE.MeshStandardMaterial({ color: 0xe8eef2, roughness: 0.24, metalness: 0.12 });
    const brass = new THREE.MeshStandardMaterial({ color: 0xb99a70, roughness: 0.3, metalness: 0.62 });
    for (let i = 0; i < 3; i += 1) {
      const width = 9 - i * 1.15;
      const height = 6 - i * 0.72;
      const z = 1 - i * 3.2;
      box(scene, [-width / 2, 0.4, z], [0.12, height, 0.12], porcelain, false);
      box(scene, [width / 2, 0.4, z], [0.12, height, 0.12], porcelain, false);
      box(scene, [0, 0.4 + height / 2, z], [width, 0.12, 0.12], i === 0 ? brass : porcelain, false);
    }
  }

  const resize = () => {
    const width = Math.max(1, canvas.clientWidth);
    const height = Math.max(1, canvas.clientHeight);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.fov = mobile ? 43 : kind === 'projects' ? 34 : 38;
    camera.updateProjectionMatrix();
  };
  resize();

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const projectCards = kind === 'projects' ? Array.from(section.querySelectorAll('.project-card')) : [];
  const updateShot = (progress) => {
    if (kind === 'hero') {
      camera.position.set(0, 1.25, THREE.MathUtils.lerp(13, 9.5, progress));
      camera.lookAt(0, 0.15, -0.8);
    } else if (kind === 'about') {
      camera.position.set(THREE.MathUtils.lerp(0, 0.18, progress), 1.15, THREE.MathUtils.lerp(18, 5, progress));
      camera.lookAt(0, 0.65, -11);
    } else if (kind === 'projects') {
      const count = Math.max(1, projectCards.length);
      const shot = progress * (count - 1);
      const current = Math.floor(shot);
      const t = shot - current;
      const leftRight = (i) => (i % 2 === 0 ? 0.8 : -0.8);
      const fromZ = -current * 11.5;
      const toZ = -Math.min(count - 1, current + 1) * 11.5;
      const fromX = leftRight(current);
      const toX = leftRight(Math.min(count - 1, current + 1));
      camera.position.set(THREE.MathUtils.lerp(fromX, toX, t), 1.6, THREE.MathUtils.lerp(fromZ + 12, toZ + 12, t));
      camera.lookAt(THREE.MathUtils.lerp(fromX, toX, t), 0.8, THREE.MathUtils.lerp(fromZ, toZ, t));
    } else if (kind === 'contact') {
      camera.position.set(0, 1.2, THREE.MathUtils.lerp(11.5, 14, progress));
      camera.lookAt(0, 0.8, -2.8);
    }
  };

  const trigger = !reducedMotion ? ScrollTrigger.create({
    trigger: section,
    start: kind === 'contact' ? 'top bottom' : 'top top',
    end: kind === 'contact' ? 'bottom top' : 'bottom bottom',
    scrub: 0.75,
    onUpdate: (self) => updateShot(self.progress),
    onRefresh: (self) => updateShot(self.progress),
  }) : null;
  updateShot(trigger?.progress || 0);

  let frame = 0;
  let lastFrame = 0;
  let visible = false;
  const render = (time = 0) => {
    if (!visible) return;
    if (reducedMotion || time - lastFrame > 32) {
      lastFrame = time;
      renderer.render(scene, camera);
    }
    if (!reducedMotion) frame = window.requestAnimationFrame(render);
  };
  const visibilityObserver = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible && !reducedMotion) frame = window.requestAnimationFrame(render);
    if (visible && reducedMotion) render();
    if (!visible) window.cancelAnimationFrame(frame);
  }, { threshold: 0.01 });
  visibilityObserver.observe(canvas);

  window.addEventListener('resize', resize, { passive: true });
  return () => {
    visibilityObserver.disconnect();
    window.cancelAnimationFrame(frame);
    window.removeEventListener('resize', resize);
    trigger?.kill();
    renderer.dispose();
  };
}

export function initCinematicStage(canvases) {
  return canvases.map(setupScene);
}
