import * as THREE from "three";
import settings from "./settings";
import HelvertikerFont from "three/examples/fonts/helvetiker_regular.typeface.json";
import { Draggable } from "./draggable";

export default class Player implements Draggable {
  private static font = new THREE.Font(HelvertikerFont);
  private static geometry: THREE.Geometry = (() => {
    const size = settings.player.size;
    const torusGeometry = new THREE.TorusGeometry(size, size / 3, 20, 50);
    torusGeometry.rotateX(Math.PI / 2);

    const radius = size / 3;
    const dirGeometry = new THREE.CylinderGeometry(radius, radius, size * 1.5);
    dirGeometry.rotateZ(Math.PI / 2);
    const dirMesh = new THREE.Mesh(dirGeometry);
    dirMesh.position.set(size * 1.7, 0, 0);
    torusGeometry.mergeMesh(dirMesh);

    const dummyGeometry = new THREE.CylinderGeometry(size, size, size / 5);
    torusGeometry.merge(dummyGeometry);
    return torusGeometry;
  })();

  private static captionGeometry: THREE.Geometry[] = (() => {
    const ret: THREE.Geometry[] = [];
    for (let i = 1; i <= 20; i++) {
      const geometry = new THREE.TextGeometry("Player-" + i, {
        font: Player.font,
        size: settings.player.text.size,
        height: settings.player.text.depth,
      });
      geometry.rotateX(-Math.PI / 2);
      ret.push(geometry);
    }
    return ret;
  })();

  private static material = [
    new THREE.MeshStandardMaterial({ color: settings.player.color[0] }),
    new THREE.MeshStandardMaterial({ color: settings.player.color[1] }),
  ];

  object: THREE.Mesh;

  constructor(num: number, team: number) {
    const caption = new THREE.Mesh(
      Player.captionGeometry[num],
      Player.material[team]
    );
    caption.position.z -= settings.player.size * 1.7;
    caption.position.x -= settings.player.size * 0.5;

    this.object = new THREE.Mesh(Player.geometry, Player.material[team]);
    this.object.add(caption);
  }

  moveVertical(): void {
    // none.
  }
  rotate(delta: number): void {
    this.object.rotateY(delta);
  }
  moveTo(x: number, z: number): void {
    this.object.position.set(x, this.object.position.y, z);
  }
  getObject(): THREE.Object3D {
    return this.object;
  }

  set(x: number, z: number, even = false): void {
    const cellSize = settings.global.cell.size;
    const offset = even ? -0.5 : 0;
    const meshX = (x + offset) * cellSize;
    const meshY = 0.5 * cellSize;
    const meshZ = (z + offset) * cellSize;
    this.object.material = Player.material[0];
    this.object.position.set(meshX, meshY, meshZ);
  }
}
