// src/utils/layout.js
//
// Turns a list of node ids into organic, staggered on-screen coordinates.
// Nothing here uses Math.random() directly — positions are derived from a
// deterministic hash of each node's id, so the layout is "random-looking"
// but stable across re-renders (a node won't jump around every time React
// re-renders the tree).

// Simple, fast string hash (djb2 variant) mapped into the 0–1 range.
export function hashToUnitFloat(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  // Force unsigned, then normalize to [0, 1)
  return (hash >>> 0) / 4294967295;
}

export const LAYOUT = {
  COLUMN_MARGIN: 0.1, // fraction of width kept clear on left/right edges
  Y_JITTER: 50, // max vertical wobble applied to each node, in px
  X_JITTER: 40, // max horizontal wobble applied to each node, in px
};

/**
 * Returns the x-coordinate for a given column (layer) in a left-to-right
 * network. columnIndex and totalColumns are 0-based / count.
 */
export function getColumnX(columnIndex, totalColumns, width) {
  const margin = width * LAYOUT.COLUMN_MARGIN;
  const usable = width - margin * 2;
  if (totalColumns <= 1) return width / 2;
  return margin + (usable / (totalColumns - 1)) * columnIndex;
}

/**
 * Distributes a set of nodes vertically within a column, evenly spaced as a
 * base, then nudged off-grid with deterministic per-node jitter so the
 * result reads as organic rather than a straight flowchart line.
 *
 * @param {Array<string|{id:string}>} nodes - node ids, or objects with an id
 * @param {number} columnX - the x position for this whole column
 * @param {number} containerHeight - height of the network viewport
 * @returns {Object} map of nodeId -> { x, y }
 */
export function getStaggeredPositions(
  nodes,
  columnX,
  containerHeight,
  { topPadding = 100, bottomPadding = 100 } = {}
) {
  const n = nodes.length;
  const usableHeight = Math.max(containerHeight - topPadding - bottomPadding, 0);
  const step = n > 0 ? usableHeight / (n + 1) : 0;

  const positions = {};
  nodes.forEach((node, i) => {
    const id = typeof node === 'string' ? node : node.id;
    const baseY = topPadding + step * (i + 1);

    // Two independent hashes (different salt strings) so x and y jitter
    // don't move in lockstep for a given node.
    const yJitter = (hashToUnitFloat(`${id}:y`) - 0.5) * LAYOUT.Y_JITTER;
    const xJitter = (hashToUnitFloat(`${id}:x`) - 0.5) * LAYOUT.X_JITTER;

    positions[id] = {
      x: columnX + xJitter,
      y: baseY + yJitter,
    };
  });

  return positions;
}

/**
 * Builds an SVG cubic-bezier path string between two points. The curve
 * shape is nudged by a deterministic seed (usually the connection's id,
 * e.g. "parentId->childId") so connections don't all look identically
 * curved, which is what makes a network of lines feel hand-drawn rather
 * than mechanically generated.
 */
export function getCurvedPath(x1, y1, x2, y2, seedStr = '') {
  const dx = x2 - x1;
  const seed = hashToUnitFloat(seedStr || `${x1}-${y1}-${x2}-${y2}`);

  const curveAmount = 0.45 + (seed - 0.5) * 0.2; // how far control points reach toward the middle
  const verticalNudge = (seed - 0.5) * 24; // small vertical kink so curves vary

  const cp1x = x1 + dx * curveAmount;
  const cp1y = y1 + verticalNudge;
  const cp2x = x2 - dx * curveAmount;
  const cp2y = y2 - verticalNudge;

  return `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`;
}