import type { Champion, Cost } from '../../selector/champion-selector/types';
import type { RawSetData, RawChampion, TFTTrait } from '../tftApi';

export const getAdditionalTraitChampions = (
  originalChampions: Champion[],
  rawSetData: RawSetData,
  allTraits: TFTTrait[]
): Champion[] => {
  const additionalChampions: Champion[] = [];

  const traitNames = allTraits
    .map((t) => t.name)
    .sort((a, b) => b.length - a.length);

  rawSetData.champions.forEach((rawChamp: RawChampion) => {
    const hasSelectionTrait = rawChamp.traits?.includes('특성 선택');
    if (!hasSelectionTrait) return;

    const desc = rawChamp.ability?.desc || '';
    let cleanDesc = desc.replace(/<[^>]*>?/gm, '');

    const foundTraits: string[] = [];

    traitNames.forEach((traitName) => {
      if (traitName !== '특성 선택' && cleanDesc.includes(traitName)) {
        foundTraits.push(traitName);

        cleanDesc = cleanDesc.replace(traitName, '');
      }
    });

    foundTraits.forEach((traitName) => {
      const targetTrait = allTraits.find((t) => t.name === traitName);
      if (!targetTrait) return;

      const originalChamp = originalChampions.find((c) => c.id === rawChamp.apiName);

      additionalChampions.push({
        id: `${rawChamp.apiName}_${traitName}`, 
        baseId: rawChamp.apiName,
        name: `${rawChamp.name} (${traitName})`,
        cost: rawChamp.cost as Cost,

        imageUrl: originalChamp?.imageUrl || '',
        traits: [
          {
            name: targetTrait.name,
            iconUrl: targetTrait.iconUrl,
          },
        ],
      });
    });
  });

  return additionalChampions;
};