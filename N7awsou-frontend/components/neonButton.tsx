"use client";

import { useState } from "react";
type Props = {
  text?: string;
};

export default function CustomButt({ text }: Props) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <button
        className="relative px-8 py-4 text-lg font-semibold text-[#FCAE16] bg-transparent border-2 border-[#FCAE16] rounded-3xl transition-all duration-300 ease-in-out transform hover:scale-105"
        style={{
          boxShadow: isHovered
            ? `
              0 0 5px #FCAE16,
              0 0 10px #FCAE16,
              0 0 20px #FCAE16,
              inset 0 0 10px rgba(252, 174, 22, 0.1)
            `
            : "none",
          textShadow: isHovered ? "0 0 5px #FCAE16" : "none",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <span className="relative z-10">NEON BUTTON</span>

        {/* Animated glow effect on hover */}
        <div
          className="absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-300"
          style={{
            background:
              "linear-gradient(45deg, transparent, rgba(252, 174, 22, 0.3), transparent)",
            boxShadow: isHovered
              ? `
                0 0 10px #FCAE16,
                0 0 20px #FCAE16,
                0 0 30px #FCAE16,
                0 0 40px #FCAE16
              `
              : "none",
            opacity: isHovered ? 1 : 0,
          }}
        />
      </button>
    </div>
  );
}
