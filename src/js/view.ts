import * as THREE from "three";
import settings from "./settings";
import { Mesh } from "three";

export default class View {
  private static geometry = new THREE.BoxGeometry(
    settings.box.size,
    settings.box.size,
    settings.box.size
  );
  private static material = [
    new THREE.MeshStandardMaterial({
      color: settings.player.color[0],
      transparent: true,
      opacity: settings.view.opacity,
    }),
    new THREE.MeshStandardMaterial({
      color: settings.player.color[1],
      transparent: true,
      opacity: settings.view.opacity,
    }),
  ];

  private readonly geometry = new THREE.CircleGeometry(
    1,
    settings.global.resolution
  );

  private static count = 0;
  public object: THREE.Mesh;
  public data: number[] = new Array(settings.global.resolution);

  constructor(public team: number) {
    View.material[team].depthTest = false;
    View.material[team].alphaTest = 0.1;
    this.object = new THREE.Mesh(this.geometry, View.material[team]);
    this.object.rotateX(Math.PI / 2);
    this.object.renderOrder = View.count;
    View.count++;
  }

  render(): void {
    const vec = this.geometry.vertices;
    const res = settings.global.resolution;
    for (let i = 0; i < res; i++) {
      const d = this.data[i];
      const angle = (2 * Math.PI * i) / settings.global.resolution;
      vec[res - i].x = d * Math.cos(angle);
      vec[res - i].y = d * Math.sin(angle);
    }
    this.geometry.verticesNeedUpdate = true;
  }
}
