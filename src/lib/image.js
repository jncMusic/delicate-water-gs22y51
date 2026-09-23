/**
 * 그림을 작게 줄여 data 주소로 돌려준다.
 *
 * 직인을 담는 데 쓴다. 담는 곳이 문서 한 칸이라 1MB 를 넘길 수 없는데,
 * 스캔한 직인은 그보다 큰 경우가 많다. 미리 줄여 두면 사무국이 파일 크기를
 * 신경 쓰지 않아도 된다.
 *
 * PNG 로 내보내므로 배경이 비치는 그림은 비치는 채로 남는다. 증명서에
 * 겹쳐 찍을 때 이것이 중요하다.
 */
export function shrinkImage(file, max = 600) {
  return new Promise((done, fail) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);
      try {
        // 이미 작으면 그대로 둔다. 늘리면 흐려지기만 한다.
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        done(canvas.toDataURL("image/png"));
      } catch (err) {
        fail(err);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      fail(new Error("그림을 읽지 못했습니다"));
    };

    img.src = url;
  });
}
