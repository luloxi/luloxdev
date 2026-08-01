/** Subtle violet / orange radiation waves - decorative only */
export function CosmicBg() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <div className="cosmic-base absolute inset-0" />
      <div className="cosmic-grid absolute inset-0 opacity-[0.2] dark:opacity-[0.18]" />
      <div className="cosmic-wave cosmic-wave-a absolute inset-0" />
      <div className="cosmic-wave cosmic-wave-b absolute inset-0" />
      <div className="cosmic-wave cosmic-wave-c absolute inset-0" />
      <div className="cosmic-noise absolute inset-0 opacity-[0.05] dark:opacity-[0.06]" />
      <div className="cosmic-vignette absolute inset-0" />
    </div>
  );
}
