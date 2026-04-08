type Props = {
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeMap = {
  sm: "text-3xl sm:text-4xl",
  md: "text-4xl sm:text-5xl",
  lg: "text-6xl sm:text-7xl",
};

export default function Logo({ size = "md", className = "" }: Props) {
  return (
    <span
      aria-label="Mr. Camden"
      className={`gold-text leading-none whitespace-nowrap inline-block ${sizeMap[size]} ${className}`}
      style={{
        fontFamily: "var(--font-dmserifdisplay), 'DM Serif Display', serif",
        letterSpacing: "-0.04em",
      }}
    >
      MC<span style={{ fontSize: "1.1em", lineHeight: 0 }}>.</span>
    </span>
  );
}
