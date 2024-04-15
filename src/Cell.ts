import { WorldView } from "./WorldView";

export abstract class Cell {
  abstract update(world: WorldView): Cell;
}
