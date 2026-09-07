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
