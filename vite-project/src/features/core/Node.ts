import type { Champion } from '../selector/champion-selector/types';

export class Node {
  path: string[];

  constructor(init?: Iterable<string>) {
    this.path = init ? [...init].sort() : [];
  }

  hasBaseId(baseId: string, champMap: Map<string, Champion>): boolean {
    return this.path.some(id => champMap.get(id)?.baseId === baseId);
  }

  has(id: string): boolean {
    return this.path.includes(id);
  }

  push(id: string): Node {
    if (this.has(id)) return this;

    const next = [...this.path];

    const idx = next.findIndex(v => v > id);
    if (idx === -1) next.push(id);
    else next.splice(idx, 0, id);

    return new Node(next);
  }

  static merge(a: Node, b: Node): Node {
    let result = new Node(a.path);
    for (const id of b.path) {
      result = result.push(id);
    }
    return result;
  }

  size() {
    return this.path.length;
  }

  toArray(): string[] {
    return [...this.path];
  }

  key(): string {
    return this.path.join(',');
  }
}

