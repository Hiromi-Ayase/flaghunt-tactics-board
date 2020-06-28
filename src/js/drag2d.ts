import * as THREE from "three";
import { Draggable } from "./draggable";

export default class Drag2DControl extends THREE.EventDispatcher {
  private readonly raycaster = new THREE.Raycaster();
  private readonly mouse = new THREE.Vector2();

  private type = -1;
  private target: Draggable;
  private readonly offset = new THREE.Vector3();
  private readonly intersection = new THREE.Vector3();
  public readonly map: { [id: string]: Draggable } = {};
  public readonly objects: THREE.Object3D[] = [];

  constructor(
    objects: Draggable[],
    public camera: THREE.Camera,
    public domElement: HTMLCanvasElement,
    public plane = new THREE.Plane(new THREE.Vector3(0, 1, 0))
  ) {
    super();

    for (const v of objects) {
      const obj = v.getObject();
      this.objects.push(obj);
      this.map[obj.id] = v;
    }

    domElement.addEventListener("mousedown", (e) => {
      const type = e.button == 0 ? 0 : 1;
      this.onStart(type, e.clientX, e.clientY);
    });
    domElement.addEventListener("mousemove", (e) => {
      if (this.type === 0) {
        this.onLeftDragging(e.clientX, e.clientY);
      } else {
        this.onRightDragging(e.clientX, e.clientY);
      }
    });
    domElement.addEventListener("mouseup", () => this.onEnd());
    domElement.addEventListener("mouseleave", () => this.onEnd());

    domElement.addEventListener("touchstart", (e) => {
      e.preventDefault();
      const touch = e.changedTouches[0];
      this.onStart(0, touch.clientX, touch.clientY);
    });
    domElement.addEventListener("touchmove", (e) => {
      e.preventDefault();
      const touch = e.changedTouches[0];
      if (e.changedTouches.length == 1) {
        this.onLeftDragging(touch.clientX, touch.clientY);
      } else {
        this.onRightDragging(touch.clientX, touch.clientY);
      }
    });
    domElement.addEventListener("touchend", (e) => {
      e.preventDefault();
      this.onEnd();
    });
  }

  private onStart(type: number, x: number, y: number): void {
    if (this.target !== undefined) {
      return;
    }

    const rect = this.domElement.getBoundingClientRect();
    this.mouse.x = ((x - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((y - rect.top) / rect.height) * 2 + 1;
    this.type = type;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersections = this.raycaster.intersectObjects(this.objects);

    if (intersections.length > 0) {
      this.target = this.map[intersections[0].object.id];
      const position = this.target.getObject().position;
      this.plane.constant = -position.y;
      if (this.raycaster.ray.intersectPlane(this.plane, this.intersection)) {
        this.offset.copy(this.intersection).sub(position);
        this.dispatchEvent({ type: "activate", object: this.target });
      }
    }
  }

  private onRightDragging(x: number, y: number): void {
    if (this.target !== undefined) {
      const rect = this.domElement.getBoundingClientRect();
      const cx = ((x - rect.left) / rect.width) * 2 - 1;
      const cy = -((y - rect.top) / rect.height) * 2 + 1;

      const deltaX = (cx - this.mouse.x) * 10;
      const deltaY = (cy - this.mouse.y) * 100;

      this.mouse.x = cx;
      this.mouse.y = cy;

      this.target.rotate(deltaX);
      this.target.moveVertical(deltaY);
    }
  }

  private onLeftDragging(x: number, y: number): void {
    if (this.target !== undefined) {
      const rect = this.domElement.getBoundingClientRect();
      this.mouse.x = ((x - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((y - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      if (this.raycaster.ray.intersectPlane(this.plane, this.intersection)) {
        this.dispatchEvent({ type: "dragging", object: this.target });

        const x = this.intersection.x - this.offset.x;
        const z = this.intersection.z - this.offset.z;
        this.target.moveTo(x, z);
      }
    }
  }

  private onEnd(): void {
    if (this.target !== undefined) {
      this.dispatchEvent({ type: "deactivate", object: this.target });
      this.target = undefined;
      this.type = -1;
    }
  }
}
