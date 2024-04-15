import type { World } from "./World.js";
import {
  MooreNeighbourhood,
  VonNeumannNeighbourhood,
  type Neighbourhood,
} from "./Neighbourhood.js";

export class WorldView {
  constructor(private world: World, public position: readonly number[]) {}

  get dimensions() {
    return this.world.dimensions;
  }

  /**
   * View the Moore neighbourhood of this cell.
   *
   * The Moore neighbourhood of cell `o` is marked with `x`
   *
   * ```
   * .....
   * .xxx.
   * .xox.
   * .xxx.
   * .....
   * ```
   */
  moore(range = 1): Neighbourhood {
    return new MooreNeighbourhood(this.world, range, this.position);
  }

  /**
   * View the Von Neumann neighbourhood of this cell.
   *
   * The Von Neumann neighbourhood of cell `o` is marked with `x`
   *
   * ```
   * .....
   * ..x..
   * .xox.
   * ..x..
   * .....
   * ```
   */
  vonNeumann(range = 1): Neighbourhood {
    return new VonNeumannNeighbourhood(this.world, range, this.position);
  }
}
