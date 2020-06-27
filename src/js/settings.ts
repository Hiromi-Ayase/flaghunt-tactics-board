export const settings = {
  global: {
    cell: {
      size: 10,
    },
  },
  player: {
    color: [0xff0000, 0x0000ff],
    size: 4,
  },
  box: {
    size: 9.7,
    color: [0xffcc66, 0xccaa33],
    edge: {
      color: 0x000000,
    },
  },
  fog: {
    color: [0xff0000, 0x0000ff],
  },
  board: {
    base: {
      unit: 1,
      depth: 0.1,
    },
    text: {
      size: 3,
    },
    dot: {
      color: 0x000000,
    },
    line: {
      color: 0x000000,
    },
    plane: {
      depth: 0.1,
      ground: {
        color: 0xcccccc,
        width: 1000,
        height: 1000,
      },
      field: {
        color: 0xffffff,
        canvas: {
          factor: 10,
        },
      },
    },
  },
};

export default settings;
