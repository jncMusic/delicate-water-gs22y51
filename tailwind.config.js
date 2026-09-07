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
        // 영문 전용 자리에만 쓴다. 한글 글리프가 없으므로 한글에는 쓰지 않는다.
        display: ["Montserrat", '"Pretendard Variable"', "sans-serif"],
      },
      colors: {
        // 차콜 잉크 — 본문 바탕과 어두운 띠에 쓴다.
        brand: {
          50: "#f6f7f8",
          100: "#eceef1",
          200: "#d5dae0",
          300: "#b0b9c4",
          400: "#7f8b9b",
          500: "#5e6a7a",
          600: "#4a5462",
          700: "#3d4552",
          800: "#333944",
          900: "#2b303a",
          950: "#1a1d24",
        },
        // 구릿빛 — 강조와 포인트에만 쓴다.
        accent: {
          300: "#eab98f",
          400: "#dd9a63",
          500: "#c2703d",
          600: "#a3572a",
        },
      },
    },
  },
  plugins: [],
};
