/**
 * Static ambient background.
 * No continuous animations — keeps scroll/navigation smooth on low-end mobile GPUs.
 */
export function CosmicBg() {
  return (
    <div
      aria-hidden
      className="cosmic-root pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <div className="cosmic-base absolute inset-0" />
      <div className="cosmic-grid absolute inset-0" />
      <div className="cosmic-vignette absolute inset-0" />
    </div>
  );
}
