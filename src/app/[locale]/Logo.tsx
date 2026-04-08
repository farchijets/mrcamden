type Props = {
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeMap = {
  sm: "text-2xl sm:text-3xl",
  md: "text-3xl sm:text-4xl",
  lg: "text-5xl sm:text-6xl",
};

export default function Logo({ size = "md", className = "" }: Props) {
  return (
    <span
      className={`font-cursive gold-text leading-none whitespace-nowrap ${sizeMap[size]} ${className}`}
      style={{ fontFamily: "var(--font-pinyon), 'Pinyon Script', cursive" }}
    >
      Mr. Camden
    </span>
  );
}
