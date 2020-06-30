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
    return;
    const ctx = this.board.fieldCanvas.getContext("2d");
    this.board.fieldTexture.needsUpdate = true;

    const boardObj = this.board.object;
    const state = this.state;
    const cellSize = settings.global.cell.size;
    const bw = cellSize * state.board.width;
    const bh = cellSize * state.board.height;

    ctx.canvas.height = ctx.canvas.width * bw / bh;
    const fx = ctx.canvas.width / bw;
    const fy = ctx.canvas.height / bh;

    const cw = ctx.canvas.width;
    const ch = ctx.canvas.height;

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, cw, ch);

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

      const x = (rx + ox) * fx;
      const y = (ry + oy) * fy;
      if (x < 0 || x >= cw || y < 0 || y >= ch) continue;

      const dx = (cellSize * fx) / 2;
      const dy = (cellSize * fy) / 2;
      boxes[boxId] = [
        { x: x - dx, y: y - dy }, //left top
        { x: x + dx, y: y - dy }, //right top
        { x: x + dx, y: y + dy }, //right bottom
        { x: x - dx, y: y + dy }, //left bottom
      ];

      const pos = boxes[boxId][0];
      ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
      ctx.fillRect(pos.x, pos.y, dx * 2, dy * 2);
    }

    for (const playerId in this.players) {
      const player = state.players[playerId];
      const playerObj = this.players[playerId].object;
      const rx = playerObj.position.x;
      const ry = playerObj.position.z;

      const x = rx + ox;
      const y = ry + oy;
      if (x < 0 || x >= cw || y < 0 || y >= ch) continue;

      players[playerId] = {
        x: x,
        y: y,
        view: {
          from: player.dir - player.view / 2,
          to: player.dir + player.view / 2,
        },
      };

      const pos = players[playerId];
      ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, cellSize / 3, 0, Math.PI * 2);
      ctx.fill();
    }

    const limit = { top: 0, bottom: bh, right: bw, left: 0 };

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(100 * fx, 100 * fy);
    ctx.stroke();

    for (const playerId in players) {
      const player = players[playerId];
      ctx.beginPath();
      ctx.moveTo(player.x, player.y);

      const view = player.view;
      const arr = [];
      for (const boxId in boxes) {
        const box = boxes[boxId];
        for (const p of box) {
          const dx = p.x - player.x;
          const dy = p.y - player.y;

          const a = Math.atan2(dy, dx);
          const b = a + Math.PI * 2;

          if (
            (view.from <= a && a <= view.to) ||
            (view.from <= b && b <= view.to)
          ) {
            arr.push({ dx: dx, dy: dy, angle: Math.atan2(dy, dx) });
          }
        }
      }
      arr.sort((a, b) => a.angle - b.angle);

      for (const p of arr) {

      }
    }
  }
}
