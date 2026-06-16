// src/components/NeuralNetwork.jsx
import { useMemo, useState } from 'react';
import { networkData } from '../data/portfolioData';
import { getColumnX, getStaggeredPositions } from '../utils/layout';
import Node from './Node';
import Connections from './Connections';
import InfoPanel from './InfoPanel';
import '../styles/network.css';

// Taller-than-screen logical canvas — with every node visible at once
// (root + ~19 categories + ~33 leaves) there isn't room for comfortable
// spacing in a single viewport, so the network scrolls vertically instead
// of compressing everything to fit.
const WIDTH = 1800;
const HEIGHT = 3000;
const TOTAL_COLUMNS = 4;

const CORE = { id: 'core', label: 'SP' };

function findNode(nodes, id, ancestors = []) {
  for (const n of nodes) {
    if (n.id === id) return { node: n, path: ancestors };
    if (n.children) {
      const found = findNode(n.children, id, [...ancestors, n.id]);
      if (found) return found;
    }
  }
  return null;
}

// Flattens every layer-2 node (children of every root) into one ordered
// list, and every layer-3 node (children of every layer-2 branch) into
// another — preserving tree order so siblings stay grouped together
// visually even though the whole network renders at once.
function flattenLayer2(roots) {
  return roots.flatMap((root) => root.children || []);
}

function flattenLayer3(layer2Nodes) {
  return layer2Nodes.flatMap((node) => node.children || []);
}

function NeuralNetwork() {
  const [selectedId, setSelectedId] = useState(null);

  const selected = selectedId ? findNode(networkData, selectedId) : null;
  const selectedNode = selected?.node ?? null;
  const ancestorIds = selected?.path ?? [];

  // Every id that should glow right now: the chain from core down to the
  // selected node, plus the selected node's own children — so picking a
  // branch previews what's underneath it, since nothing is hidden to
  // reveal anymore. Empty when nothing is selected, which leaves every
  // node in its dim resting state.
  const activeChain = useMemo(() => {
    const ids = new Set(ancestorIds);
    if (selectedId) ids.add(selectedId);
    if (selectedNode?.children) {
      selectedNode.children.forEach((c) => ids.add(c.id));
    }
    return ids;
  }, [ancestorIds, selectedId, selectedNode]);

  const layer2Nodes = useMemo(() => flattenLayer2(networkData), []);
  const layer3Nodes = useMemo(() => flattenLayer3(layer2Nodes), [layer2Nodes]);

  const corePos = { x: getColumnX(0, TOTAL_COLUMNS, WIDTH), y: HEIGHT / 2 };

  const rootPositions = useMemo(
    () => getStaggeredPositions(networkData, getColumnX(1, TOTAL_COLUMNS, WIDTH), HEIGHT),
    []
  );
  const layer2Positions = useMemo(
    () => getStaggeredPositions(layer2Nodes, getColumnX(2, TOTAL_COLUMNS, WIDTH), HEIGHT),
    [layer2Nodes]
  );
  const layer3Positions = useMemo(
    () => getStaggeredPositions(layer3Nodes, getColumnX(3, TOTAL_COLUMNS, WIDTH), HEIGHT),
    [layer3Nodes]
  );

  // Every connection in the whole tree, built once. Unlike before, this no
  // longer depends on what's selected — the full network is always drawn;
  // `isActive` is computed afterward and only controls glow, not presence.
  const connections = useMemo(() => {
    const lines = [];

    networkData.forEach((root) => {
      lines.push({
        id: `core-${root.id}`,
        x1: corePos.x,
        y1: corePos.y,
        x2: rootPositions[root.id].x,
        y2: rootPositions[root.id].y,
        parentId: 'core',
        childId: root.id,
      });

      (root.children || []).forEach((child) => {
        lines.push({
          id: `${root.id}-${child.id}`,
          x1: rootPositions[root.id].x,
          y1: rootPositions[root.id].y,
          x2: layer2Positions[child.id].x,
          y2: layer2Positions[child.id].y,
          parentId: root.id,
          childId: child.id,
        });

        (child.children || []).forEach((leaf) => {
          lines.push({
            id: `${child.id}-${leaf.id}`,
            x1: layer2Positions[child.id].x,
            y1: layer2Positions[child.id].y,
            x2: layer3Positions[leaf.id].x,
            y2: layer3Positions[leaf.id].y,
            parentId: child.id,
            childId: leaf.id,
          });
        });
      });
    });

    // A connection only glows if both ends sit on the active chain — i.e.
    // it's a link the current selection actually passes through.
    return lines.map((line) => ({
      ...line,
      isActive:
        (line.parentId === 'core' || activeChain.has(line.parentId)) &&
        activeChain.has(line.childId),
    }));
  }, [corePos, rootPositions, layer2Positions, layer3Positions, activeChain]);

  const handleActivate = (id) => {
    setSelectedId((prev) => (prev === id ? null : id));
  };

  const handleCoreClick = () => setSelectedId(null);

  return (
    <div className="network">
      {!selectedId && <p className="network__hint">Select a node to explore</p>}

      <svg className="network__svg" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="xMidYMid meet">
        <Connections connections={connections} />

        <Node
          id={CORE.id}
          label={CORE.label}
          x={corePos.x}
          y={corePos.y}
          isActive={true}
          isSelected={false}
          hasChildren={false}
          onActivate={handleCoreClick}
        />

        {networkData.map((root) => (
          <Node
            key={root.id}
            id={root.id}
            label={root.label}
            x={rootPositions[root.id].x}
            y={rootPositions[root.id].y}
            isActive={activeChain.has(root.id)}
            isSelected={selectedId === root.id}
            hasChildren={Boolean(root.children)}
            onActivate={handleActivate}
          />
        ))}

        {layer2Nodes.map((node) => (
          <Node
            key={node.id}
            id={node.id}
            label={node.label}
            x={layer2Positions[node.id].x}
            y={layer2Positions[node.id].y}
            isActive={activeChain.has(node.id)}
            isSelected={selectedId === node.id}
            hasChildren={Boolean(node.children)}
            onActivate={handleActivate}
          />
        ))}

        {layer3Nodes.map((node) => (
          <Node
            key={node.id}
            id={node.id}
            label={node.label}
            x={layer3Positions[node.id].x}
            y={layer3Positions[node.id].y}
            isActive={activeChain.has(node.id)}
            isSelected={selectedId === node.id}
            hasChildren={false}
            onActivate={handleActivate}
          />
        ))}
      </svg>

      <InfoPanel
        panelData={selectedNode?.panel}
        isOpen={Boolean(selectedNode?.panel)}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}

export default NeuralNetwork;