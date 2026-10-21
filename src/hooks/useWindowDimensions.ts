import { useEffect, useState } from "react";

export type WindowDimensions = { width: number; height: number };

function read(): WindowDimensions {
  if (typeof window === "undefined") return { width: 0, height: 0 };
  return { width: window.innerWidth, height: window.innerHeight };
}

/** Viewport size, updated on resize. Used to upgrade cut-down views on wide clients. */
export function useWindowDimensions(): WindowDimensions {
  const [dimensions, setDimensions] = useState<WindowDimensions>(read);

  useEffect(() => {
    const handleResize = () => setDimensions(read());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return dimensions;
}
