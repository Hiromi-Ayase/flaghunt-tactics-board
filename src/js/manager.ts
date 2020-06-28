import Player from "./player";
import Box from "./box";
import settings from "./settings";
import Board from "./board";
import Drag2DControl from "./drag2d";

interface State {
  board: {
    width: number;
    height: number;
  };
  players: { [id: string]: PlayerState };
  boxes: { [id: string]: BoxState };
}

interface PlayerState {
  x: number;
  y: number;
  num: number;
  team: number;
  angle: number;
  dir: number;
}

interface BoxState {
  x: number;
  y: number;
  level: number;
}

export default class Manager {
  public readonly boxes: { [id: string]: Box } = {};
  public readonly players: { [id: string]: Player } = {};
  public readonly board: Board;

  public state: State = {
    board: {
      width: 31,
      height: 20,
    },
    players: {},
    boxes: {},
  };

  constructor(public scene: THREE.Scene, private drag2d: Drag2DControl) {
    this.board = new Board(this.state.board.width, this.state.board.height);
    scene.add(this.board.object);
  }

  public init(): void {
    const state = this.state;

    for (let team = 0; team < 2; team++) {
      for (let i = 0; i < settings.player.num; i++) {
        const id = "player" + (i + 1);
        state.players[id] = {
          x: 25 * i,
          y: 2,
          num: i,
          team: team,
          angle: 120,
          dir: team == 0 ? 0 : 180,
        };
      }
    }

    for (let i = 1; i < 10; i++) {
      const id = "box-" + i;
      state.boxes[id] = {
        x: 10 * i,
        y: 2,
        level: 1,
      };
    }
    this.render();
  }

  public render(): void {
    const state = this.state;
    const scene = this.scene;
    const drag2d = this.drag2d;
    this.board.setSize(state.board.width, state.board.height);

    const objectIds = new Set<string>();
    for (const object of this.scene.children) {
      if (
        object.name.startsWith("player-") ||
        object.name.startsWith("box-") ||
        object.name.startsWith("object-")
      ) {
        objectIds.add(object.name);
      }
    }

    for (const id in state.boxes) {
      const s = state.boxes[id];
      if (!(id in this.boxes)) {
        this.boxes[id] = new Box(this);
        this.boxes[id].object.name = id;
        scene.add(this.boxes[id].object);
        drag2d.add(this.boxes[id]);
      } else {
        objectIds.delete(id);
      }
      const box = this.boxes[id];
      box.moveTo(s.x, s.y);
      box.moveVertical(s.level == 1 ? -1 : 1);
    }

    for (const id in state.players) {
      const s = state.players[id];
      if (!(id in this.players)) {
        this.players[id] = new Player(s.num, s.team);
        this.players[id].object.name = id;
        scene.add(this.players[id].object);
        drag2d.add(this.players[id]);
      } else {
        objectIds.delete(id);
      }
      const player = this.players[id];
      player.moveTo(s.x, s.y);
    }
  }
  // set(x: number, z: number, even = false): void {
  //   const cellSize = settings.global.cell.size;
  //   const offset = even ? -0.5 : 0;
  //   const meshX = (x + offset) * cellSize;
  //   const meshY = 0.5 * cellSize;
  //   const meshZ = (z + offset) * cellSize;
  //   this.object.material = Player.material[0];
  //   this.object.position.set(meshX, meshY, meshZ);
  // }

  // private floor(v: number): void { }
}
