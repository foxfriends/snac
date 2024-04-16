export interface CellConstructor<C> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new (...args: any): C;
}

export interface Cell {
  // eslint-disable-next-line @typescript-eslint/ban-types
  constructor: Function;
}
