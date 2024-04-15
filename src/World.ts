import type { Cell } from "./Cell";
import { WorldView } from "./WorldView";

export type Dimensions = readonly number[];

export type Position<D extends Dimensions> = D extends readonly [
  infer _,
  ...infer Rest extends Dimensions,
]
  ? [number, ...Position<Rest>]
  : D extends []
    ? []
    : number[];

export type Grid<D extends Dimensions, T> = D extends [number]
  ? T[]
  : D extends [number, ...infer Rest extends Dimensions]
    ? Grid<Rest, T>[]
    : D extends []
      ? []
      : never;

export class World<D extends Dimensions = Dimensions> {
  static clone<D extends Dimensions>(world: World<D>): World<D> {
    return new World(world.dimensions, (position) => world.getCell(position));
  }

  constructor(
    public dimensions: D,
    init: (position: Position<D>) => Cell,
  ) {
    const length = dimensions.reduce((a, b) => a * b, 1);
    this.state = Array.from(new Array(length), (_, pos) => init(this.unravel(pos)));
  }

  private state: Cell[];

  ravel(position: Position<D>): number {
    return position.reduce((prev, pos, i) => prev * this.dimensions[i] + pos, 0);
  }

  unravel(index: number): Position<D> {
    const position: number[] = [];
    for (let i = this.dimensions.length - 1; i >= 0; --i) {
      const dim = this.dimensions[i];
      const pos = index % dim;
      position.unshift(pos);
      index = (index - pos) / dim;
    }
    return position as Position<D>;
  }

  contains(position: number[]): position is Position<D> {
    return position.every((val, i) => val >= 0 && val < this.dimensions[i]);
  }

  getCell(position: Position<D>) {
    return this.state[this.ravel(position)];
  }

  view(position: Position<D>): WorldView {
    return new WorldView(this, position);
  }

  update(rounds = 1) {
    for (let i = 0; i < rounds; ++i) {
      this.state = this.state.map((cell, i) => cell.update(this.view(this.unravel(i))));
    }
  }

  dump<T>(dumper: (cell: Cell) => T): Grid<D, T> {
    const grid: unknown[] = [];
    for (const [i, cell] of this.state.entries()) {
      const value = dumper(cell);
      const position = this.unravel(i);
      const container = position
        .slice(0, -1)
        // @ts-expect-error -- Doing some witchcraft
        .reduce((grid, index) => (grid[index] ??= []), grid) as unknown as T[];
      container[position[position.length - 1]] = value;
    }
    return grid as Grid<D, T>;
  }

  *[Symbol.iterator](): Generator<[Position<D>, Cell]> {
    for (const [i, cell] of this.state.entries()) {
      yield [this.unravel(i), cell];
    }
  }
}
