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
      height: 21,
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
        const id = "player-" + team + "-" + (i + 1);
        state.players[id] = {
          x: -80 + 20 * i,
          y: -135 + 15 * team,
          num: i,
          team: team,
          angle: 120,
          dir: team == 0 ? 0 : Math.PI,
        };
      }
    }

    for (let j = 1; j <= 2; j++) {
      for (let i = 0; i < 150; i++) {
        const id = "box-" + j + "-" + i;
        state.boxes[id] = {
          x: -150 + 10 * (i % 30),
          y: 150 + Math.floor(i / 30) * 10,
          level: j,
        };
      }
    }
    this.render();
  }

  public render(): void {
    const state = this.state;
    const scene = this.scene;
    const drag2d = this.drag2d;
    this.board.setSize(state.board.width, state.board.height);
    this.board.object.position.x =
      state.board.width % 2 == 0 ? settings.global.cell.size / 2 : 0;
    this.board.object.position.z =
      state.board.height % 2 == 0 ? settings.global.cell.size / 2 : 0;

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
        this.players[id] = new Player(s.num, s.team, this);
        this.players[id].object.name = id;
        scene.add(this.players[id].object);
        drag2d.add(this.players[id]);
      } else {
        objectIds.delete(id);
      }
      const player = this.players[id];
      player.moveTo(s.x, s.y);
      player.object.children[0].rotation.y = s.dir;
    }
    this.renderView();
  }

  public renderView(): void {
    const ctx = this.board.fieldCanvas.getContext("2d");
    this.board.fieldTexture.needsUpdate = true;
    const state = this.state;
    const cellSize = settings.global.cell.size;
    const bh = cellSize * state.board.height;
    const bw = cellSize * state.board.width;

    ctx.canvas.width = bw;
    ctx.canvas.height = bh;
    const ch = ctx.canvas.height;
    const cw = ctx.canvas.width;
    ctx.clearRect(0, 0, cw, ch);

    const offsetX =
      (state.board.width * cellSize + (state.board.height % 2 == 0 ? 1 : 0)) /
      2;
    const offsetY =
      (state.board.height * cellSize + (state.board.width % 2 == 0 ? 1 : 0)) /
      2;

    for (const boxId in this.boxes) {
      const rx = this.boxes[boxId].object.position.x;
      const ry = this.boxes[boxId].object.position.z;

      const x = ((rx + offsetX) / bw) * cw;
      const y = ((ry + offsetY) / bh) * ch;

      if (x < 0 || x >= cw || y < 0 || y >= ch) continue;

      ctx.fillStyle = "rgb(0, 0, 255)";
      ctx.fillRect(x, y, 10, 10);
      console.log(x + " " + y + " " + cw + " " + ch);
    }
    for (const playerId in this.players) {
    }
  }
}
