"use client";

interface RetroButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary";
  type?: "button" | "submit";
  className?: string;
}

export function RetroButton({
  children,
  onClick,
  disabled,
  variant = "primary",
  type = "button",
  className = "",
}: RetroButtonProps) {
  const base =
    "font-[family-name:var(--font-retro)] text-xs px-6 py-3 uppercase tracking-wider transition-all duration-150 pixel-border";
  const variants = {
    primary:
      "bg-[var(--color-dbz-orange)] text-black hover:bg-[var(--color-dbz-gold)] disabled:bg-gray-600 disabled:text-gray-400",
    secondary:
      "bg-[var(--color-surface-card)] text-[var(--color-dbz-orange)] hover:bg-[var(--color-border)]",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
