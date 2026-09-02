const createSeededRandom = (seed: number) => {
  let state = seed >>> 0;

  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
};

let fallbackSeedCounter = 0;

export const createShuffleSeed = (): number => {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.getRandomValues === "function"
  ) {
    const values = new Uint32Array(1);
    crypto.getRandomValues(values);
    return values[0];
  }

  fallbackSeedCounter = (fallbackSeedCounter + 1) >>> 0;
  return (Date.now() ^ Math.imul(fallbackSeedCounter, 0x9e3779b9)) >>> 0;
};

export const seededShuffle = <T>(
  values: readonly T[],
  seed: number,
): T[] => {
  const shuffled = [...values];
  const random = createSeededRandom(seed);

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [
      shuffled[swapIndex],
      shuffled[index],
    ];
  }

  return shuffled;
};
