export function useSound() {
  const play = (src: string) => {
    const audio = new Audio(src);
    audio.play().catch(() => {
      // evita errores por autoplay policy
    });
  };

  return {
    playScan: () => play("/sounds/scan.mp3"),
    playError: () => play("/sounds/error.mp3"),
  };
}
