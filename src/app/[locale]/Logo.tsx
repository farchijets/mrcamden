type Props = {
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeMap = {
  sm: "text-[13px] sm:text-sm",
  md: "text-base sm:text-xl",
  lg: "text-2xl sm:text-4xl",
};

export default function Logo({ size = "md", className = "" }: Props) {
  return (
    <span
      className={`gold-text leading-none whitespace-nowrap font-black uppercase ${sizeMap[size]} ${className}`}
      style={{
        fontFamily: "var(--font-cinzel), 'Cinzel', Georgia, serif",
        letterSpacing: "0.28em",
      }}
    >
      MR<span style={{ letterSpacing: "0.05em" }}>.</span> CAMDEN
    </span>
  );
}
