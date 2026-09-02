import type { OpEvaluationResult } from "../domain/staticPower";
import type { ActiveTraitDetail } from "../core/traitEvaluator";
import type { ChampionCardViewModel } from "../team-builder/view-models/championCardViewModel";

export type DetailPopoverContent =
  | {
      readonly kind: "static-op";
      readonly evaluation: OpEvaluationResult;
    }
  | {
      readonly kind: "champion";
      readonly champion: ChampionCardViewModel;
    }
  | {
      readonly kind: "trait";
      readonly trait: ActiveTraitDetail;
    };

export interface DetailPopoverState {
  readonly triggerId: string | null;
  readonly anchor: HTMLButtonElement | null;
  readonly content: DetailPopoverContent | null;
}

const CLOSED_STATE: DetailPopoverState = Object.freeze({
  triggerId: null,
  anchor: null,
  content: null,
});

let state: DetailPopoverState = CLOSED_STATE;
const listeners = new Set<() => void>();

const emit = () => {
  for (const listener of listeners) listener();
};

export const subscribeToDetailPopover = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const getDetailPopoverState = () => state;
export const getClosedDetailPopoverState = () => CLOSED_STATE;

export const closeDetailPopover = (restoreFocus = false) => {
  const anchor = state.anchor;
  state = CLOSED_STATE;
  emit();
  if (restoreFocus) anchor?.focus();
};

export const toggleDetailPopover = (
  triggerId: string,
  anchor: HTMLButtonElement,
  content: DetailPopoverContent,
) => {
  if (state.triggerId === triggerId) {
    closeDetailPopover();
    return;
  }

  state = { triggerId, anchor, content };
  emit();
};
