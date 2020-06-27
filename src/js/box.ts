import * as THREE from "three";
import settings from "./settings";

export default class Box {
  private static geometry = new THREE.BoxGeometry(
    settings.box.size,
    settings.box.size,
    settings.box.size
  );
  private static material = [
    new THREE.MeshStandardMaterial({ color: settings.box.color[0] }),
    new THREE.MeshStandardMaterial({ color: settings.box.color[1] }),
  ];
  object: THREE.Mesh;

  constructor() {
    this.object = new THREE.Mesh(Box.geometry);
  }

  set(x: number, z: number, level = 1, even = false): void {
    const cellSize = settings.global.cell.size;
    const offset = even ? -0.5 : 0;
    const meshX = (x + offset) * cellSize;
    const meshY = (level - 0.5) * cellSize;
    const meshZ = (z + offset) * cellSize;
    this.object.material = Box.material[level - 1];
    this.object.position.set(meshX, meshY, meshZ);
  }
}
