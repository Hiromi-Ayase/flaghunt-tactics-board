import * as THREE from "three";
import settings from "./settings";

export default class Player {
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

  private static material = [
    new THREE.MeshStandardMaterial({ color: settings.player.color[0] }),
    new THREE.MeshStandardMaterial({ color: settings.player.color[1] }),
  ];

  object: THREE.Mesh;

  constructor() {
    this.object = new THREE.Mesh(Player.geometry);
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
