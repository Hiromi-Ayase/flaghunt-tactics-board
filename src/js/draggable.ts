export default interface Draggable {
  rotate(delta: number): void;
  moveTo(x: number, z: number): void;
  moveVertical(delta: number): void;
  getObject(): THREE.Object3D;
}
