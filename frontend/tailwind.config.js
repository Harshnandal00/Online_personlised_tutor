/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
  safelist: [
    'bg-sky-50', 'text-sky-600', 'bg-sky-100', 'bg-sky-400',
    'bg-emerald-50', 'text-emerald-600', 'bg-emerald-100', 'bg-emerald-400',
    'bg-amber-50', 'text-amber-600', 'bg-amber-100', 'bg-amber-400',
    'bg-violet-50', 'text-violet-600', 'bg-violet-100', 'bg-violet-400',
    'bg-rose-50', 'text-rose-600', 'bg-rose-100', 'bg-rose-400',
    'bg-teal-50', 'text-teal-600', 'bg-teal-100', 'bg-teal-400',
    'bg-indigo-50', 'text-indigo-600', 'bg-indigo-100', 'bg-indigo-400',
    'bg-orange-50', 'text-orange-600', 'bg-orange-100', 'bg-orange-400',
    'bg-sky-500', 'bg-amber-500', 'bg-red-500', 'bg-violet-500', 'bg-emerald-500',
  ],
};
