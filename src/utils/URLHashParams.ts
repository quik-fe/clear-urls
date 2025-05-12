import { Multimap } from "./Multimap";

/**
 * Models a hash parameter of a given {@link URL}.
 */
interface IURLHashParams {
  _params: Multimap<any, any>;
  append(name: string, value?: string | null): void;
  delete(name: string): void;
  get(name: string): string | null;
  getAll(name: string): Set<string | null>;
  keys(): IterableIterator<string>;
  toString(): string;
}

/**
 * Models a hash parameter of a given {@link URL}.
 */
export class URLHashParams implements IURLHashParams {
  _params: Multimap<any, any>;
  constructor(url: URL) {
    Object.defineProperty(this, "_params", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0,
    });
    this._params = new Multimap();
    const hash = url.hash.slice(1);
    const params = hash.split("&");
    for (const p of params) {
      const param = p.split("=");
      if (!param[0]) continue;
      const key = param[0];
      let value: any = null;
      if (param.length === 2 && param[1]) {
        value = param[1];
      }
      this._params.put(key, value);
    }
  }
  append(name, value = null) {
    this._params.put(name, value);
  }
  delete(name) {
    this._params.delete(name);
  }
  get(name) {
    const [first] = this._params.get(name);
    if (first) {
      return first;
    }
    return null;
  }
  getAll(name) {
    return this._params.get(name);
  }
  keys() {
    return this._params.keys();
  }
  toString() {
    const rtn: string[] = [];
    this._params.forEach((key, value) => {
      if (value) {
        rtn.push(key + "=" + value);
      } else {
        rtn.push(key);
      }
    });
    return rtn.join("&");
  }
}
