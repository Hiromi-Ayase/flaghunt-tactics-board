export const settings = {
  global: {
    cell: {
      size: 10,
    },
    border: {
      top: -1000,
      bottom: 1000,
      left: -1000,
      right: -1000,
    },
    resolution: 1000,
  },
  player: {
    num: 12,
    color: [0x0000ff, 0xff0000],
    size: 3,
    text: {
      size: 3,
      depth: 0.1,
    },
  },
  box: {
    size: 9.7,
    color: [0xffcc66, 0x66ccff],
    edge: {
      color: 0x000000,
    },
  },
  fog: {
    color: [0xff0000, 0x0000ff],
  },
  view: {
    opacity: 0.2,
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
        color: 0xffffff,
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
