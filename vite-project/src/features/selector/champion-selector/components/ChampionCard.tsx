import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import type { Champion } from "../types";
import { COST_BORDERS, CARD_STYLES } from "../constants";
import FallbackAvatar from "./FallbackAvatar";
import Card from "../../../ui/Card";
import Text from "../../../ui/Text";
import { radius } from "../../../styles/tokens";
import type { SelectorMode } from "../../../store/useSelectorModeStore";

interface Props {
  champion: Champion;
  isSelected: boolean;
  isOppositeSelected?: boolean;
  onToggle: (id: string) => void;
  mode: SelectorMode;
}

export default function ChampionCard({
  champion,
  isSelected,
  isOppositeSelected = false,
  onToggle,
  mode,
}: Props) {
  const [imgError, setImgError] = useState(false);

  const isAnySelected = isSelected || isOppositeSelected;

  const isCandidateMode = mode === "candidate";

  const primaryOverlay = isCandidateMode ? "bg-white/20" : "bg-rose-600/45";
  const oppositeOverlay = isCandidateMode ? "bg-rose-600/45" : "bg-white/20";

  const primaryRing = isCandidateMode
    ? "ring-4 ring-white shadow-[0_0_15px_rgba(255,255,255,0.6)]"
    : "ring-4 ring-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.6)]";

  const oppositeRing = isCandidateMode
    ? "ring-4 ring-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.6)]"
    : "ring-4 ring-white shadow-[0_0_15px_rgba(255,255,255,0.6)]";

  const overlayColor = isOppositeSelected ? oppositeOverlay : primaryOverlay;
  const selectedRingColor = isOppositeSelected ? oppositeRing : primaryRing;

  return (
    <div
      onClick={() => onToggle(champion.id)}
      className={`
        relative
        group
        cursor-pointer
        transition-transform
        duration-300
        hover:scale-[1.03]
        active:scale-[0.98]
        ${radius.lg}
        overflow-hidden
      `}
    >
      <Card
        className={`
          p-0
          overflow-hidden
          transition-all
          ${CARD_STYLES.border} 
          ${COST_BORDERS[champion.cost as keyof typeof COST_BORDERS]}
          ${isAnySelected ? `${selectedRingColor} scale-[0.98]` : "hover:brightness-110"}
        `}
      >
        <div className="relative w-full aspect-[2/3] overflow-hidden">
          {!imgError ? (
            <img
              src={champion.imageUrl}
              onError={() => setImgError(true)}
              className="
                absolute inset-0
                w-full h-full
                object-cover
                transition-transform
                duration-300
              "
            />
          ) : (
            <FallbackAvatar name={champion.name} />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

          <div className="absolute top-[2px] left-[2px] flex flex-col gap-0.5 z-10">
            {champion.traits.map((trait, i) => (
              <div
                key={`${champion.id}-trait-${i}`}
                className="w-4 h-4 p-[2px] bg-black/60 backdrop-blur-sm rounded-full border border-white/20 flex items-center justify-center"
              >
                <img
                  src={trait.iconUrl}
                  alt=""
                  className="w-full h-full object-contain"
                />
              </div>
            ))}
          </div>

          <div
            className="
              absolute bottom-0 left-0 w-full 
              px-1 pb-1 pt-10 
              flex flex-col items-center text-center 
              bg-gradient-to-b from-transparent via-black/70 to-black/95
            "
          >
            <Text
              variant="label"
              className="
                w-full text-white font-bold leading-[1] 
                drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] 
                whitespace-normal break-keep text-center
              "
            >
              {champion.name}
            </Text>

            <Text
              variant="caption"
              className="
                text-yellow-400 font-black mt-0.5
                leading-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]
              "
            >
              {champion.cost}G
            </Text>
          </div>

          {isAnySelected && (
            <div
              className={`absolute inset-0 flex items-center justify-center backdrop-blur-[1px] ${overlayColor}`}
            >
              <CheckCircle2 className="text-white w-10 h-10" />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
