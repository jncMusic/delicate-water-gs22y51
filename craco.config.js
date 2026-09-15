// create-react-app 은 프로젝트의 postcss.config.js 를 읽지 않으므로
// CRACO 로 Tailwind 를 빌드 파이프라인에 끼워 넣는다.
//
// craco 의 style.postcss.plugins 옵션은 플러그인 목록을 "함수"로 넘기는데,
// CRA 5 가 쓰는 postcss-loader 6 은 배열 또는 객체만 인식하고 함수는 조용히 무시한다.
// 그래서 loaderOptions 로 직접 배열을 넣어 준다.
module.exports = {
  style: {
    postcss: {
      loaderOptions: (loaderOptions) => {
        const postcssOptions = loaderOptions.postcssOptions || {};
        const existing = Array.isArray(postcssOptions.plugins) ? postcssOptions.plugins : [];

        return {
          ...loaderOptions,
          postcssOptions: {
            ...postcssOptions,
            // Tailwind 가 @tailwind/@apply 를 먼저 펼친 뒤 CRA 기본 플러그인이 처리한다.
            plugins: [require("tailwindcss"), ...existing],
          },
        };
      },
    },
  },
};
