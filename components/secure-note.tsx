/**
 * The green padlock reassurance.
 *
 * Its own component because it now appears twice: under the button inside the
 * dialog, and under the button in the closing section. Same words in both
 * places is the point, so it lives in one file rather than being typed out
 * again with a different adjective the second time.
 *
 * The colour is the `green` token, which is legible on the light card and on
 * the dark panel, so neither caller has to override it.
 */
export function SecureNote({ className = "" }: { className?: string }) {
  return (
    <p
      className={`flex items-center justify-center gap-2 text-center text-[12.5px] font-semibold text-green ${className}`}
    >
      <svg
        viewBox="0 0 16 16"
        className="h-[15px] w-[15px] shrink-0"
        fill="currentColor"
        aria-hidden
      >
        <path d="M8 1a3.5 3.5 0 0 0-3.5 3.5V6H4a1.5 1.5 0 0 0-1.5 1.5v5A1.5 1.5 0 0 0 4 14h8a1.5 1.5 0 0 0 1.5-1.5v-5A1.5 1.5 0 0 0 12 6h-.5V4.5A3.5 3.5 0 0 0 8 1Zm2 5H6V4.5a2 2 0 1 1 4 0V6Zm-1.25 4.33V11.5a.75.75 0 0 1-1.5 0v-1.17a1.25 1.25 0 1 1 1.5 0Z" />
      </svg>
      {/* One span, not loose text nodes: the row is a flex container, so every
          bare text node would become its own flex item and pick up the gap,
          printing the line with holes in it. */}
      <span>
        Guaranteed <span className="uppercase">free</span> &amp; Secure
        Registration
      </span>
    </p>
  );
}
