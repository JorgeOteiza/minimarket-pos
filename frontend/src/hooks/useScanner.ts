import { useEffect, useRef } from "react";

export function useScanner(onScan: (barcode: string) => void) {
  const buffer = useRef("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        if (buffer.current) {
          onScan(buffer.current);
          buffer.current = "";
        }
        return;
      }

      if (e.key.length === 1) {
        buffer.current += e.key;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onScan]);
}
