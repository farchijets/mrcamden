type Props = {
  size?: "sm" | "md" | "lg";
  markOnly?: boolean;
  className?: string;
};

const sizeMap = {
  sm: { svg: 28, text: "text-base sm:text-lg" },
  md: { svg: 36, text: "text-lg sm:text-2xl" },
  lg: { svg: 52, text: "text-3xl sm:text-4xl" },
};

export default function Logo({ size = "md", markOnly = false, className = "" }: Props) {
  const s = sizeMap[size];
  return (
    <span className={`inline-flex items-center gap-2 sm:gap-3 ${className}`}>
      <svg
        width={s.svg}
        height={s.svg}
        viewBox="0 0 64 64"
        fill="none"
        aria-label="Mr. Camden"
        className="shrink-0"
      >
        <defs>
          <linearGradient id="mrc-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f2d98a" />
            <stop offset="50%" stopColor="#e6c26e" />
            <stop offset="100%" stopColor="#a87a2c" />
          </linearGradient>
          <linearGradient id="mrc-gold-soft" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e6c26e" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#c8a04a" stopOpacity="0.6" />
          </linearGradient>
        </defs>

        {/* outer seal ring */}
        <circle cx="30" cy="30" r="27" stroke="url(#mrc-gold)" strokeWidth="2" />
        {/* inner thin ring */}
        <circle cx="30" cy="30" r="23" stroke="url(#mrc-gold-soft)" strokeWidth="0.6" />

        {/* tiny hallmark flourishes — top & bottom ticks */}
        <line x1="30" y1="3" x2="30" y2="7" stroke="url(#mrc-gold)" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="30" y1="53" x2="30" y2="57" stroke="url(#mrc-gold)" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="3" y1="30" x2="7" y2="30" stroke="url(#mrc-gold)" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="53" y1="30" x2="57" y2="30" stroke="url(#mrc-gold)" strokeWidth="1.4" strokeLinecap="round" />

        {/* Serif "M" monogram inside the lens */}
        <text
          x="30"
          y="41"
          textAnchor="middle"
          fontFamily="'Playfair Display', Georgia, serif"
          fontSize="28"
          fontWeight="700"
          fontStyle="italic"
          fill="url(#mrc-gold)"
        >
          M
        </text>

        {/* monocle chain — hangs off the right side */}
        <path
          d="M 56 36 Q 62 44 58 54 Q 56 58 60 60"
          fill="none"
          stroke="url(#mrc-gold)"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeDasharray="1 2.2"
        />
      </svg>

      {!markOnly && (
        <span
          className={`font-serif gold-text tracking-[0.22em] whitespace-nowrap ${s.text}`}
        >
          MR. CAMDEN
        </span>
      )}
    </span>
  );
}
