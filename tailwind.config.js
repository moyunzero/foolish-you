/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        canvas: '#0a0a0a',
        'canvas-card': '#191919',
        'canvas-soft': '#1a1c20',
        hairline: '#212327',
        ink: '#ffffff',
        body: '#dadbdf',
        muted: '#7d8187',
        'accent-sunset': '#ff7a17',
        'sudoku-given': '#b8bcc4',
        'sudoku-error': '#f87171',
        primary: '#ffffff',
        'on-primary': '#0a0a0a',
      },
    },
  },
  plugins: [],
};
