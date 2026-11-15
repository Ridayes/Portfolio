/**
 * "welcome to my portfolio" lockup. On md+ it sits at its Figma coordinates inside the
 * scaled desktop stage (1 design px = var(--u)); on small screens it flows and centres.
 */
export function Hero() {
  return (
    <h1 className="relative z-10 flex flex-col items-center text-ink select-none desk:absolute desk:top-[calc(266.09*var(--u))] desk:left-[calc(218.96*var(--u))] desk:block desk:w-[calc(875.09*var(--u))]">
      <span className="animate-rise font-sans text-[clamp(1.25rem,6vw,2rem)] leading-normal [animation-delay:120ms] desk:absolute desk:top-[calc(42.91*var(--u))] desk:left-[calc(168.03*var(--u))] desk:text-[calc(37.774*var(--u))]">
        welcome to my
      </span>{" "}
      <span className="-mt-[0.2em] block animate-rise font-display text-[clamp(5rem,26vw,10rem)] leading-[1.2] tracking-[-0.02em] italic [animation-delay:220ms] desk:mt-0 desk:pl-[calc(88*var(--u))] desk:text-[calc(255*var(--u))]">
        portfolio
      </span>
    </h1>
  );
}
