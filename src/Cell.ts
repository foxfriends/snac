import { Dim2, Dimensions } from "./World";
import { WorldView } from "./WorldView";

export abstract class Cell<D extends Dimensions = Dim2> {
  abstract update(world: WorldView<D>): Cell<D>;
}
