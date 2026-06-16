// src/components/Node.jsx

/**
 * A single network node, rendered as an SVG <g>. Used for every node in
 * every layer — root categories, sub-categories, and leaf items — so its
 * visual treatment (active glow vs. inactive dimming) is consistent
 * everywhere. Whether a node opens a panel or expands children is decided
 * by the caller (NeuralNetwork.jsx); this component only renders + reports
 * clicks/keypresses.
 */
function Node({ id, label, x, y, isActive, isSelected, hasChildren, onActivate }) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onActivate(id);
    }
  };

  return (
    <g
      className={[
        'node',
        isActive ? 'node--active' : 'node--inactive',
        isSelected ? 'node--selected' : '',
        hasChildren ? 'node--branch' : 'node--leaf',
      ]
        .filter(Boolean)
        .join(' ')}
      transform={`translate(${x}, ${y})`}
      role="button"
      tabIndex={0}
      aria-label={label}
      aria-expanded={hasChildren ? isSelected : undefined}
      onClick={() => onActivate(id)}
      onKeyDown={handleKeyDown}
    >
      {/* Soft outer glow — only meaningful once .node--active applies a
          visible color/opacity to it via CSS; kept in the DOM always so
          the transition animates smoothly instead of mounting on click. */}
      <circle className="node__glow" r={18} cx={0} cy={0} />

      {/* The solid node body */}
      <circle className="node__core" r={7} cx={0} cy={0} />

      {/* Label sits to the right by default; flipped via CSS data
          attribute when a node is near the right edge (handled by parent
          passing a className override if needed — kept simple for now). */}
      <text className="node__label" x={16} y={4}>
        {label}
      </text>
    </g>
  );
}

export default Node;