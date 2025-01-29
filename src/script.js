import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// gui
const gui = new GUI();
const guiChange = {};
guiChange.count = 100000;
guiChange.size = 0.0113;
guiChange.radius = 4;
guiChange.branch = 6;
guiChange.spin = 1;
guiChange.randomness = 0.2;
guiChange.insideColor = "#ff6030";
guiChange.outsideColor = "#1b3984";

/**
 * Test cube
 */
let particleGeometry = null;
let particleMaterial = null;
let particle = null;

const galaxy = () => {
  if (particle !== null) {
    particleGeometry.dispose();
    particleMaterial.dispose();
    scene.remove(particle);
  }

  particleGeometry = new THREE.BufferGeometry();
  const position = new Float32Array(guiChange.count * 3);
  const color = new Float32Array(guiChange.count * 3);

  for (let i = 0; i < guiChange.count; i++) {
    const i3 = i * 3;

    const radius = Math.random() * guiChange.radius;
    const branch = ((i % guiChange.branch) / guiChange.branch) * Math.PI * 2;
    const spin = radius * guiChange.spin;

    const randomY = (Math.random() - 0.5) * guiChange.randomness * radius;
    const randomX = (Math.random() - 0.5) * guiChange.randomness * radius;
    const randomZ = (Math.random() - 0.5) * guiChange.randomness * radius;

    const insideColor = new THREE.Color(guiChange.insideColor);
    const outsideColor = new THREE.Color(guiChange.outsideColor);

    const mixed = insideColor.clone();
    mixed.lerp(outsideColor, radius / guiChange.radius);

    position[i3] = Math.cos(branch + spin) * radius + randomX;
    position[i3 + 1] = randomY;
    position[i3 + 2] = Math.sin(branch + spin) * radius + randomZ;

    color[i3] = mixed.r;
    color[i3 + 1] = mixed.g;
    color[i3 + 2] = mixed.b;
  }

  particleGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(position, 3)
  );
  particleGeometry.setAttribute("color", new THREE.BufferAttribute(color, 3));
  particleMaterial = new THREE.PointsMaterial({
    size: guiChange.size,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
  });

  particle = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particle);
};

galaxy();

// GUI Changes
gui
  .add(guiChange, "count")
  .min(100)
  .max(1000000)
  .step(100)
  .onFinishChange(galaxy);
gui
  .add(guiChange, "size")
  .min(0.0001)
  .max(0.1)
  .step(0.0001)
  .onFinishChange(galaxy);
gui.add(guiChange, "radius").min(0.1).max(20).step(0.1).onFinishChange(galaxy);
gui.add(guiChange, "branch").min(0).max(10).step(1).onFinishChange(galaxy);
gui.add(guiChange, "spin").min(-5).max(5).step(0.1).onFinishChange(galaxy);
gui.add(guiChange, "randomness").min(0).max(2).step(0.1).onFinishChange(galaxy);
gui.addColor(guiChange, "insideColor").onFinishChange(galaxy);
gui.addColor(guiChange, "outsideColor").onFinishChange(galaxy);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  95,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.x = 3;
camera.position.y = 6;
camera.position.z = 2;
scene.add(camera);

// Star
const StarGeometry = new THREE.BufferGeometry();
const StarPos = new Float32Array(20000 * 3);

for (let i = 0; i < 20000 * 3; i++) {
  StarPos[i] =
    (Math.random() - 0.5) * camera.position.distanceTo(particle.position) * 50;
}

StarGeometry.setAttribute("position", new THREE.BufferAttribute(StarPos, 3));
const Points = new THREE.Points(
  StarGeometry,
  new THREE.PointsMaterial({ size: 0.001, sizeAttenuation: true })
);
scene.add(Points);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  alpha: true
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update controls
  controls.update();

  // Animation
  Points.rotation.y = elapsedTime / 20;
  particle.rotation.y = elapsedTime / 4;

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
