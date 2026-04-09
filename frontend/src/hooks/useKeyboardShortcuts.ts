import { useEffect } from "react";

type Props = {
  onCheckout: () => void;
  onClear: () => void;
  onRemoveLast: () => void;
  disabled?: boolean;
};

export function useKeyboardShortcuts({
  onCheckout,
  onClear,
  onRemoveLast,
  disabled = false,
}: Props) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled) return;

      // 🔥 NO interferir con inputs
      const activeElement = document.activeElement;
      if (
        activeElement &&
        (activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA")
      ) {
        return;
      }

      switch (e.key) {
        case "F2": // 💰 cobrar
          e.preventDefault();
          onCheckout();
          break;

        case "F4": // 🧹 limpiar
          e.preventDefault();
          onClear();
          break;

        case "F8": // ⬅️ eliminar último
          e.preventDefault();
          onRemoveLast();
          break;

        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onCheckout, onClear, onRemoveLast, disabled]);
}
