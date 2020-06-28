import * as THREE from "three";
import Draggable from "./draggable";

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
    public camera: THREE.Camera,
    public domElement: HTMLCanvasElement,
    public plane = new THREE.Plane(new THREE.Vector3(0, 1, 0))
  ) {
    super();

    domElement.addEventListener("mousedown", (e) => {
      this.type = e.button == 0 ? 0 : 1;
      this.onStart(e.clientX, e.clientY);
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
      if (e.touches.length === 1) {
        const touch = e.changedTouches[0];
        this.onStart(touch.clientX, touch.clientY);
      } else {
        const x = e.touches[0].clientX;
        const y = e.touches[0].clientY;
        this.onStart(x, y);
      }
    });
    domElement.addEventListener("touchmove", (e) => {
      e.preventDefault();
      if (e.touches.length === 1) {
        const touch = e.changedTouches[0];
        this.onLeftDragging(touch.clientX, touch.clientY);
      } else {
        const x = e.touches[0].clientX;
        const y = e.touches[0].clientY;
        this.onRightDragging(x, y);
      }
    });
    domElement.addEventListener("touchend", (e) => {
      e.preventDefault();
      if (e.touches.length == 0) {
        this.onEnd();
      }
    });
  }

  public add(v: Draggable): void {
    const obj = v.getObject();
    this.objects.push(obj);
    this.map[obj.id] = v;
  }

  public remove(v: Draggable): void {
    const obj = v.getObject();
    this.objects.splice(this.objects.indexOf(obj), 1);
    delete this.map[obj.id];
  }

  private onStart(x: number, y: number): void {
    if (this.target !== undefined) {
      return;
    }

    const rect = this.domElement.getBoundingClientRect();
    this.mouse.x = ((x - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((y - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersections = this.raycaster.intersectObjects(this.objects, true);

    if (intersections.length > 0) {
      let obj = intersections[0].object;

      while (!(obj.id in this.map)) {
        obj = obj.parent;
      }

      this.target = this.map[obj.id];
      const position = this.target.getObject().position;
      this.plane.constant = -position.y;
      if (this.raycaster.ray.intersectPlane(this.plane, this.intersection)) {
        this.offset.copy(this.intersection).sub(position);
        this.dispatchEvent({ type: "activate" });
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
        this.dispatchEvent({ type: "dragging" });

        const x = this.intersection.x - this.offset.x;
        const z = this.intersection.z - this.offset.z;
        this.target.moveTo(x, z);
      }
    }
  }

  private onEnd(): void {
    if (this.target !== undefined) {
      this.dispatchEvent({ type: "deactivate" });
      this.target = undefined;
      this.type = -1;
    }
  }
}
