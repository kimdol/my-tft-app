export interface OpPopoverAnchorRect {
  readonly left: number;
  readonly top: number;
  readonly bottom: number;
  readonly width: number;
}

export interface OpPopoverPositionInput {
  readonly anchor: OpPopoverAnchorRect;
  readonly viewportWidth: number;
  readonly viewportHeight: number;
  readonly contentHeight: number;
}

export interface OpPopoverPosition {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly maxHeight: number;
  readonly side: "above" | "below";
}

export const OP_POPOVER_VIEWPORT_GAP = 8;
export const OP_POPOVER_ANCHOR_GAP = 6;
export const OP_POPOVER_MAX_WIDTH = 360;
export const OP_POPOVER_MAX_HEIGHT = 512;

export const calculateOpPopoverPosition = ({
  anchor,
  viewportWidth,
  viewportHeight,
  contentHeight,
}: OpPopoverPositionInput): OpPopoverPosition => {
  const availableWidth = Math.max(
    0,
    viewportWidth - OP_POPOVER_VIEWPORT_GAP * 2,
  );
  const width = Math.min(OP_POPOVER_MAX_WIDTH, availableWidth);
  const maximumLeft = Math.max(
    OP_POPOVER_VIEWPORT_GAP,
    viewportWidth - width - OP_POPOVER_VIEWPORT_GAP,
  );
  const left = Math.min(
    Math.max(
      anchor.left + anchor.width / 2 - width / 2,
      OP_POPOVER_VIEWPORT_GAP,
    ),
    maximumLeft,
  );
  const below = anchor.bottom + OP_POPOVER_ANCHOR_GAP;
  const availableBelow = Math.max(
    0,
    viewportHeight - OP_POPOVER_VIEWPORT_GAP - below,
  );
  const availableAbove = Math.max(
    0,
    anchor.top -
      OP_POPOVER_ANCHOR_GAP -
      OP_POPOVER_VIEWPORT_GAP,
  );
  const desiredHeight = Math.min(
    contentHeight,
    OP_POPOVER_MAX_HEIGHT,
  );
  const fitsBelow = availableBelow >= desiredHeight;
  const fitsAbove = availableAbove >= desiredHeight;
  const side =
    fitsBelow || (!fitsAbove && availableBelow >= availableAbove)
      ? "below"
      : "above";
  const availableHeight =
    side === "below" ? availableBelow : availableAbove;
  const maxHeight = Math.min(desiredHeight, availableHeight);
  const top =
    side === "below"
      ? below
      : anchor.top - OP_POPOVER_ANCHOR_GAP - maxHeight;

  return { left, top, width, maxHeight, side };
};
