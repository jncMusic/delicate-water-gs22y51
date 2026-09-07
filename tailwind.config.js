/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}", "./public/index.html"],
  theme: {
    extend: {
      fontFamily: {
        // 본문과 제목 모두 Pretendard 를 쓴다(참고 사이트도 제목이 고딕 계열).
        // font-serif 는 기존 코드가 제목에 쓰던 이름이라 그대로 두고 같은 글꼴을 가리킨다.
        sans: ['"Pretendard Variable"', "Pretendard", "system-ui", "-apple-system", "sans-serif"],
        serif: ['"Pretendard Variable"', "Pretendard", "system-ui", "-apple-system", "sans-serif"],
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
