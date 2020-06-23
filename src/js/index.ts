import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

window.addEventListener("DOMContentLoaded", () => {
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color("0xFFFFFF");

  const camera = new THREE.PerspectiveCamera(45, 800 / 600, 1, 10000);
  camera.position.set(0, 0, 1000);

  const geometry = new THREE.BoxGeometry(250, 250, 250);
  const material = new THREE.MeshPhongMaterial({ color: 0xff0000 });
  const box = new THREE.Mesh(geometry, material);
  box.position.z = -5;
  scene.add(box);

  const controls = new OrbitControls(camera, renderer.domElement);

  const geometry2 = new THREE.CylinderBufferGeometry(0, 10, 30, 4, 1);
  const material2 = new THREE.MeshPhongMaterial({ color: 0xffffff });

  for (let i = 0; i < 500; i++) {
    const mesh = new THREE.Mesh(geometry2, material2);
    mesh.position.x = Math.random() * 1600 - 800;
    mesh.position.y = 0;
    mesh.position.z = Math.random() * 1600 - 800;
    mesh.updateMatrix();
    mesh.matrixAutoUpdate = false;
    scene.add(mesh);
  }
  const light = new THREE.DirectionalLight(0xffffff);
  light.position.set(1, 1, 1);
  scene.add(light);

  const tick = (): void => {
    requestAnimationFrame(tick);

    box.rotation.x += 0.05;
    box.rotation.y += 0.05;

    controls.update();
    renderer.render(scene, camera);
  };
  tick();

  console.log("Hello Three.js");
});
