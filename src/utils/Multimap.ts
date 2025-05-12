/**
 * Models a multimap backed by a {@link Set}.
 */
interface IMultimap<K, V> extends Iterable<[K, V]> {
  _map: Map<K, Set<V>>;
  _size: number;
  get size(): number;
  get(key: K): Set<V>;
  put(key: K, value: V): boolean;
  has(key: K): boolean;
  hasEntry(key: K, value: V): boolean;
  delete(key: K): boolean;
  deleteEntry(key: K, value: V): boolean;
  clear(): void;
  entries(): IterableIterator<[K, V]>;
  values(): IterableIterator<V>;
  keys(): IterableIterator<K>;
  forEach<T>(
    callback: (this: T | this, key: K, value: V, map: this) => void,
    thisArg?: T
  ): void;
  [Symbol.iterator](): IterableIterator<[K, V]>;
}

/**
 * Models a multimap backed by a {@link Set}.
 */
export class Multimap<K, V> implements IMultimap<K, V> {
  _map: Map<K, Set<V>>;
  _size: number;
  constructor() {
    Object.defineProperty(this, "_map", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0,
    });
    Object.defineProperty(this, "_size", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0,
    });
    this._size = 0;
    this._map = new Map();
  }
  get size() {
    return this._size;
  }
  get(key: K) {
    const values = this._map.get(key);
    if (values) {
      return new Set<V>(values);
    } else {
      return new Set<V>();
    }
  }
  put(key: K, value: V): boolean {
    let values = this._map.get(key);
    if (!values) {
      values = new Set<V>();
    }
    const count = values.size;
    values.add(value);
    if (values.size === count) {
      return false;
    }
    this._map.set(key, values);
    this._size++;
    return true;
  }
  has(key: K) {
    return this._map.has(key);
  }
  hasEntry(key: K, value: V) {
    const values = this._map.get(key);
    if (!values) {
      return false;
    }
    return values.has(value);
  }
  delete(key: K) {
    const values = this._map.get(key);
    if (values && this._map.delete(key)) {
      this._size -= values.size;
      return true;
    }
    return false;
  }
  deleteEntry(key: K, value: V) {
    const values = this._map.get(key);
    if (values) {
      if (!values.delete(value)) {
        return false;
      }
      this._size--;
      return true;
    }
    return false;
  }
  clear() {
    this._map.clear();
    this._size = 0;
  }
  entries() {
    const self = this;
    function* gen() {
      for (const [key, values] of self._map.entries()) {
        for (const value of values) {
          yield [key, value];
        }
      }
    }
    return gen() as IterableIterator<[K, V]>;
  }
  values() {
    const self = this;
    function* gen() {
      for (const [, value] of self.entries()) {
        yield value;
      }
    }
    return gen();
  }
  keys() {
    return this._map.keys();
  }
  forEach(callback: Function, thisArg?: any) {
    for (const [key, value] of this.entries()) {
      callback.call(thisArg === undefined ? this : thisArg, key, value, this);
    }
  }
  [Symbol.iterator]() {
    return this.entries();
  }
}
