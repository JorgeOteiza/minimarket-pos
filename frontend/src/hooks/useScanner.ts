import { useEffect, useRef } from "react";

export function useScanner(onScan: (barcode: string) => void) {
  const buffer = useRef("");
  const lastKeyTime = useRef(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const now = Date.now();

      // Si pasa mucho tiempo entre teclas → reset (no es scanner)
      if (now - lastKeyTime.current > 100) {
        buffer.current = "";
      }

      lastKeyTime.current = now;

      // Enter = fin de escaneo
      if (e.key === "Enter") {
        if (buffer.current.length > 5) {
          onScan(buffer.current);
        }
        buffer.current = "";
        return;
      }

      // Solo caracteres válidos
      if (/^[a-zA-Z0-9]$/.test(e.key)) {
        buffer.current += e.key;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onScan]);
}
