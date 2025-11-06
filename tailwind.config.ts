import type { Config } from 'tailwindcss'
import daisyui from 'daisyui'

export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  plugins: [daisyui],
  daisyui: {
    themes: ['night'], // Tema dark "Night" come da specs
    darkTheme: 'night',
    base: true,
    styled: true,
    utils: true,
  },
} satisfies Config
