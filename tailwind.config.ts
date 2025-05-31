import type { Config } from 'tailwindcss'

const config: Config = {
  theme: {
    extend: {
      fontFamily: {
        poetsen: ['Poetsen One', 'sans-serif'], // tu pourras faire `font-inter`
      },
    },
  },
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  plugins: [],
}
export default config
