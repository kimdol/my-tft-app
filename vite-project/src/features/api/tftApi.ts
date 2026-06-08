import type { Champion } from "../selector/champion-selector/types";
import { getAdditionalTraitChampions } from "./utils/tftUtils";
import { sortChampionsByCost } from "./utils/sortUtils";


interface Effect {
  breakpoint: number;
  style: number;
}

export interface Trait {
  apiName: string;
  name: string;
  effects: Effect[];
  iconUrl: string;
}

export interface TFTData {
  champions: Champion[];
  traits: Trait[];
}

export const fetchTFTData = async (): Promise<TFTData> => {
    const res = await fetch(
    "https://raw.communitydragon.org/latest/cdragon/tft/ko_kr.json",
  );

  if (!res.ok) throw new Error("Data fetch failed");

  const data = await res.json();

  const setKeys = Object.keys(data.sets || {}).filter(key => !isNaN(Number(key)));
  const latestSetNum = Math.max(...setKeys.map(Number));

  const currentSet = data.sets?.[latestSetNum.toString()]

  if (!currentSet) {
    return { champions: [], traits: [] };
  }

  const BASE_URL = "https://raw.communitydragon.org/latest/game/assets/ux";

  // =========================
  // 1. Trait 먼저 가공
  // =========================
  const traitMap = new Map<string, string>();

  const traits: Trait[] = currentSet.traits.map((trait: any) => {
    const fileName =
      trait.icon.split("/").pop()?.toLowerCase().replace(".tex", ".png") || "";

    const iconUrl = `${BASE_URL}/traiticons/${fileName}`;

    traitMap.set(trait.name, iconUrl);

    const effects: Effect[] = [...trait.effects]
      .sort((a: any, b: any) => a.minUnits - b.minUnits)
      .map((e: any) => ({
        breakpoint: e.minUnits,
        style: e.style,
      }));

    return {
      apiName: trait.apiName,
      name: trait.name,
      effects: effects,
      iconUrl,
    };
  });

  // =========================
  // 2. Champion 가공
  // =========================
  const champions: Champion[] = currentSet.champions
    .filter((c: any) => c.traits && c.traits.length > 0)
    .map((c: any) => {
      const champApiName = c.apiName.replace(/^TFT\d+_/i, "").toLowerCase();

      return {
        id: c.apiName,
        baseId: c.apiName,
        name: c.name,
        cost: c.cost,

        imageUrl: `${BASE_URL}/tft/championsplashes/patching/tft${latestSetNum}_${champApiName}_teamplanner_splash.tft_set${latestSetNum}.png`,

        traits: c.traits.map((tName: string) => ({
          name: tName,
          iconUrl: traitMap.get(tName) || "",
        })),
      };
    });

  // =========================
  // 3. Champion 추가 가공
  // =========================
  const additionalChampions = getAdditionalTraitChampions(
    champions,
    currentSet,
    traits,
  );

  // 교체 대상이 된 원본 baseId 세트 생성
  const replacedBaseIds = new Set(additionalChampions.map((c) => c.baseId));

  // 원본 챔피언 리스트에서 "특성 선택"을 가졌던 원본들만 제거
  const filteredOriginal = champions.filter(
    (c) => !replacedBaseIds.has(c.baseId),
  );

  // 최종 합치기: (원본들 - 특성선택원본) + (특성별로 분리된 신규유닛들)
  const finalChampions = [...filteredOriginal, ...additionalChampions];
  // 최종 정렬
  const sortedChampions = sortChampionsByCost(finalChampions);

  return {
    champions: sortedChampions,
    traits,
  };
};
