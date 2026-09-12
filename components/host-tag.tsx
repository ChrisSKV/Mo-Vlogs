
/** Instagram/YouTube verification tick. Drawn, not an image: it has to read
 *  at 14px and it is the single most recognised trust glyph this audience has. */
export function VerifiedMark({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-label="Verified" role="img">
      <path
        fill="#3b9ae1"
        d="M12 1.5 14.6 4l3.6-.5 1.2 3.4 3.1 1.9-1.3 3.4 1.3 3.4-3.1 1.9-1.2 3.4-3.6-.5L12 22.5 9.4 20l-3.6.5-1.2-3.4-3.1-1.9L2.8 12 1.5 8.6l3.1-1.9 1.2-3.4L9.4 4 12 1.5Z"
      />
      <path fill="#fff" d="m10.8 15.4 5.7-5.7-1.4-1.4-4.3 4.3-2-2-1.4 1.4 3.4 3.4Z" />
    </svg>
  );
}

/**
 * The identity lockup, straddling the top edge of the opt-in card.
 *
 * This is the page's most important trust element and it earns its place twice
 * over. Mo's fans have been explicitly warned that scammers impersonate him to
 * harvest personal details, so the question "is this actually him" fires at
 * exactly the moment someone is about to type their phone number — which is
 * where this sits. And it answers with the two things people actually check:
 * the verified handle and the subscriber count.
 *
 * Straddling the edge rather than stacking above it means it costs the fold
 * budget about 12px instead of 60.
 */
/**
 * Instagram story ring: the gradient, then a gap, then the face.
 *
 * Borrowed on purpose. It is the one avatar treatment this audience reads
 * instantly as a real account rather than a stock headshot, which is the whole
 * job of it on a page that has to prove it is actually his.
 *
 * `gap` is the colour of the ring's inner gap, so the ring can sit on a white
 * card or on the black footer without a pale halo around the face.
 */
export function MoAvatar({
  size = 46,
  gap = "bg-white",
  priority,
}: {
  size?: number;
  gap?: string;
  priority?: boolean;
}) {
  return (
    <span
      style={{ width: size, height: size }}
      className="flex shrink-0 items-center justify-center rounded-full bg-[conic-gradient(from_215deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888,#f09433)] p-[2px]"
    >
      <span className={`flex h-full w-full items-center justify-center rounded-full p-[2px] ${gap}`}>
        <img
          src="/assets/mo-avatar.jpg"
          alt=""
          width={900}
          height={900}
          loading={priority ? "eager" : "lazy"}
          decoding={priority ? "sync" : "async"}
          className="h-full w-full rounded-full object-cover"
        />
      </span>
    </span>
  );
}

/**
 * The identity lockup on its own, laid out inline.
 *
 * Split from HostTag because the two pages need it in different places: the
 * light page straddles it across the top edge of the form card, the dark
 * variant sits it above the headline as the first thing on the page. Same
 * object, two placements, one definition.
 */
export function HostLockup({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-2.5 whitespace-nowrap rounded-full border border-line bg-white py-1.5 pl-1.5 pr-4.5 shadow-float ${className}`}
    >
      <MoAvatar priority />
      <span className="flex flex-col leading-none">
        <span className="flex items-center gap-1">
          <span className="font-display text-[13.5px] font-bold tracking-[-0.02em] text-ink">
            Mo Vlogs
          </span>
          <VerifiedMark className="h-[13px] w-[13px]" />
        </span>
        <span className="mt-1 text-[11.5px] text-muted">
          @movlogs <span className="text-line-2">&middot;</span> 11.9M subscribers
        </span>
      </span>
    </span>
  );
}

export function HostTag() {
  return (
    <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/2">
      <HostLockup />
    </div>
  );
}
