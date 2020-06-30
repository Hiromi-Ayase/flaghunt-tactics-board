import * as THREE from "three";
import settings from "./settings";
import Draggable from "./draggable";
import Manager from "./manager";

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
  public readonly object: THREE.Mesh;

  constructor(private manager: Manager) {
    this.object = new THREE.Mesh(Box.geometry);
    this.object.castShadow = true;
  }
  moveVertical(delta: number): void {
    if (Math.abs(delta) < 0.3) return;
    const cellSize = settings.global.cell.size;
    const level = delta < 0 ? 1 : 2;
    const y = (level - 0.5) * cellSize;
    const pos = this.object.position;

    for (const id in this.manager.boxes) {
      if (id === this.object.name) continue;

      const other = this.manager.boxes[id];
      if (
        other.object.position.x == pos.x &&
        other.object.position.y == y &&
        other.object.position.z == pos.z
      ) {
        return;
      }
    }
    this.manager.state.boxes[this.object.name].level = level;
    this.manager.renderView();

    this.object.material = Box.material[level - 1];
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

    for (const id in this.manager.boxes) {
      if (id === this.object.name) continue;

      const other = this.manager.boxes[id];
      if (
        other.object.position.x == nx &&
        other.object.position.z == nz &&
        other.object.position.y == this.object.position.y
      ) {
        return;
      }
    }

    if (this.object.position.x === nx && this.object.position.z === nz) {
      return;
    }

    this.manager.state.boxes[this.object.name].x = nx;
    this.manager.state.boxes[this.object.name].y = nz;
    this.object.position.set(nx, this.object.position.y, nz);
    this.manager.renderView();
  }
}
