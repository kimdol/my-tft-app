import type { Champion } from './types';


export const getImageUrl = (champ: Champion) => {
  if (champ.imageUrl) return champ.imageUrl;

  const key = champ.id.charAt(0).toUpperCase() + champ.id.slice(1);

  return `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${key}_0.jpg`;
};
