import Player from "./player";
import Box from "./box";
import settings from "./settings";

interface State {
  board: {
    width: number;
    height: number;
  };
  players: { [id: string]: PlayerState };
  boxes: { [id: string]: PlayerState };
}

interface PlayerState {
  x: number;
  y: number;
  team: number;
}

interface BoxState {
  x: number;
  y: number;
  level: number;
}

export default class Manager {
  public readonly boxes: Box[] = [];
  public readonly players: Player[] = [];

  public state: State = {
    board: {
      width: 30,
      height: 20,
    },
    players: {},
    boxes: {},
  };

  constructor(public scene: THREE.Scene) {
    //none
  }

  public init(): void {
    const state = this.state;
    for (let team = 0; team < 2; team++) {
      for (let i = 0; i < settings.player.num; i++) {
        const id = "player" + (i + 1);
        state.players[id] = { x: 1, y: 2, team: 3 };
      }
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

  private floor(v: number): void {

  }
}
