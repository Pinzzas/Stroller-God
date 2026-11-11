// Pure hazard rules: no game engine, no drawing, no timers.

const MS_PER_SECOND = 1000;

// Larger of the column gap and the row gap.
export function tileDistance(a, b) {
  return Math.max(Math.abs(a.col - b.col), Math.abs(a.row - b.row));
}

// idle -> warning -> active -> done on the walk clock.
export function timedState(atMs, walkMs, warningMs, activeMs) {
  if (walkMs < atMs - warningMs) return 'idle';
  if (walkMs < atMs) return 'warning';
  if (walkMs < atMs + activeMs) return 'active';
  return 'done';
}

// Triggered hazards only move forward: idle -> warning -> active -> done.
export function nextTriggeredState(prev, distance, warningRadius, triggerRadius) {
  if (prev === 'idle' || prev === 'warning') {
    if (distance <= triggerRadius) return 'active';
    if (prev === 'idle' && distance <= warningRadius) return 'warning';
    return prev;
  }
  if (prev === 'active' && distance > triggerRadius) return 'done';
  return prev;
}

// Where a roaming hazard is: first -> last -> first, repeating, moving smoothly.
export function roamPosition(route, walkMs, speed) {
  const lastStep = route.length - 1;
  const roundTrip = 2 * lastStep;
  const steps = (walkMs / MS_PER_SECOND) * speed;
  const along = ((steps % roundTrip) + roundTrip) % roundTrip;
  const forward = along <= lastStep ? along : roundTrip - along;
  const index = Math.min(Math.floor(forward), lastStep - 1);
  const part = forward - index;
  const from = route[index];
  const to = route[index + 1];
  return {
    col: from.col + (to.col - from.col) * part,
    row: from.row + (to.row - from.row) * part,
  };
}

// One { id, state, col, row } per hazard. prev is the last result, or null at the start.
export function updateHazards(hazards, kinds, prev, walkMs, stroller, tuning) {
  return hazards.map((hazard, i) => {
    const type = kinds[hazard.kind].type;
    if (type === 'roaming') {
      const spot = roamPosition(hazard.route, walkMs, tuning.roamSpeed);
      return { id: hazard.id, state: 'active', col: spot.col, row: spot.row };
    }
    const { col, row } = hazard;
    if (type === 'timed') {
      return { id: hazard.id, state: timedState(hazard.atMs, walkMs, tuning.warningMs, tuning.timedActiveMs), col, row };
    }
    if (type === 'triggered') {
      const before = prev ? prev[i].state : 'idle';
      const state = nextTriggeredState(before, tileDistance(stroller, hazard), tuning.warningRadius, tuning.triggerRadius);
      return { id: hazard.id, state, col, row };
    }
    return { id: hazard.id, state: 'active', col, row };
  });
}

// Ring size while warning: grows 1 -> maxScale and back, one half-pulse each way.
export function pulseScale(timeMs, halfPulseMs, maxScale) {
  const phase = (timeMs % (2 * halfPulseMs)) / halfPulseMs;
  const t = phase <= 1 ? phase : 2 - phase;
  return 1 + (maxScale - 1) * t;
}
