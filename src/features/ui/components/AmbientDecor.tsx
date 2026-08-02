/**
 * Holographic ambient decorations — corner brackets and subtle scanline.
 */
export function AmbientDecor() {
  return (
    <>
      <div className="hud-corner hud-corner-tl" aria-hidden />
      <div className="hud-corner hud-corner-tr" aria-hidden />
      <div className="hud-corner hud-corner-bl" aria-hidden />
      <div className="hud-corner hud-corner-br" aria-hidden />

      <div
        className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.03]"
        aria-hidden
      >
        <div className="animate-scan absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-aura-cyan to-transparent" />
      </div>

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(34,211,238,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.5) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
        aria-hidden
      />
    </>
  );
}
