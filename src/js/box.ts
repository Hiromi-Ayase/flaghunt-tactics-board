import * as THREE from "three";
import settings from "./settings";
import Draggable from "./draggable";

export default class Box implements Draggable {
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
  moveVertical(delta: number): void {
    if (delta < 0.1) return;
    const cellSize = settings.global.cell.size;
    const level = delta < 0 ? 1 : 2;
    const y = (level - 0.5) * cellSize;
    this.object.material = Box.material[level - 1];
    const pos = this.object.position;
    this.object.position.set(pos.x, y, pos.z);
  }

  getObject(): THREE.Object3D {
    return this.object;
  }
  rotate(): void {
    // none.
  }
  moveTo(x: number, z: number): void {
    const cellSize = settings.global.cell.size;
    const nx = Math.floor(x / cellSize + 0.5) * cellSize;
    const nz = Math.floor(z / cellSize + 0.5) * cellSize;
    this.object.position.set(nx, this.object.position.y, nz);
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
