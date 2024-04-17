import test from "ava";
import { Cell } from "./Cell";
import { Dim2, World } from "./World";
import { WorldView } from "./WorldView";

class PosCell implements Cell {
  constructor(public pos: readonly number[]) {}
}

test("cells are initialized with correct positions", (t) => {
  const world = new World([5, 3, 4] as const, (pos) => new PosCell(pos));

  for (let i = 0; i < 5; ++i) {
    for (let j = 0; j < 3; ++j) {
      for (let k = 0; k < 4; ++k) {
        t.deepEqual(world.getCell([i, j, k]), new PosCell([i, j, k]));
      }
    }
  }
});

test("ravel works", (t) => {
  const world = new World([5, 3, 4] as const, (pos) => new PosCell(pos));
  t.is(world.ravel([1, 2, 3]), (1 * 3 + 2) * 4 + 3);
});

test("unravel works", (t) => {
  const world = new World([5, 3, 4] as const, (pos) => new PosCell(pos));
  t.deepEqual(world.unravel((1 * 3 + 2) * 4 + 3), [1, 2, 3]);
});

class LifeCell implements Cell {
  constructor(public live: boolean) {}
}

test("game of life", (t) => {
  const world = new World<Dim2>([3, 3], (pos) => new LifeCell(pos[0] === 1));
  const before = world.dump((cell) => (cell as LifeCell).live);
  world.registerCell(LifeCell, (cell: LifeCell, world: WorldView) => {
    const neighbours = world
      .moore()
      .filter((cell): cell is LifeCell => cell instanceof LifeCell)
      .filter((cell) => cell.live)
      .count();
    if (cell.live && neighbours < 2) return new LifeCell(false);
    if (cell.live && neighbours > 3) return new LifeCell(false);
    if (!cell.live && neighbours === 3) return new LifeCell(true);
    return cell;
  });
  world.update();
  const after = world.dump((cell) => (cell as LifeCell).live);
  t.deepEqual(
    before,
    [
      [false, false, false],
      [true, true, true],
      [false, false, false],
    ],
    "the line is horizontal",
  );
  t.deepEqual(
    after,
    [
      [false, true, false],
      [false, true, false],
      [false, true, false],
    ],
    "the line is vertical",
  );
});
