import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import eventCoreImage from '../assets/images/event-core-card.webp';
import devPilotImage from '../assets/images/devpilot-card.webp';

gsap.registerPlugin(ScrollTrigger);

const COLORS = {
  ice: 0xb7d9e8,
  gold: 0xd2a86a,
  mint: 0x75b8a4,
  ink: 0x0b1118,
  blue: 0x7299c8,
};

function makeMaterial(color, roughness = 0.42, metalness = 0.38) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}

function addBox(group, position, size, material, bevel = 0) {
  const geometry = bevel
    ? new THREE.BoxGeometry(...size, 1, 1, 1)
    : new THREE.BoxGeometry(...size);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);
  return mesh;
}

function makeStage(index, title) {
  const group = new THREE.Group();
  group.position.z = -index * 25;

  const deck = new THREE.Mesh(
    new THREE.CylinderGeometry(5.2, 5.6, 0.24, 96),
    makeMaterial(0x111c25, 0.3, 0.62),
  );
  deck.position.y = -0.12;
  deck.receiveShadow = true;
  group.add(deck);

  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(5.38, 0.025, 10, 120),
    new THREE.MeshStandardMaterial({ color: COLORS.gold, metalness: 0.78, roughness: 0.22 }),
  );
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.035;
  group.add(rim);

  const type = title.toLowerCase();
  const glass = new THREE.MeshPhysicalMaterial({
    color: type.includes('project') ? COLORS.ice : COLORS.blue,
    metalness: 0.35,
    roughness: 0.18,
    transmission: 0.12,
    transparent: true,
    opacity: 0.78,
    clearcoat: 0.85,
  });
  const brass = makeMaterial(COLORS.gold, 0.25, 0.82);

  if (type.includes('project') || type.includes('home')) {
    // A small architectural pavilion recalls Event Core's venue and its digital control room.
    addBox(group, [0, 1.05, -0.2], [3.7, 2.2, 0.2], glass);
    addBox(group, [-2.05, 0.92, -0.2], [0.16, 2.1, 0.32], brass);
    addBox(group, [2.05, 0.92, -0.2], [0.16, 2.1, 0.32], brass);
    addBox(group, [0, 2.18, -0.2], [4.3, 0.12, 0.48], brass);
    for (let i = 0; i < 4; i += 1) {
      const texture = new THREE.TextureLoader().load(i % 2 ? devPilotImage : eventCoreImage);
      texture.colorSpace = THREE.SRGBColorSpace;
      const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.48), new THREE.MeshBasicMaterial({ map: texture }));
      screen.position.set(-1.18 + i * 0.78, 1.08, 0.13);
      group.add(screen);
    }
  } else if (type.includes('skill')) {
    // A restrained skyline of twelve tool-like columns, each at a different height.
    for (let i = 0; i < 12; i += 1) {
      const angle = (i / 12) * Math.PI * 2;
      const height = 0.7 + ((i * 7) % 9) * 0.18;
      const column = new THREE.Mesh(
        new THREE.CylinderGeometry(0.075, 0.12, height, 8),
        i % 3 === 0 ? brass : makeMaterial(COLORS.ice, 0.27, 0.55),
      );
      column.position.set(Math.cos(angle) * 3.6, height / 2, Math.sin(angle) * 3.6);
      column.castShadow = true;
      group.add(column);
    }
  } else if (type.includes('experience') || type.includes('education')) {
    // Milestone markers form a walk through the work history.
    for (let i = 0; i < 5; i += 1) {
      const x = -3 + i * 1.5;
      addBox(group, [x, 0.42, 0], [0.74, 0.84 + (i % 2) * 0.3, 0.74], i === 2 ? brass : glass);
      const marker = new THREE.Mesh(new THREE.SphereGeometry(0.09, 20, 20),
        new THREE.MeshStandardMaterial({ color: COLORS.ice, emissive: COLORS.ice, emissiveIntensity: 0.32 }));
      marker.position.set(x, 1.2 + (i % 2) * 0.3, 0.42);
      group.add(marker);
    }
  } else {
    // The remaining beats use a quiet orbital sculpture, tying the environments together.
    for (let i = 0; i < 3; i += 1) {
      const orbit = new THREE.Mesh(
        new THREE.TorusGeometry(1.2 + i * 0.75, 0.018, 8, 96),
        i === 1 ? brass : makeMaterial(COLORS.ice, 0.2, 0.72),
      );
      orbit.rotation.x = Math.PI / 2 + i * 0.22;
      orbit.rotation.y = i * 0.5;
      orbit.position.y = 1.25 + i * 0.18;
      group.add(orbit);
    }
    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.56, 2), glass);
    core.position.y = 1.4;
    core.castShadow = true;
    group.add(core);
  }

  const halo = new THREE.PointLight(index % 2 ? COLORS.ice : COLORS.gold, 2.5, 13, 2);
  halo.position.set(-3.2, 4.2, 2.5);
  group.add(halo);
  return group;
}

