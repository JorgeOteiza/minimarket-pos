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

      const activeElement = document.activeElement;

      const isTyping =
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        activeElement instanceof HTMLSelectElement;

      if (isTyping) {
        return;
      }

      switch (e.key) {
        case "Enter":
        case "F2":
          e.preventDefault();
          onCheckout();
          break;

        case "F4":
          e.preventDefault();
          onClear();
          break;

        case "F8":
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
