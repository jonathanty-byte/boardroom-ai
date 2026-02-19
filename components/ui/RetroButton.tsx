"use client";

interface RetroButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
}

export function RetroButton({
  children,
  variant = "primary",
  type = "button",
  className = "",
  ...rest
}: RetroButtonProps) {
  const base =
    "text-[10px] px-6 py-3 uppercase tracking-widest transition-all duration-150 font-bold";

  const variants = {
    primary: `
      bg-gradient-to-b from-[#FFD700] via-[#FF8C00] to-[#FF6B00]
      text-black
      border-2 border-[#FFD700]
      shadow-[0_3px_0_0_#cc5500,0_0_15px_rgba(255,107,0,0.3)]
      hover:shadow-[0_3px_0_0_#cc5500,0_0_25px_rgba(255,107,0,0.5)]
      hover:from-[#FFE44D] hover:via-[#FFA033] hover:to-[#FF8533]
      active:shadow-[0_1px_0_0_#cc5500] active:translate-y-[2px]
      disabled:from-gray-700 disabled:via-gray-600 disabled:to-gray-700
      disabled:border-gray-600 disabled:text-gray-400 disabled:shadow-none
    `,
    secondary: `
      bg-[var(--color-surface-card)]
      text-[var(--color-dbz-gold)]
      border-2 border-[#3a3a6a]
      shadow-[0_2px_0_0_#1a1a3a]
      hover:border-[var(--color-dbz-gold)] hover:bg-[#1a1a38]
      active:translate-y-[1px] active:shadow-none
    `,
  };

  return (
    <button type={type} className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
}
