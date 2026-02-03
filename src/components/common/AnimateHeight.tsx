import { motion } from "framer-motion";
import { useCallback, useRef, useState } from "react";

interface AnimateHeightProps {
  children: React.ReactNode;
  className?: string;
  duration?: number;
}

export function AnimateHeight({
  children,
  className,
  duration = 0.3,
}: AnimateHeightProps) {
  const [height, setHeight] = useState<number | "auto">("auto");
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const containerRef = useCallback((node: HTMLDivElement | null) => {
    if (node !== null) {
      // Set initial height immediately to avoid flash
      setHeight(node.getBoundingClientRect().height);

      resizeObserverRef.current = new ResizeObserver((entries) => {
        const observedHeight = entries[0]?.contentRect.height;
        if (observedHeight !== undefined) {
          setHeight(observedHeight);
        }
      });
      resizeObserverRef.current.observe(node);
    } else if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect();
    }
  }, []);

  return (
    <motion.div
      className={className}
      style={{ overflow: "hidden" }}
      animate={{ height }}
      transition={{ duration, ease: "easeInOut" }}
    >
      <div ref={containerRef}>{children}</div>
    </motion.div>
  );
}
