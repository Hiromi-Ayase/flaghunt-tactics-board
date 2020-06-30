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
  renderer.shadowMap.enabled = true;

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  document.body.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xcccccc);

  const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    10000
  );
  camera.position.set(0, 400, 0);
  camera.lookAt(0, 0, 0);

  const ambLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambLight);
  const light = new THREE.DirectionalLight(0xffffff, 1.0);
  light.position.set(0, 100, 0);
  light.shadow.mapSize.height = 4096;
  light.shadow.mapSize.width = 4096;
  light.shadow.camera.right = 500;
  light.shadow.camera.left = -500;
  light.shadow.camera.top = -500;
  light.shadow.camera.bottom = 500;

  light.castShadow = true;
  scene.add(light);

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
  folder.add(manager.state.board, "width", 10, 40, 1).onChange(() => {
    manager.render();
  });
  folder.add(manager.state.board, "height", 10, 40, 1).onChange(() => {
    manager.render();
  });

  const loader = new FBXLoader();
  let logo: THREE.Object3D;

  loader.load("models/jfa_logo.fbx", (object) => {
    logo = object;
    console.log(object);
    object.position.set(-150, 10, -130);
    object.scale.setScalar(0.05);
    object.rotateX(-Math.PI / 4);
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

  // {
  //   const mat = new THREE.MeshBasicMaterial({
  //     color: 0xff0000,
  //     transparent: true,
  //     opacity: 0.5,
  //   });

  //   const geolist: THREE.Geometry[] = [];
  //   for (let i = 0; i < 24000; i++) {
  //     const geo = new THREE.Geometry();
  //     geo.vertices.push(new THREE.Vector3(100 + i, 100, 0));
  //     geo.vertices.push(new THREE.Vector3(100, 100, 100));
  //     geo.vertices.push(new THREE.Vector3(0, 100, 100));
  //     geo.faces.push(new THREE.Face3(0, 2, 1));
  //     geolist.push(geo);

  //     const mesh = new THREE.Mesh(geo, mat);
  //     mesh.position.set(i * 10, 40, i * 10);
  //     scene.add(mesh);
  //   }
  // }

  window.addEventListener("resize", () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  });

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

  console.log("Hello JFA !");
});
