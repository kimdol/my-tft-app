
export type Cost = 1 | 2 | 3 | 4 | 5;

export interface Trait {
  name: string;
  iconUrl: string;
}

export interface Champion {
  id: string; 
  baseId: string;
  name: string; 
  cost: Cost; 
  traits: Trait[]; 
  imageUrl: string;
}

export interface ChampionWithMeta extends Champion {
  power?: number;
  synergyScore?: number;
}
