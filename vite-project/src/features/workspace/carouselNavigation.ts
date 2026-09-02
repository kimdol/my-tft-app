export interface SwipeNavigationInput {
  currentIndex: number;
  itemCount: number;
  deltaX: number;
  deltaY: number;
}

export const HORIZONTAL_SWIPE_THRESHOLD = 48;
export const HORIZONTAL_INTENT_RATIO = 1.4;

const clampIndex = (index: number, itemCount: number) =>
  Math.min(Math.max(index, 0), Math.max(itemCount - 1, 0));

export const getAdjacentSwipeIndex = ({
  currentIndex,
  itemCount,
  deltaX,
  deltaY,
}: SwipeNavigationInput) => {
  const safeCurrentIndex = clampIndex(currentIndex, itemCount);
  const horizontalDistance = Math.abs(deltaX);
  const verticalDistance = Math.abs(deltaY);

  const hasHorizontalIntent =
    horizontalDistance >= HORIZONTAL_SWIPE_THRESHOLD &&
    horizontalDistance > verticalDistance * HORIZONTAL_INTENT_RATIO;

  if (!hasHorizontalIntent) return safeCurrentIndex;

  const direction = deltaX < 0 ? 1 : -1;
  return clampIndex(safeCurrentIndex + direction, itemCount);
};
