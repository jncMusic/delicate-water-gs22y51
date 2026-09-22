/** 브라우저에서 파일 내려받기를 시작시키는 공통 도우미. */

export function triggerDownload(href, filename) {
  const link = document.createElement("a");
  link.href = href;
  link.download = filename || "download";
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

/**
 * 메모리에 만든 데이터를 파일로 내려받는다.
 * XLSX.writeFile 은 번들 환경에 따라 파일명을 붙이지 못하는 경우가 있어
 * blob 을 직접 만들어 앵커로 내려받는다.
 */
export function downloadBlob(data, filename, type) {
  const url = URL.createObjectURL(new Blob([data], { type }));
  triggerDownload(url, filename);
  // 내려받기가 시작될 시간을 준 뒤 해제한다.
  window.setTimeout(() => URL.revokeObjectURL(url), 10000);
}

/**
 * 인터넷 주소에 있는 파일을 내려받는다.
 *
 * 그냥 <a download> 로 걸면 안 되는 경우가 있다. download 라는 표시는 같은
 * 도메인에 있는 파일에만 듣고, 파이어베이스 저장소처럼 다른 도메인에 있는
 * 주소에는 브라우저가 이를 무시한다. 그러면 저장되지 않고 그림이 화면에
 * 열리기만 한다.
 *
 * 그래서 내용을 먼저 받아 와 우리 쪽 파일로 만들어 내려받는다. 저장소가
 * 바깥 도메인의 요청을 막아 두었으면 받아 올 수 없으므로, 그때는 새 창에
 * 열어 주고 거기서 저장하시게 한다.
 *
 * 돌려주는 값은 파일로 바로 저장됐는지 여부다.
 */
export async function downloadFromUrl(href, filename) {
  try {
    const res = await fetch(href);
    if (!res.ok) throw new Error(`${res.status}`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    triggerDownload(url, filename);
    window.setTimeout(() => URL.revokeObjectURL(url), 10000);
    return true;
  } catch (err) {
    window.open(href, "_blank", "noopener");
    return false;
  }
}
