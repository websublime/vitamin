export interface TreeCollection<T extends unknown> {
  id?: number|string;
  index?: number;
  items: T[];
  parentKey?: string;
  idKey?: string
}

// eslint-disable-next-line no-unused-vars
export type Listener = (...args: any[]) => void

export interface Events {
  [event: string]: Listener[]
}