function pathPoint(index, count) {
  const z = -index * 25;
  const x = Math.sin(index * 0.65) * 1.2;
  return {
    camera: new THREE.Vector3(x, 3.1 + Math.sin(index * 0.4) * 0.3, z + 9.5),
    target: new THREE.Vector3(x * 0.18, 0.9, z - (index === count - 1 ? 0.7 : 0)),
  };
}

export function initCinematicStage(canvas) {
  if (!canvas || !window.WebGLRenderingContext) return () => {};

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  } catch {
    return () => {};
  }

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(COLORS.ink, 0.009);
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 240);
  const ambient = new THREE.HemisphereLight(0xa9c5d4, 0x14100d, 1.8);
  scene.add(ambient);
  const key = new THREE.DirectionalLight(0xd7e6ee, 3.2);
  key.position.set(-5, 9, 9);
  key.castShadow = true;
  scene.add(key);
  const fill = new THREE.PointLight(0x487391, 18, 85, 1.8);
  fill.position.set(6, 5, -28);
  scene.add(fill);

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(90, 270), makeMaterial(0x0a1117, 0.56, 0.32));
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, -0.27, -92);
  floor.receiveShadow = true;
  scene.add(floor);

  const dustPositions = new Float32Array(720 * 3);
  for (let i = 0; i < 720; i += 1) {
    dustPositions[i * 3] = (Math.sin(i * 12.9898) * 0.5 + 0.5) * 54 - 27;
    dustPositions[i * 3 + 1] = (Math.sin(i * 78.233) * 0.5 + 0.5) * 18 + 0.2;
    dustPositions[i * 3 + 2] = -((i * 37) % 270) + 18;
  }
  const dustGeometry = new THREE.BufferGeometry();
  dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
  const dust = new THREE.Points(dustGeometry, new THREE.PointsMaterial({
    color: 0xaec8d8,
    size: 0.035,
    transparent: true,
    opacity: 0.36,
    depthWrite: false,
    sizeAttenuation: true,
  }));
  scene.add(dust);

  const sections = Array.from(document.querySelectorAll('main > section'));
  const stages = sections.map((section, index) => {
    const stage = makeStage(index, `${section.id} ${section.textContent.slice(0, 32)}`);
    scene.add(stage);
    return stage;
  });
  const points = stages.map((_, index) => pathPoint(index, stages.length));
  const main = document.querySelector('main');
  const getSectionProgress = () => sections.map((section) => {
    const mainTop = main.getBoundingClientRect().top + window.scrollY;
    const scrollableHeight = Math.max(1, main.scrollHeight - window.innerHeight);
    const sectionTop = section.getBoundingClientRect().top + window.scrollY - mainTop;
    return THREE.MathUtils.clamp(sectionTop / scrollableHeight, 0, 1);
  });
  let sectionProgress = getSectionProgress();

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.9;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const resize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.fov = width < 700 ? 43 : 34;
    camera.updateProjectionMatrix();
    sectionProgress = getSectionProgress();
  };

  const updateCamera = (progress) => {
    const value = THREE.MathUtils.clamp(progress, 0, 1);
    let index = sectionProgress.findIndex((marker, i) => marker <= value && value <= (sectionProgress[i + 1] ?? 1));
    index = Math.min(Math.max(index, 0), Math.max(0, points.length - 2));
    const fromMarker = sectionProgress[index] ?? 0;
    const toMarker = sectionProgress[index + 1] ?? 1;
    const mix = points.length < 2 ? 0 : THREE.MathUtils.clamp((value - fromMarker) / Math.max(0.0001, toMarker - fromMarker), 0, 1);
    const from = points[index] || pathPoint(0, 1);
    const to = points[index + 1] || from;
    camera.position.lerpVectors(from.camera, to.camera, mix);
    camera.lookAt(from.target.clone().lerp(to.target, mix));
  };

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) updateCamera(0);
  const trigger = reducedMotion ? null : ScrollTrigger.create({
    trigger: main,
    start: 'top top',
    end: 'bottom bottom',
    scrub: 0.8,
    onUpdate: (self) => updateCamera(self.progress),
    onRefresh: (self) => {
      sectionProgress = getSectionProgress();
      updateCamera(self.progress);
    },
  });
  updateCamera(trigger?.progress || 0);

  let frame = 0;
  const render = (time = 0) => {
    if (!reducedMotion) {
      stages.forEach((stage, index) => {
        stage.rotation.y = Math.sin(time * 0.00016 + index * 0.5) * 0.025;
      });
    }
    renderer.render(scene, camera);
    if (!reducedMotion) frame = window.requestAnimationFrame(render);
  };
  resize();
  render();
  window.addEventListener('resize', resize, { passive: true });

  return () => {
    window.cancelAnimationFrame(frame);
    window.removeEventListener('resize', resize);
    trigger?.kill();
    renderer.dispose();
  };
}
