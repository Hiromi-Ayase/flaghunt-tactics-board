import * as THREE from "three";

export default class Drag2DControl extends THREE.EventDispatcher {
  private readonly raycaster = new THREE.Raycaster();
  private readonly mouse = new THREE.Vector2();

  private target: THREE.Object3D;
  private readonly offset = new THREE.Vector3();
  private readonly intersection = new THREE.Vector3();

  constructor(
    public objects: THREE.Object3D[],
    public camera: THREE.Camera,
    public domElement: HTMLCanvasElement,
    public plane = new THREE.Plane(new THREE.Vector3(0, 1, 0))
  ) {
    super();
    document.addEventListener("mousedown", (e) => this.onDragStart(e));
    document.addEventListener("mousemove", (e) => this.onDragging(e));
    document.addEventListener("mouseup", () => this.onDragEnd());
    document.addEventListener("mouseout", () => this.onDragEnd());
    document.addEventListener("mouseleave", () => this.onDragEnd());
  }

  private onDragStart(event: MouseEvent): void {
    const rect = this.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersections = this.raycaster.intersectObjects(this.objects);

    if (intersections.length > 0) {
      this.target = intersections[0].object;
      this.plane.constant = -this.target.position.y;
      if (this.raycaster.ray.intersectPlane(this.plane, this.intersection)) {
        this.offset.copy(this.intersection).sub(this.target.position);
        this.dispatchEvent({ type: "activate", object: this.target });
      }
    }
  }

  private onDragging(event: MouseEvent): void {
    if (this.target !== undefined) {
      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      if (this.raycaster.ray.intersectPlane(this.plane, this.intersection)) {
        this.target.position.copy(this.intersection.sub(this.offset));
      }
    }
  }

  private onDragEnd(): void {
    this.dispatchEvent({ type: "deactivate", object: this.target });
    this.target = undefined;
  }
}
