/**
 * Twinkles over the gold lettering.
 *
 * Six four-point stars on staggered loops, positioned by percentage so they
 * track the artwork at any width. Server rendered, no JavaScript: the whole
 * effect is a transform and an opacity, which the compositor handles on its
 * own thread and which `prefers-reduced-motion` switches off globally.
 *
 * They sit OVER the render rather than being drawn into it, so the highlight
 * moves across metal that is already lit, which is what sells it as metal.
 */

/** Position, size, when it fires and how long it takes. Deliberately uneven,
 *  so the six never read as a repeating pattern. */
const STARS = [
  { top: "6%", left: "11%", size: 20, delay: "0s", dur: "2.9s" },
  { top: "58%", left: "27%", size: 13, delay: "1.4s", dur: "3.4s" },
  { top: "-6%", left: "46%", size: 16, delay: "0.7s", dur: "2.6s" },
  { top: "68%", left: "60%", size: 22, delay: "2.1s", dur: "3.1s" },
  { top: "12%", left: "79%", size: 14, delay: "1.1s", dur: "2.8s" },
  { top: "46%", left: "95%", size: 18, delay: "2.6s", dur: "3.6s" },
];

export function Sparkles() {
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0">
      {STARS.map((s, i) => (
        <span
          key={i}
          className="twinkle absolute block"
          style={{
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            marginLeft: -s.size / 2,
            marginTop: -s.size / 2,
            animationDelay: s.delay,
            animationDuration: s.dur,
          }}
        >
          <svg viewBox="0 0 24 24" className="h-full w-full">
            {/* Four point star with deeply concave sides. The control points
                sit far out toward the tips, so the arms stay needle thin and
                the shape reads as a glint rather than a plus sign. */}
            <path
              d="M12 0c.18 8.4 3.4 11.8 12 12-8.6.2-11.82 3.6-12 12-.18-8.4-3.4-11.8-12-12C8.6 11.8 11.82 8.4 12 0Z"
              fill="#fff6dd"
            />
          </svg>
        </span>
      ))}
    </span>
  );
}
