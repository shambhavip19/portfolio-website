// src/components/Connections.jsx
import { getCurvedPath } from '../utils/layout';

/**
 * Renders the curved SVG paths connecting nodes between two layers.
 * Receives a flat list of connection descriptors already resolved to
 * coordinates by NeuralNetwork.jsx — this component just draws them.
 *
 * Each connection: { id, x1, y1, x2, y2, isActive }
 * `isActive` means the connection is part of the currently revealed path
 * (parent layer -> visible child layer), so it gets the cyan glow + the
 * traveling signal pulse. Inactive connections (e.g. lines belonging to a
 * collapsed sibling branch) stay rendered but dimmed, never removed —
 * that's what keeps the "always connected" feel from the brief.
 */
function Connections({ connections }) {
  return (
    <g className="connections">
      {connections.map((conn) => {
        const path = getCurvedPath(conn.x1, conn.y1, conn.x2, conn.y2, conn.id);
        return (
          <g key={conn.id} className={`connection ${conn.isActive ? 'connection--active' : 'connection--inactive'}`}>
            {/* Base line, always visible at low opacity when inactive */}
            <path className="connection__path" d={path} />

            {/* Traveling pulse — only meaningful on active connections;
                kept as a separate element so CSS can animate it along the
                same path without affecting the base line's styling. */}
            {conn.isActive && (
              <circle className="connection__pulse" r={3}>
                <animateMotion dur="2.2s" repeatCount="indefinite" path={path} />
              </circle>
            )}
          </g>
        );
      })}
    </g>
  );
}

export default Connections;