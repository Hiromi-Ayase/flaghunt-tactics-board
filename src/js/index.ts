import * as THREE from "three";
import { MapControls } from "three/examples/jsm/controls/OrbitControls";
import { DragControls } from "three/examples/jsm/controls/DragControls";
import dat from "three/examples/js/libs/dat.gui.min";
import Stats from "three/examples/js/libs/stats.min";
import Board from "./board";
import Box from "./box";
import Player from "./player";

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

  const mouse = new THREE.Vector2();
  const raycaster = new THREE.Raycaster();

  const stats = new Stats();
  stats.setMode(0);
  document.body.appendChild(stats.domElement);

  const controls = new MapControls(camera, renderer.domElement);
  controls.panSpeed = 1.0;
  controls.rotateSpeed = 0.3;

  const grid = new Board();
  const objects = [];
  scene.add(grid.object);

  let lv = 1;

  const gui = new dat.GUI();
  const sizeFolder = gui.addFolder("Size");

  for (let i = -2; i <= 3; i++) {
    for (let j = -2; j <= 3; j++) {
      if ((i + j) % 2 != 0) continue;

      const box = new Box();
      box.set(i * 5, j * 5, lv, true);
      scene.add(box.object);
      objects.push(box.object);

      if (lv == 2) {
        const box = new Box();
        box.set(i * 5, j * 5, 1, true);
        scene.add(box.object);
        objects.push(box.object);
      }

      const player = new Player();
      player.set(i * 7, j * 7, true);
      scene.add(player.object);
      objects.push(player.object);
      sizeFolder.add(player.object.rotation, "y", 0, Math.PI * 2, 0.1);

      lv = lv == 1 ? 2 : 1;
    }
  }

  document.addEventListener(
    "mousedown",
    (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersections = raycaster.intersectObjects(objects, true);
      if (intersections.length > 0) {
        const object = intersections[0].object;
        console.log(object);
      }
    },
    false
  );

  const tick = (): void => {
    requestAnimationFrame(tick);
    stats.update();
    controls.update();

    renderer.render(scene, camera);
  };

  const dc = new DragControls([...objects], camera, renderer.domElement);
  dc.addEventListener("dragstart", () => {
    controls.enabled = false;
  });
  dc.addEventListener("dragend", () => {
    controls.enabled = true;
  });

  tick();

  console.log("Hello Three.js");
});
