import { useEffect, useCallback, useMemo, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useLanguageNavigate } from '@/hooks/useLanguageNavigate';
import { useGrafStore } from '@/stores/grafStore';
import { useGraphData } from '@/hooks/useGraphData';
import { GraphCanvas } from './components/GraphCanvas';
import { ControlsPanel } from './components/ControlsPanel';
import { EventDetailsPanel } from './components/EventDetailsPanel';
import { HoverInfoPanel } from './components/HoverInfoPanel';
import { LegendPanel } from './components/LegendPanel';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import './graf.css';

const MOBILE_BREAKPOINT = 768;

export function GrafPage() {
  const navigate = useLanguageNavigate();
  const {
    graphData,
    loading,
    nodeCount,
    linkCount,
    getConnectedNodeIds,
    getNodeById,
    getNodeConnections,
  } = useGraphData();

  const selectedNodeId = useGrafStore((s) => s.selectedNodeId);
  const hoveredNodeId = useGrafStore((s) => s.hoveredNodeId);
  const showControls = useGrafStore((s) => s.showControls);
  const showLegend = useGrafStore((s) => s.showLegend);
  const hoverNode = useGrafStore((s) => s.hoverNode);
  const selectNode = useGrafStore((s) => s.selectNode);
  const setShowControls = useGrafStore((s) => s.setShowControls);
  const setShowLegend = useGrafStore((s) => s.setShowLegend);
  const setMinTrendingScore = useGrafStore((s) => s.setMinTrendingScore);

  const selectedNode = selectedNodeId ? getNodeById(selectedNodeId) : undefined;
  const hoveredNode = hoveredNodeId ? getNodeById(hoveredNodeId) : undefined;

  const hoverConnections = useMemo(
    () => (hoveredNodeId ? getNodeConnections(hoveredNodeId) : []),
    [hoveredNodeId, getNodeConnections]
  );

  const hoverNeighborCount = useMemo(
    () => (hoveredNodeId ? getConnectedNodeIds(hoveredNodeId).length : 0),
    [hoveredNodeId, getConnectedNodeIds]
  );

  const maxTrendingScore = useMemo(
    () => Math.max(1, ...graphData.nodes.map((n) => n.trendingScore)),
    [graphData.nodes]
  );

  // Set initial trending score to middle of scale once data loads
  const didSetInitialScore = useRef(false);
  useEffect(() => {
    if (!didSetInitialScore.current && maxTrendingScore > 1) {
      setMinTrendingScore(Math.round(maxTrendingScore / 2));
      didSetInitialScore.current = true;
    }
  }, [maxTrendingScore, setMinTrendingScore]);

  // Mobile: close both panels on mount, Desktop: keep open
  useEffect(() => {
    const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
    if (isMobile) {
      setShowControls(false);
      setShowLegend(false);
    }
  }, [setShowControls, setShowLegend]);

  // Toggle handlers - on mobile, only one panel at a time
  const handleToggleControls = useCallback(() => {
    const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
    if (isMobile && !showControls) {
      setShowLegend(false);
    }
    setShowControls(!showControls);
  }, [showControls, setShowControls, setShowLegend]);

  const handleToggleLegend = useCallback(() => {
    const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
    if (isMobile && !showLegend) {
      setShowControls(false);
    }
    setShowLegend(!showLegend);
  }, [showLegend, setShowLegend, setShowControls]);

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      switch (e.key) {
        case 'Escape':
          if (selectedNodeId) {
            selectNode(null);
          } else {
            navigate('/');
          }
          break;
        case 'c':
        case 'C':
          handleToggleControls();
          break;
        case 'l':
        case 'L':
          handleToggleLegend();
          break;
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [navigate, selectedNodeId, selectNode, handleToggleControls, handleToggleLegend]);

  useEffect(() => {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, []);

  const handleNodeHover = useCallback(
    (nodeId: string | null) => {
      if (nodeId) {
        hoverNode(nodeId, getConnectedNodeIds(nodeId));
      } else {
        hoverNode(null);
      }
    },
    [hoverNode, getConnectedNodeIds]
  );

  const handleNodeClick = useCallback(
    (nodeId: string) => {
      selectNode(nodeId);
    },
    [selectNode]
  );

  const handleNodeDoubleClick = useCallback(
    (nodeId: string) => {
      navigate(`/event/${nodeId}`);
    },
    [navigate]
  );

  if (loading && graphData.nodes.length === 0) {
    return (
      <div className="graf-loading">
        <LoadingSpinner size={48} />
        <span>Wczytywanie grafu...</span>
      </div>
    );
  }

  return (
    <div className="graf-container">
      <GraphCanvas
        data={graphData}
        onNodeHover={handleNodeHover}
        onNodeClick={handleNodeClick}
        onNodeDoubleClick={handleNodeDoubleClick}
      />

      <div className="graf-top-bar">
        <div className="graf-toggle-buttons">
          <button
            onClick={handleToggleControls}
            className={`graf-toggle-btn ${showControls ? 'active' : ''}`}
            aria-label={showControls ? 'Ukryj kontrolki' : 'Pokaż kontrolki'}
          >
            <i className="ri-settings-3-line" />
          </button>
          <button
            onClick={handleToggleLegend}
            className={`graf-toggle-btn ${showLegend ? 'active' : ''}`}
            aria-label={showLegend ? 'Ukryj legendę' : 'Pokaż legendę'}
          >
            <i className="ri-information-line" />
          </button>
        </div>
        <div className="graf-stats">
          <span>{nodeCount} wydarzeń</span>
          <span className="graf-stats-separator">|</span>
          <span>{linkCount} połączeń</span>
        </div>
      </div>

      <AnimatePresence>
        {showControls && <ControlsPanel maxTrendingScore={maxTrendingScore} />}
      </AnimatePresence>

      <AnimatePresence>
        {showLegend && <LegendPanel />}
      </AnimatePresence>

      <AnimatePresence>
        {selectedNode && (
          <EventDetailsPanel
            node={selectedNode}
            onClose={() => selectNode(null)}
            onNavigate={() => navigate(`/event/${selectedNode.id}`)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {hoveredNode && !selectedNode && (
          <HoverInfoPanel
            node={hoveredNode}
            neighborCount={hoverNeighborCount}
            connections={hoverConnections}
          />
        )}
      </AnimatePresence>

      <div className="graf-hint">
        <span>ESC</span> zamknij
        <span className="graf-hint-spacer">C</span> kontrolki
        <span className="graf-hint-spacer">L</span> legenda
      </div>
    </div>
  );
}
