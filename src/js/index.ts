import * as THREE from "three";
import { MapControls } from "three/examples/jsm/controls/OrbitControls";
import dat from "dat.gui";
import Stats from "three/examples/js/libs/stats.min";
import Manager from "./manager";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import Drag2DControl from "./drag2d";
import Draggable from "./draggable";

window.addEventListener("DOMContentLoaded", () => {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  document.body.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xcccccc);

  const light = new THREE.DirectionalLight(0xffffff, 1.3);
  light.position.set(0, 1, 1);
  scene.add(light);

  const light2 = new THREE.AmbientLight(0xffffff, 0.2);
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

  const ctl = new Drag2DControl(camera, renderer.domElement);
  ctl.addEventListener("activate", () => {
    controls.enabled = false;
  });
  ctl.addEventListener("deactivate", () => {
    controls.enabled = true;
  });

  const manager = new Manager(scene, ctl);
  manager.init();

  const gui = new dat.GUI();
  const folder = gui.addFolder("Board");
  folder.add(manager.state.board, "width", 10, 100, 1).onChange(() => {
    manager.render();
  });
  folder.add(manager.state.board, "height", 10, 100, 1).onChange(() => {
    manager.render();
  });

  const loader = new FBXLoader();
  let logo: THREE.Object3D;

  loader.load("models/jfa_logo.fbx", (object) => {
    logo = object;
    console.log(object);
    object.position.set(-150, 10, -130);
    object.scale.setScalar(0.05);
    scene.add(object);

    class Logo implements Draggable {
      rotate(delta: number): void {
        logo.rotateX(delta);
      }
      moveTo(x: number, z: number): void {
        logo.position.x = x;
        logo.position.z = z;
      }
      moveVertical(delta: number): void {
        logo.position.y += delta;
      }
      getObject(): THREE.Object3D {
        return logo;
      }
    }
    ctl.add(new Logo());
  });

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

  // const dc = new Drag2DControl(draggable, camera, renderer.domElement);
  const controls = new MapControls(camera, renderer.domElement);
  controls.panSpeed = 1.0;
  controls.rotateSpeed = 0.3;

  const tick = (): void => {
    requestAnimationFrame(tick);
    stats.update();
    controls.update();
    renderer.render(scene, camera);
  };

  tick();

  console.log("Hello Three.js");
});
