import {
  File,
  FileArchive,
  FileAudio,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileVideo,
} from "lucide-react";

/**
 * 첨부파일이 어떤 종류인지 목록에서 바로 알아볼 수 있게 한다.
 * 파일명 끝의 확장자만 본다. 브라우저가 알려 주는 type 은 한글파일처럼
 * 비어 있거나 application/octet-stream 으로 오는 경우가 많다.
 */
const KINDS = [
  { label: "PDF", Icon: FileText, ext: ["pdf"] },
  { label: "한글", Icon: FileText, ext: ["hwp", "hwpx"] },
  { label: "문서", Icon: FileText, ext: ["doc", "docx", "rtf", "txt"] },
  { label: "시트", Icon: FileSpreadsheet, ext: ["xls", "xlsx", "csv"] },
  { label: "슬라이드", Icon: FileText, ext: ["ppt", "pptx"] },
  { label: "이미지", Icon: FileImage, ext: ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "heic"] },
  { label: "압축", Icon: FileArchive, ext: ["zip", "7z", "rar", "tar", "gz"] },
  { label: "음원", Icon: FileAudio, ext: ["mp3", "wav", "flac", "m4a", "aac", "ogg"] },
  { label: "영상", Icon: FileVideo, ext: ["mp4", "mov", "avi", "mkv", "wmv"] },
];

export function extensionOf(name) {
  const dot = String(name || "").lastIndexOf(".");
  if (dot < 0) return "";
  return name.slice(dot + 1).toLowerCase();
}

/** 파일명으로 종류를 찾는다. 모르는 확장자는 확장자 자체를 이름표로 쓴다. */
export function fileKind(name) {
  const ext = extensionOf(name);
  const found = KINDS.find((kind) => kind.ext.includes(ext));
  if (found) return { label: found.label, ext, Icon: found.Icon };
  return { label: ext ? ext.toUpperCase() : "파일", ext, Icon: File };
}

/** 목록에서 아이콘 대신 그림을 바로 보여 줘도 되는 파일인지. */
export function isImageFile(name) {
  return ["jpg", "jpeg", "png", "gif", "webp", "bmp"].includes(extensionOf(name));
}

/**
 * 자료 한 건에서 미리보기로 쓸 그림 주소를 찾는다.
 * 협회가 홈페이지에 함께 넣어 둔 자료는 별도 썸네일이 있고,
 * 사무국이 올린 자료는 첨부파일이 그림이면 그 파일을 그대로 쓴다.
 */
export function previewOf(item) {
  if (item?.thumb) return item.thumb;
  const file = item?.file;
  if (file?.url && isImageFile(file.name)) return file.url;
  return null;
}
