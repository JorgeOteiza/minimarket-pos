import { useEffect, useRef } from "react";

export function useScanner(onScan: (barcode: string) => void) {
  const buffer = useRef("");
  const lastKeyTime = useRef(0);
  const isScanning = useRef(false); // 🔥 evita duplicados

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const now = Date.now();

      // 🔹 Ignorar si el foco está en un input (MUY IMPORTANTE)
      const activeElement = document.activeElement;
      if (
        activeElement &&
        (activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA")
      ) {
        return;
      }

      // 🔹 Reset si pasa mucho tiempo (no es scanner)
      if (now - lastKeyTime.current > 50) {
        buffer.current = "";
        isScanning.current = false;
      }

      lastKeyTime.current = now;

      // 🔹 Enter = fin de escaneo
      if (e.key === "Enter") {
        if (buffer.current.length >= 6 && !isScanning.current) {
          isScanning.current = true;

          const code = buffer.current;

          // 🔥 pequeña pausa para evitar doble trigger
          setTimeout(() => {
            onScan(code);
            isScanning.current = false;
          }, 50);
        }

        buffer.current = "";
        return;
      }

      // 🔹 Solo números (códigos de barras reales)
      if (/^[a-zA-Z0-9]$/.test(e.key)) {
        buffer.current += e.key.toUpperCase();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onScan]);
}
