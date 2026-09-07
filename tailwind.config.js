/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}", "./public/index.html"],
  theme: {
    extend: {
      fontFamily: {
        // 본문은 Pretendard, 제목(font-serif)은 나눔명조.
        // 명조가 아직 안 받아졌을 때도 어색하지 않도록 Pretendard 를 다음 순위에 둔다.
        sans: ['"Pretendard Variable"', "Pretendard", "system-ui", "-apple-system", "sans-serif"],
        serif: ['"Nanum Myeongjo"', '"Pretendard Variable"', "Pretendard", "serif"],
      },
      colors: {
        brand: {
          50: "#f3f7fb",
          100: "#e4ecf6",
          200: "#c5d8ec",
          300: "#96b8db",
          400: "#6092c6",
          500: "#3c73ae",
          600: "#2c5b92",
          700: "#254a76",
          800: "#223f62",
          900: "#1e3553",
          950: "#0f2136",
        },
        gold: {
          300: "#e6cf8c",
          400: "#d9b45a",
          500: "#c9a227",
          600: "#a8850f",
        },
      },
    },
  },
  plugins: [],
};
