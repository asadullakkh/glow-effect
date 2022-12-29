import * as THREE from "three";
import { createGlowMesh, defaultOptions } from "./glow.js";

const SEGMENTS = 20;
const SIZE = 30;

const geometry = new THREE.TorusGeometry(SIZE, SIZE / 3, SEGMENTS, SEGMENTS);
let options = {
  ...defaultOptions,
  backside: true,
  coefficient: 0.5,
  color: "gold",
  size: 2,
  power: 2,
};

let mesh;
let scene;
let camera;
let renderer;

function init() {
  var material = new THREE.MeshBasicMaterial({
    color: 0x08a494,
  });
  mesh = new THREE.Mesh(geometry, material);

  // add the glow mesh to the original mesh
  const glowMesh = createGlowMesh(geometry, options);
  mesh.add(glowMesh);

  // create camera and scene
  camera = new THREE.PerspectiveCamera(
    20,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.position.z = 300;
  scene = new THREE.Scene();
  scene.add(mesh);
  scene.background = new THREE.Color("#181414");

  // initialize renderer

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas: document.querySelector(".webgl"),
  });

  renderer.setSize(window.innerWidth, window.innerHeight);

  window.addEventListener("resize", () => renderer.render(scene, camera));
}

function animate() {
  requestAnimationFrame(animate);
  mesh.rotation.x += 0.005;
  mesh.rotation.y += 0.005;
  renderer.render(scene, camera);
}

init();
animate();
