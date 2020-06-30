import * as THREE from "three";
import HelvertikerFont from "three/examples/fonts/helvetiker_regular.typeface.json";
import settings from "./settings";

/**
 * Board class.
 */
export default class Board {
  private static material = new THREE.MeshStandardMaterial({
    color: settings.board.dot.color,
  });
  private static geometry = new THREE.BoxGeometry(
    settings.board.base.unit,
    settings.board.base.unit,
    settings.board.base.unit
  );

  private static groundMaterial = new THREE.MeshStandardMaterial({
    color: settings.board.plane.ground.color,
  });

  private static font = new THREE.Font(HelvertikerFont);
  private static numberGeometry: THREE.Geometry[];

  public readonly fieldCanvas = document.createElement("canvas");
  public readonly fieldTexture = new THREE.CanvasTexture(this.fieldCanvas);
  private readonly fieldMaterial = new THREE.MeshStandardMaterial({
    map: this.fieldTexture,
    alphaTest: 1.0,
  });

  public readonly object: THREE.Object3D;

  /**
   * Constructor.
   * @param width Board width.
   * @param height Board height.
   */
  constructor(width = 31, height = 21) {
    this.object = new THREE.Object3D();
    this.fieldCanvas.width = 4096;
    this.fieldCanvas.height = 4096;

    Board.numberGeometry = new Array(100);
    for (let i = 0; i < 100; i++) {
      const space = i < 10 ? "  " : "";
      Board.numberGeometry[i] = this.createTextGeometry(space + i);
    }
    this.setSize(width, height);
  }

  /**
   * Set new board size.
   * @param w Width.
   * @param h Height.
   */
  public setSize(w: number, h: number): void {
    this.object.children = [];
    const cellSize = settings.global.cell.size;
    const geometry = Board.geometry;
    const material = Board.material;
    const depth = settings.board.base.depth;
    const unit = settings.board.base.unit;

    const left = -(w / 2) * cellSize;
    const top = -(h / 2) * cellSize;
    const bottom = (h / 2) * cellSize;
    const right = (w / 2) * cellSize;
    const width = w * cellSize;
    const height = h * cellSize;

    // Create dots.
    for (let i = 0; i <= w; i += 1) {
      for (let j = 0; j <= h; j += 1) {
        const dotMesh = new THREE.Mesh(geometry, Board.material);
        const x = (i - w / 2) * cellSize;
        const z = (j - h / 2) * cellSize;
        dotMesh.scale.set(unit, depth / 2, unit);
        dotMesh.position.set(x, depth, z);
        this.object.add(dotMesh);
      }
    }

    // Create lines.
    const topLineMesh = new THREE.Mesh(geometry, material);
    const bottomLineMesh = new THREE.Mesh(geometry, material);
    const leftLineMesh = new THREE.Mesh(geometry, material);
    const rightLineMesh = new THREE.Mesh(geometry, material);
    topLineMesh.scale.set(width, depth, unit);
    topLineMesh.position.set(0, depth / 2, top);
    bottomLineMesh.scale.set(width, depth, unit);
    bottomLineMesh.position.set(0, depth / 2, bottom);
    leftLineMesh.scale.set(unit, depth / 2, height);
    leftLineMesh.position.set(left, depth / 2, 0);
    rightLineMesh.scale.set(unit, depth / 2, height);
    rightLineMesh.position.set(right, depth / 2, 0);

    this.object.add(topLineMesh);
    this.object.add(bottomLineMesh);
    this.object.add(leftLineMesh);
    this.object.add(rightLineMesh);

    // Create planes.
    const material2 = new THREE.MeshStandardMaterial({
      color: 0x666666,
    });
    const fieldMesh = new THREE.Mesh(geometry, material2);
    fieldMesh.scale.set(width, depth, height);
    fieldMesh.position.set(0, 0, 0);
    fieldMesh.receiveShadow = true;

    const groundMesh = new THREE.Mesh(geometry, Board.groundMaterial);
    const groundSettings = settings.board.plane.ground;
    groundMesh.scale.set(groundSettings.width, depth, groundSettings.height);
    groundMesh.position.set(0, -depth / 2, 0);
    groundMesh.receiveShadow = true;

    this.object.add(fieldMesh);
    this.object.add(groundMesh);

    // Create ledgend.
    for (let i = 0; i <= h; i += 1) {
      const numberMesh = new THREE.Mesh(Board.numberGeometry[i], material);
      numberMesh.rotateX(-Math.PI / 2);
      numberMesh.position.set(
        left - cellSize * 0.7,
        depth / 2,
        top + cellSize * (i + 0.2)
      );
      this.object.add(numberMesh);
    }
    for (let i = 0; i <= w; i += 1) {
      const numberMesh = new THREE.Mesh(Board.numberGeometry[i], material);
      numberMesh.rotateX(-Math.PI / 2);
      numberMesh.position.set(
        left + cellSize * (i - 0.3),
        depth / 2,
        top - cellSize * 0.2
      );
      this.object.add(numberMesh);
    }

    // const ctx = this.fieldCanvas.getContext("2d");
    // const f = settings.board.plane.field.canvas.factor * cellSize;
    // this.fieldCanvas.width = w * f;
    // this.fieldCanvas.height = h * f;
    // ctx.fillStyle = "#FFFFFF";
    // ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    // ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
    // ctx.fillRect(0, 0, f * 10, f * 10);
    // ctx.fillRect(4 * f, 4 * f, 14 * f, 14 * f);
  }

  private createTextGeometry(text: string): THREE.TextGeometry {
    const geometry = new THREE.TextGeometry(text, {
      font: Board.font,
      size: settings.board.text.size,
      height: settings.board.base.depth,
    });
    return geometry;
  }
}
