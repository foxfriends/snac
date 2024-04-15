import type { World } from "./World";
import type { Cell } from "./Cell";

export abstract class Neighbourhood<T extends Cell = Cell> implements Iterable<T> {
  filter<U extends T>(pred: (cell: T) => cell is U): Neighbourhood<U>;
  filter(pred: (cell: T) => boolean): Neighbourhood<T>;
  filter<U extends T>(pred: (cell: T) => cell is U): Neighbourhood<U> {
    const Filter = class extends Neighbourhood<U> {
      constructor(private inner: Neighbourhood<T>) {
        super();
      }

      *[Symbol.iterator]() {
        for (const cell of this.inner) {
          if (pred(cell)) yield cell;
        }
      }
    };

    return new Filter(this);
  }

  count() {
    let total = 0;
    for (const _ of this) total += 1;
    return total;
  }

  abstract [Symbol.iterator](): Generator<T>;
}

export class VonNeumannNeighbourhood extends Neighbourhood<Cell> {
  constructor(private world: World, private range: number, private position: readonly number[]) {
    super();
  }

  *[Symbol.iterator]() {
    for (let i = 0; i < this.position.length; ++i) {
      for (let r = 1; r <= this.range; ++r) {
        const left = this.position.map((c, j) => (j === i ? c - r : c));
        const right = this.position.map((c, j) => (j === i ? c + r : c));
        if (this.world.contains(left)) yield this.world.getCell(left);
        if (this.world.contains(right)) yield this.world.getCell(right);
      }
    }
  }
}

export class MooreNeighbourhood extends Neighbourhood<Cell> {
  constructor(private world: World, private range: number, private position: readonly number[]) {
    super();
  }

  *[Symbol.iterator]() {
    for (const offset of multirange(this.position.map(() => [-this.range, this.range]))) {
      if (offset.every((x) => x === 0)) continue;
      const pos = this.position.map((p, i) => p + offset[i]);
      if (this.world.contains(pos)) yield this.world.getCell(pos);
    }
  }
}

function* multirange(ranges: [number, number][]): Generator<number[]> {
  if (!ranges.length) {
    yield [];
    return;
  }

  const [[min, max], ...rest] = ranges;
  for (const tail of multirange(rest)) {
    for (let i = min; i <= max; ++i) {
      yield [i, ...tail];
    }
  }
}
