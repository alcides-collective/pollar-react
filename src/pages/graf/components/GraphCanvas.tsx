import { useRef, useCallback, useEffect, useReducer, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { forceX, forceY, forceCollide } from 'd3-force-3d';
import { animate } from 'framer-motion';
import { useGrafStore } from '@/stores/grafStore';
import type { GraphData, GraphNode, GraphLink } from '@/types/graph';
import { CONNECTION_CONFIGS } from '@/types/graph';

interface GraphCanvasProps {
  data: GraphData;
  onNodeHover: (nodeId: string | null) => void;
  onNodeClick: (nodeId: string) => void;
  onNodeDoubleClick: (nodeId: string) => void;
}

export function GraphCanvas({
  data,
  onNodeHover,
  onNodeClick,
  onNodeDoubleClick: _onNodeDoubleClick,
}: GraphCanvasProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const graphRef = useRef<any>(null);
  const needsZoomToFit = useRef(true);
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const mode = useGrafStore((s) => s.mode);
  const hoveredNodeId = useGrafStore((s) => s.hoveredNodeId);
  const highlightedNodeIds = useGrafStore((s) => s.highlightedNodeIds);
  const selectedNodeId = useGrafStore((s) => s.selectedNodeId);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Trigger zoomToFit when mode or data changes
  useEffect(() => {
    needsZoomToFit.current = true;
  }, [mode, data.nodes.length]);

  // Handle engine stop - zoom to fit when needed
  const handleEngineStop = useCallback(() => {
    if (needsZoomToFit.current && graphRef.current) {
      graphRef.current.zoomToFit(400, 80);
      needsZoomToFit.current = false;
    }
  }, []);

  // Apply layout based on mode
  useEffect(() => {
    if (!graphRef.current || data.nodes.length === 0) return;

    const fg = graphRef.current;

    switch (mode) {
      case 'force': {
        // Scale charge with link density — sparse graphs get weaker repulsion
        const linkRatio = data.links.length / Math.max(data.nodes.length, 1);
        const charge = -Math.min(1200, 300 + linkRatio * 200);
        fg.d3Force('charge')?.strength(charge);
        fg.d3Force('link')?.distance((link: GraphLink) => 250 / (link.strength || 1));

        // Collision force — prevent nodes from overlapping based on their size
        fg.d3Force('collide', forceCollide((node: GraphNode) => node.val + 8).strength(0.8));

        // Centering forces — keep disconnected nodes from flying away
        const centerStrength = linkRatio < 1 ? 0.08 : 0.03;
        fg.d3Force('centerX', forceX(0).strength(centerStrength));
        fg.d3Force('centerY', forceY(0).strength(centerStrength));

        data.nodes.forEach((node) => {
          node.fx = undefined;
          node.fy = undefined;
        });
        fg.d3ReheatSimulation();
        break;
      }

      case 'radial': {
        const categories = [...new Set(data.nodes.map((n) => n.category))];
        const centerX = dimensions.width / 2;
        const centerY = dimensions.height / 2;
        const radius = Math.min(centerX, centerY) * 0.65;

        data.nodes.forEach((node) => {
          const catIndex = categories.indexOf(node.category);
          const nodesInCategory = data.nodes.filter((n) => n.category === node.category);
          const indexInCategory = nodesInCategory.indexOf(node);
          const categoryAngle = (catIndex / categories.length) * Math.PI * 2 - Math.PI / 2;
          const spreadAngle = (Math.PI * 2) / categories.length;
          const nodeAngle = categoryAngle + (indexInCategory / nodesInCategory.length - 0.5) * spreadAngle * 0.6;
          const nodeRadius = radius * (0.6 + Math.random() * 0.4);

          node.fx = centerX + nodeRadius * Math.cos(nodeAngle);
          node.fy = centerY + nodeRadius * Math.sin(nodeAngle);
        });
        fg.d3ReheatSimulation();
        break;
      }

      case 'hierarchical': {
        const sortedByScore = [...data.nodes].sort(
          (a, b) => b.trendingScore - a.trendingScore
        );
        const levels = 5;
        const nodesPerLevel = Math.ceil(sortedByScore.length / levels);

        sortedByScore.forEach((node, i) => {
          const level = Math.floor(i / nodesPerLevel);
          const indexInLevel = i % nodesPerLevel;
          const actualNodesInLevel = Math.min(
            nodesPerLevel,
            sortedByScore.length - level * nodesPerLevel
          );

          node.fx =
            (dimensions.width / (actualNodesInLevel + 1)) * (indexInLevel + 1);
          node.fy = 80 + (dimensions.height - 160) * (level / (levels - 1 || 1));
        });
        fg.d3ReheatSimulation();
        break;
      }

      case 'timeline': {
        if (data.nodes.length === 0) break;

        const sortedByDate = [...data.nodes].sort(
          (a, b) => a.date.getTime() - b.date.getTime()
        );
        const minDate = sortedByDate[0].date.getTime();
        const maxDate = sortedByDate[sortedByDate.length - 1].date.getTime();
        const timeSpan = maxDate - minDate || 1;

        const rows: { [key: number]: number } = {};

        sortedByDate.forEach((node) => {
          const timePos = (node.date.getTime() - minDate) / timeSpan;
          const x = 120 + timePos * (dimensions.width - 240);
          const xKey = Math.round(x / 60);

          if (rows[xKey] === undefined) rows[xKey] = 0;
          const row = rows[xKey];
          rows[xKey] = (rows[xKey] + 1) % 8;

          node.fx = x;
          node.fy = dimensions.height / 2 + (row - 3.5) * 50;
        });
        fg.d3ReheatSimulation();
        break;
      }
    }
  }, [mode, data.nodes, dimensions]);

  // --- Smooth opacity transitions via lerp ---
  const linkAnimRef = useRef(new Map<string, { alpha: number; width: number }>());
  const nodeAnimRef = useRef(new Map<string, number>());
  const LERP = 0.18;
  const SNAP = 0.003;

  function lerp(current: number, target: number): number {
    const diff = target - current;
    return Math.abs(diff) < SNAP ? target : current + diff * LERP;
  }

  // Force re-renders during transition so ForceGraph2D gets new callback refs → repaints
  const [animTick, bumpTick] = useReducer((x: number) => x + 1, 0);

  useEffect(() => {
    const controls = animate(0, 1, {
      duration: 0.4,
      ease: 'easeOut',
      onUpdate: () => bumpTick(),
    });
    return () => controls.stop();
  }, [hoveredNodeId]);

  // Node rendering
  const nodeCanvasObject = useCallback(
    (node: GraphNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const isHighlighted = highlightedNodeIds.has(node.id);
      const isSelected = selectedNodeId === node.id;
      const isDimmed = hoveredNodeId && !isHighlighted;

      const targetAlpha = isDimmed ? 0.15 : 1;
      const prev = nodeAnimRef.current.get(node.id) ?? targetAlpha;
      const alpha = lerp(prev, targetAlpha);
      nodeAnimRef.current.set(node.id, alpha);

      const size = node.val;
      const x = node.x || 0;
      const y = node.y || 0;

      // Draw glow for highlighted nodes
      if (isHighlighted && alpha > 0.5) {
        ctx.beginPath();
        ctx.arc(x, y, size + 4, 0, Math.PI * 2);
        ctx.fillStyle = `${node.color}30`;
        ctx.fill();
      }

      // Draw node
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = node.color;
      ctx.fill();

      // Draw border — always visible, stronger for selection/highlight
      if (isSelected) {
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
      } else if (isHighlighted && alpha > 0.5) {
        ctx.strokeStyle = node.color;
        ctx.lineWidth = 2;
      } else {
        ctx.strokeStyle = `rgba(255,255,255,0.15)`;
        ctx.lineWidth = 1;
      }
      ctx.stroke();

      // Draw label for larger nodes or when zoomed in
      if ((size > 12 || globalScale > 1.2) && alpha > 0.3) {
        const label = node.label.length > 35 ? node.label.substring(0, 35) + '...' : node.label;
        const fontSize = Math.max(9, Math.min(12, size * 0.6));
        ctx.font = `500 ${fontSize}px Inter, system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        ctx.globalAlpha = alpha * 0.8;
        ctx.fillStyle = 'rgba(0,0,0,1)';
        ctx.fillText(label, x + 1, y + size + 5);

        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#ffffff';
        ctx.fillText(label, x, y + size + 4);
      }

      ctx.globalAlpha = 1;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hoveredNodeId, highlightedNodeIds, selectedNodeId, animTick]
  );

  // Link rendering
  const linkCanvasObject = useCallback(
    (link: GraphLink, ctx: CanvasRenderingContext2D) => {
      const sourceNode = typeof link.source === 'object' ? link.source : data.nodes.find((n) => n.id === link.source);
      const targetNode = typeof link.target === 'object' ? link.target : data.nodes.find((n) => n.id === link.target);

      if (!sourceNode || !targetNode) return;

      const isHighlighted =
        highlightedNodeIds.has(sourceNode.id) && highlightedNodeIds.has(targetNode.id);
      const isDimmed = hoveredNodeId && !isHighlighted;

      const color = CONNECTION_CONFIGS[link.type].color;

      // Strength 1–12 → normalized 0–1
      const t = Math.min(link.strength / 12, 1);

      let targetAlpha: number;
      let targetWidth: number;
      if (isHighlighted) {
        targetAlpha = 0.5 + t * 0.5;
        targetWidth = link.strength * 0.8;
      } else if (isDimmed) {
        targetAlpha = 0.08 + t * 0.07;
        targetWidth = 0.5 + t * 1.5;
      } else {
        targetAlpha = 0.01 + t * 0.07;
        targetWidth = 0.5 + t * 1.5;
      }

      // Lerp from stored animated values
      const sid = typeof link.source === 'object' ? (link.source as GraphNode).id : link.source;
      const tid = typeof link.target === 'object' ? (link.target as GraphNode).id : link.target;
      const key = `${sid}|${tid}|${link.type}`;

      const prev = linkAnimRef.current.get(key);
      const alpha = prev ? lerp(prev.alpha, targetAlpha) : targetAlpha;
      const width = prev ? lerp(prev.width, targetWidth) : targetWidth;
      linkAnimRef.current.set(key, { alpha, width });

      const alphaHex = Math.round(alpha * 255).toString(16).padStart(2, '0');

      ctx.beginPath();
      ctx.moveTo(sourceNode.x || 0, sourceNode.y || 0);
      ctx.lineTo(targetNode.x || 0, targetNode.y || 0);
      ctx.strokeStyle = alpha >= 0.99 ? color : `${color}${alphaHex}`;
      ctx.lineWidth = width;
      ctx.stroke();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data.nodes, hoveredNodeId, highlightedNodeIds, animTick]
  );

  const handleNodeHover = useCallback(
    (node: GraphNode | null) => {
      onNodeHover(node?.id || null);
      document.body.style.cursor = node ? 'pointer' : 'default';
    },
    [onNodeHover]
  );

  const handleNodeClick = useCallback(
    (node: GraphNode) => {
      onNodeClick(node.id);
    },
    [onNodeClick]
  );

  const handleBackgroundClick = useCallback(() => {
    onNodeClick('');
  }, [onNodeClick]);

  return (
    <ForceGraph2D
      ref={graphRef}
      graphData={data}
      nodeId="id"
      nodeVal="val"
      nodeLabel=""
      nodeCanvasObject={nodeCanvasObject}
      linkCanvasObject={linkCanvasObject}
      onNodeHover={handleNodeHover}
      onNodeClick={handleNodeClick}
      onBackgroundClick={handleBackgroundClick}
      onEngineStop={handleEngineStop}
      onNodeDragEnd={(node) => {
        if (mode === 'force') {
          (node as GraphNode).fx = node.x;
          (node as GraphNode).fy = node.y;
        }
      }}
      backgroundColor="#09090b"
      width={dimensions.width}
      height={dimensions.height}
      cooldownTicks={100}
      d3AlphaDecay={0.02}
      d3VelocityDecay={0.3}
      enableNodeDrag={true}
      enableZoomInteraction={true}
      enablePanInteraction={true}
      minZoom={0.1}
      maxZoom={6}
    />
  );
}
