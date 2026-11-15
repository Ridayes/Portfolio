type Props = {
  active: boolean;
  onClose: () => void;
  onMinimize: () => void;
  onZoom: () => void;
  /** Dot diameter and gap, so the Finder window (14px) and the utility panel (12px) can share it. */
  size?: number;
  gap?: number;
  zoomed?: boolean;
};

const glyph =
  "size-[62%] opacity-0 transition-opacity duration-100 group-hover/lights:opacity-100 group-focus-within/lights:opacity-100";

/**
 * macOS window controls. Glyphs appear while the group is hovered or focused, and the dots
 * go grey while the window is in the background (see `.traffic-lights` in globals.css).
 */
export function TrafficLights({ active, onClose, onMinimize, onZoom, size = 14, gap = 9, zoomed }: Props) {
  const style = { width: size, height: size };
  return (
    <div
      className="traffic-lights group/lights flex items-center"
      style={{ gap }}
      data-active={active}
      data-no-drag
    >
      <button type="button" aria-label="Close window" onClick={onClose} className="bg-[#fe736a]" style={style}>
        <svg viewBox="0 0 10 10" className={glyph} aria-hidden="true">
          <path d="M2.7 2.7l4.6 4.6m0-4.6L2.7 7.3" stroke="#7a0b03" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      </button>
      <button type="button" aria-label="Minimize window" onClick={onMinimize} className="bg-[#fbba2d]" style={style}>
        <svg viewBox="0 0 10 10" className={glyph} aria-hidden="true">
          <path d="M2.3 5h5.4" stroke="#8a5300" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </button>
      <button
        type="button"
        aria-label={zoomed ? "Restore window size" : "Zoom window"}
        aria-pressed={zoomed}
        onClick={onZoom}
        className="bg-[#19c132]"
        style={style}
      >
        <svg viewBox="0 0 10 10" className={glyph} aria-hidden="true">
          <path d="M3 2.6h3.4a1 1 0 0 1 1 1V7zM7 7.4H3.6a1 1 0 0 1-1-1V3z" fill="#0b5c13" />
        </svg>
      </button>
    </div>
  );
}
