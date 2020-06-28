import * as THREE from "three";
import { MapControls } from "three/examples/jsm/controls/OrbitControls";
import dat from "three/examples/js/libs/dat.gui.min";
import Stats from "three/examples/js/libs/stats.min";
import Board from "./board";
import Box from "./box";
import Player from "./player";
import Drag2DControl from "./drag2d";
import { Draggable } from "./draggable";

window.addEventListener("DOMContentLoaded", () => {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  document.body.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);

  const light = new THREE.DirectionalLight(0xffffff, 0.5);
  light.position.set(0, 1, 0);
  scene.add(light);

  const light2 = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(light2);

  const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    10000
  );
  camera.position.set(0, 400, 0);
  camera.lookAt(0, 0, 0);

  const stats = new Stats();
  stats.setMode(0);
  document.body.appendChild(stats.domElement);

  const grid = new Board();
  scene.add(grid.object);

  let lv = 1;

  const gui = new dat.GUI();
  const sizeFolder = gui.addFolder("Rotation");

  const draggable: Draggable[] = [];
  let p = 0;
  for (let i = -2; i <= 3; i++) {
    for (let j = -2; j <= 3; j++) {
      if ((i + j) % 2 != 0) continue;

      const box = new Box();
      box.set(i * 5, j * 5, lv, false);
      scene.add(box.object);
      draggable.push(box);

      if (lv == 2) {
        const box = new Box();
        box.set(i * 5, j * 5, 1, false);
        scene.add(box.object);
        draggable.push(box);
      }

      const player = new Player(p++, 0);
      player.set(i * 7, j * 7, true);
      scene.add(player.object);
      draggable.push(player);
      sizeFolder
        .add(player.object.rotation, "y", 0, Math.PI * 2, 0.1)
        .name("Player-" + p);

      lv = lv == 1 ? 2 : 1;
    }
  }

  window.addEventListener("resize", () => {
    // サイズを取得
    const width = window.innerWidth;
    const height = window.innerHeight;

    // レンダラーのサイズを調整する
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);

    // カメラのアスペクト比を正す
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  });

  const dc = new Drag2DControl(draggable, camera, renderer.domElement);
  const controls = new MapControls(camera, renderer.domElement);
  controls.panSpeed = 1.0;
  controls.rotateSpeed = 0.3;

  dc.addEventListener("activate", () => {
    controls.enabled = false;
  });
  dc.addEventListener("deactivate", () => {
    controls.enabled = true;
  });

  const tick = (): void => {
    requestAnimationFrame(tick);
    stats.update();
    controls.update();

    renderer.render(scene, camera);
  };

  tick();

  console.log("Hello Three.js");
});
