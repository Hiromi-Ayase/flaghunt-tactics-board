import Player from "./player";
import Box from "./box";
import settings from "./settings";
import Board from "./board";
import Drag2DControl from "./drag2d";
import View from "./view";

interface State {
  board: {
    width: number;
    height: number;
  };
  players: { [id: string]: PlayerState };
  boxes: { [id: string]: BoxState };
}

interface PlayerState {
  view: number;
  x: number;
  y: number;
  num: number;
  team: number;
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
  public readonly view: { [id: string]: View } = {};
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
          view: 120,
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
        this.view[id] = new View(s.team);
        scene.add(this.players[id].object);
        scene.add(this.view[id].object);
        drag2d.add(this.players[id]);
      } else {
        objectIds.delete(id);
      }
      const player = this.players[id];
      player.moveTo(s.x, s.y);
      player.object.children[0].rotation.y = s.dir;
    }

    for (const id of objectIds) {
      scene.remove(scene.getObjectByName(id));
    }

    this.renderView();
  }

  public renderView(): void {
    const boardObj = this.board.object;
    const state = this.state;
    const cellSize = settings.global.cell.size;
    const bw = cellSize * state.board.width;
    const bh = cellSize * state.board.height;

    const ox = -boardObj.position.x + bw / 2;
    const oy = -boardObj.position.z + bh / 2;

    const boxes: {
      [id: string]: [
        { x: number; y: number },
        { x: number; y: number },
        { x: number; y: number },
        { x: number; y: number }
      ];
    } = {};
    const players: {
      [id: string]: {
        x: number;
        y: number;
        view: { from: number; to: number };
      };
    } = {};

    for (const boxId in this.boxes) {
      const boxObj = this.boxes[boxId].object;
      const rx = boxObj.position.x;
      const ry = boxObj.position.z;

      const x = rx + ox;
      const y = ry + oy;
      if (x < 0 || x >= bw || y < 0 || y >= bh) continue;

      const dx = cellSize / 2;
      const dy = cellSize / 2;
      boxes[boxId] = [
        { x: x - dx, y: y - dy }, //left top
        { x: x + dx, y: y - dy }, //right top
        { x: x + dx, y: y + dy }, //right bottom
        { x: x - dx, y: y + dy }, //left bottom
      ];
    }

    const res = settings.global.resolution;

    for (const playerId in this.players) {
      const player = state.players[playerId];
      const playerObj = this.players[playerId].object;
      const rx = playerObj.position.x;
      const ry = playerObj.position.z;

      const x = rx + ox;
      const y = ry + oy;
      if (x < 0 || x >= bw || y < 0 || y >= bh) {
        this.view[playerId].object.visible = false;
        continue;
      } else {
        this.view[playerId].object.visible = true;
      }

      players[playerId] = {
        x: x,
        y: y,
        view: {
          from: Math.floor(((player.dir - player.view / 2) / 360) * res),
          to: Math.floor(((player.dir + player.view / 2) / 360) * res),
        },
      };
    }

    for (const playerId in players) {
      const player = players[playerId];
      const vdata = this.view[playerId].data;
      const viewFrom = player.view.from;
      const viewTo = player.view.to;
      const px = player.x;
      const py = player.y;
      for (let i = 0; i < res; i++) {
        vdata[i] = 0;
      }
      for (let i = viewFrom; i <= viewTo; i++) {
        const angle = (2.0 * Math.PI * i) / res;
        const idx = i < 0 ? i + res : i;
        vdata[idx] = 100000000;
        vdata[idx] = Math.min(vdata[idx], cross(px, py, angle, 0, 0, bw, 0));
        vdata[idx] = Math.min(vdata[idx], cross(px, py, angle, 0, bh, bw, bh));
        vdata[idx] = Math.min(vdata[idx], cross(px, py, angle, 0, 0, 0, bh));
        vdata[idx] = Math.min(vdata[idx], cross(px, py, angle, bw, 0, bw, bh));
        if (isNaN(vdata[idx])) {
          console.log("erro");
        }
      }

      for (const boxId in boxes) {
        const box = boxes[boxId];

        for (let i = 0; i < 4; i++) {
          const x1 = box[i].x - player.x;
          const y1 = box[i].y - player.y;
          const x2 = box[(i + 1) % 4].x - player.x;
          const y2 = box[(i + 1) % 4].y - player.y;

          for (let angle = viewFrom; angle <= viewTo; angle += res) {
            const angle = (2.0 * Math.PI * i) / res;
            vdata[i] = Math.min(vdata[i], cross(px, py, angle, x1, y1, x2, y2));
          }
        }
      }
      this.view[playerId].render();
      this.view[playerId].object.position.copy(this.players[playerId].object.position);
      this.view[playerId].object.position.y = 1;
    }
  }
}

function cross(
  x: number,
  y: number,
  angle: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  const bx = x * Math.cos(angle) * 1e5;
  const by = x * Math.sin(angle) * 1e5;
  const EPS = 1e-9;
  const aa = bx - x;
  const cc = by - y;
  const bb = x1 - x2;
  const dd = y1 - y2;
  const xx = x1 - x;
  const yy = y1 - y;
  const det = aa * dd - bb * cc;
  if (Math.abs(det) < EPS) return 1e9;
  const t = (dd * xx - bb * yy) / det;
  const u = (-cc * xx + aa * yy) / det;
  if (t > -EPS && t < 1 + EPS && u > -EPS && u < 1 + EPS) {
    const t = (dd * xx - bb * yy) / det;
    //    const u = (-cc * xx + aa * yy) / det;

    const crossX = x + (bx - x) * t;
    const corssY = y + (by - y) * t;

    const dx = x - crossX;
    const dy = y - corssY;
    return Math.sqrt(dx * dx + dy * dy);
  }
  return 1e9;
}
