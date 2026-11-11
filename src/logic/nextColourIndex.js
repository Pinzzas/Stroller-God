// Returns the next colour position, going back to 0 after the last one.
export function nextColourIndex(currentIndex, colourCount) {
  const next = currentIndex + 1;
  if (next >= colourCount) {
    return 0;
  }
  return next;
}
