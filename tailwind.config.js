/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        sand: "#f5efe9",
        dune: "#e8d9cc",
        clay: "#c9a990",
        mocha: "#7a5748",
        cocoa: "#5f4036",
        blush: "#f0e6de",
        olive: "#8a9a7b",
        gold: "#c9a225",
        "gold-light": "#f5e3a0"
      },
      boxShadow: {
        soft: "0 16px 40px -28px rgba(88, 60, 48, 0.45)",
        lift: "0 18px 50px -24px rgba(88, 60, 48, 0.5)",
        gold: "0 0 0 3px rgba(201,162,37,0.35), 0 8px 24px -8px rgba(201,162,37,0.5)"
      },
      backgroundImage: {
        "hero-glow": "radial-gradient(circle at 80% 20%, rgba(201, 169, 144, 0.35), transparent 45%), radial-gradient(circle at 10% 10%, rgba(245, 239, 233, 0.7), transparent 50%)",
        "shimmer": "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)"
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" }
        },
        "soft-float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" }
        },
        "pulse-ring": {
          "0%": { transform: "scale(1)", boxShadow: "0 0 0 0 rgba(201,162,37,0.5)" },
          "70%": { transform: "scale(1.02)", boxShadow: "0 0 0 12px rgba(201,162,37,0)" },
          "100%": { transform: "scale(1)", boxShadow: "0 0 0 0 rgba(201,162,37,0)" }
        },
        "shimmer-slide": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(100%)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "pop": {
          "0%": { transform: "scale(0.5)", opacity: "0" },
          "70%": { transform: "scale(1.15)" },
          "100%": { transform: "scale(1)", opacity: "1" }
        },
        "marquee": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" }
        }
      },
      animation: {
        "fade-up": "fade-up 0.8s ease-out both",
        "fade-in": "fade-in 0.5s ease-out both",
        "soft-float": "soft-float 6s ease-in-out infinite",
        "pulse-ring": "pulse-ring 2s ease-out infinite",
        "shimmer-slide": "shimmer-slide 2.5s linear infinite",
        "slide-up": "slide-up 0.4s cubic-bezier(0.16,1,0.3,1) both",
        "pop": "pop 0.4s cubic-bezier(0.16,1,0.3,1) both",
        "marquee": "marquee 20s linear infinite"
      }
    }
  },
  plugins: []
};
