import React from "react";

export default function RealisticSlidingGraphic({
  pattern = [],
  sashes = [],            // [{type:'fix'|'deschidere', direction:'stanga'|'dreapta'}]
  frameColor = "#94a3b8",
  glassColor = "rgba(233,238,245,0.65)",
  isCompact = false
}) {
  const sashCount = Math.max(1, (pattern?.length || sashes?.length || 2));
  const types = Array.from({ length: sashCount }).map((_, i) => sashes[i]?.type || pattern[i] || "fix");
  const givenDirections = sashes.map(s => s?.direction);

  const borderWidth = isCompact ? 8 : 12;
  const dividerWidth = isCompact ? 6 : 8;
  const trackHeight = isCompact ? 8 : 10;

  // Deduc direcțiile dacă lipsesc
  const deriveDirections = (typesArr) => {
    const dirs = new Array(typesArr.length).fill(null);
    const len = typesArr.length;

    // Cazuri uzuale
    const asKey = typesArr.join("|");
    const map = {
      "fix|deschidere": [null, "left"],
      "deschidere|fix": ["right", null],
      "deschidere|deschidere": ["right", "left"],
      "fix|deschidere|deschidere": [null, "right", "left"],
      "fix|deschidere|deschidere|fix": [null, "left", "right", null],
      "fix|deschidere|deschidere|deschidere|deschidere|fix": [null, "left", "left", "right", "right", null],
    };
    if (map[asKey]) return map[asKey];

    // Default: primele jumătate spre stânga, restul spre dreapta
    return typesArr.map((t, i) => (t === "deschidere" ? (i < len / 2 ? "left" : "right") : null));
  };

  const fallbackDirections = deriveDirections(types);
  const directions = types.map((t, i) => (t === "deschidere" ? (givenDirections[i] || fallbackDirections[i]) : null));

  const ArrowSvg = ({ dir = "left" }) => (
    <svg width="28" height="28" viewBox="0 0 24 24" className="text-slate-700">
      {dir === "left" ? (
        <path d="M15 6L9 12L15 18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      ) : (
        <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      )}
    </svg>
  );

  const FixSvg = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" className="text-slate-600 opacity-80">
      <path d="M4 12h16M12 4v16" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    </svg>
  );

  return (
    <div className="w-full" style={{ aspectRatio: "4 / 3" }}>
      <div
        className="relative w-full h-full rounded-lg overflow-hidden shadow-xl"
        style={{
          border: `${borderWidth}px solid ${frameColor}`,
          boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05), inset 0 2px 4px 0 rgba(0,0,0,0.1)",
          background: "transparent"
        }}
      >
        {/* Sticla + canaturi */}
        <div className="absolute inset-0" style={{ padding: borderWidth }}>
          <div className="w-full h-full flex">
            {Array.from({ length: sashCount }).map((_, idx) => (
              <div
                key={idx}
                className="relative h-full"
                style={{
                  width: `${100 / sashCount}%`,
                  backgroundColor: glassColor,
                  borderRight: idx < sashCount - 1 ? `${dividerWidth}px solid ${frameColor}` : "none"
                }}
              >
                {/* contur interior discret */}
                <div
                  className="absolute inset-1 rounded-sm pointer-events-none"
                  style={{ outline: `1px solid ${frameColor}40` }}
                />
                {/* Semnalistica: fix sau săgeată direcție */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {types[idx] === "fix" ? (
                    <FixSvg />
                  ) : types[idx] === "deschidere" ? (
                    <ArrowSvg dir={directions[idx] === "left" ? "left" : "right"} />
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Șina inferioară (track) */}
        <div
          className="absolute left-0 right-0 bottom-0"
          style={{ height: trackHeight, backgroundColor: frameColor }}
        />
      </div>
    </div>
  );
}