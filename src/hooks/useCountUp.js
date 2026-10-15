import { useState, useEffect, useRef } from "react";

const parseTarget = (value) => {
  const n = Number(String(value ?? "").replace(/[^\d.-]/g, ""));
  return Number.isNaN(n) ? null : n;
};

const useCountUp = (target, duration = 900) => {
  const [value, setValue] = useState(0);
  const frameRef = useRef(null);
  const startRef = useRef(null);

  useEffect(() => {
    const to = parseTarget(target);
    if (to === null) return undefined;

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      frameRef.current = requestAnimationFrame(() => setValue(to));
      return () => cancelAnimationFrame(frameRef.current);
    }

    startRef.current = null;
    const step = (ts) => {
      if (startRef.current === null) startRef.current = ts;
      const progress = Math.min((ts - startRef.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(to * eased));
      if (progress < 1) frameRef.current = requestAnimationFrame(step);
    };
    frameRef.current = requestAnimationFrame(step);

    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);

  return value;
};

export default useCountUp;
