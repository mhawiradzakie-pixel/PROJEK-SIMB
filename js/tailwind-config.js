// Konfigurasi Tailwind CDN (harus dimuat setelah cdn.tailwindcss.com)
tailwind.config = {
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        abyss: {
          950: '#050a12',
          900: '#0b1322',
          800: '#111d33',
          700: '#192947',
        },
        storm: {
          cyan: '#38bdf8',
          teal: '#06b6d4',
          amber: '#f59e0b',
          orange: '#fb923c',
          crimson: '#ef4444',
        }
      }
    }
  }
};
