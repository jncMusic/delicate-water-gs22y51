import { useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Inbox, Loader2 } from "lucide-react";
import { Link } from "../lib/router";

/* ---------- 표시 형식 도우미 ---------- */

export function formatDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return "-";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value < 10 && unit > 0 ? value.toFixed(1) : Math.round(value)}${units[unit]}`;
}

/* ---------- 레이아웃 ---------- */

/** 서브페이지 상단의 제목 띠. */
export function PageHeader({ title, subtitle, breadcrumb = [] }) {
  return (
    <div className="border-b border-brand-100 bg-gradient-to-br from-brand-900 to-brand-700 text-white">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:py-16">
        {breadcrumb.length > 0 && (
          <nav className="mb-3 flex flex-wrap items-center gap-1.5 text-xs text-brand-200">
            <Link to="/" className="hover:text-white">
              홈
            </Link>
            {breadcrumb.map((crumb) => (
              <span key={crumb} className="flex items-center gap-1.5">
                <span aria-hidden="true">›</span>
                <span className="text-white">{crumb}</span>
              </span>
            ))}
          </nav>
        )}
        <h1 className="font-serif text-3xl font-bold sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-3 max-w-2xl text-sm text-brand-100 sm:text-base">{subtitle}</p>}
      </div>
    </div>
  );
}

export function Container({ children, className = "" }) {
  return <div className={`mx-auto max-w-6xl px-5 py-12 sm:py-16 ${className}`}>{children}</div>;
}

export function SectionTitle({ children, description }) {
  return (
    <div className="mb-6">
      <h2 className="font-serif text-xl font-bold text-brand-900 sm:text-2xl">{children}</h2>
      {description && <p className="mt-2 text-sm text-slate-600">{description}</p>}
      <div className="mt-3 h-0.5 w-10 bg-gold-500" />
    </div>
  );
}

export function Card({ children, className = "" }) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

/* ---------- 폼 요소 ---------- */

const controlClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-brand-950 " +
  "placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 " +
  "disabled:bg-slate-50 disabled:text-slate-500";

export function Field({ label, required, hint, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-brand-900">
        {label}
        {required && <span className="ml-1 text-rose-600">*</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}

export function Input(props) {
  return <input {...props} className={`${controlClass} ${props.className || ""}`} />;
}

export function Textarea(props) {
  return <textarea {...props} className={`${controlClass} ${props.className || ""}`} />;
}

export function Select({ children, ...props }) {
  return (
    <select {...props} className={`${controlClass} bg-white ${props.className || ""}`}>
      {children}
    </select>
  );
}

const buttonVariants = {
  primary: "bg-brand-700 text-white hover:bg-brand-800 disabled:bg-brand-300",
  secondary: "border border-slate-300 bg-white text-brand-800 hover:bg-slate-50 disabled:text-slate-400",
  gold: "bg-gold-500 text-brand-950 hover:bg-gold-400 disabled:bg-gold-300",
  danger: "border border-rose-200 bg-white text-rose-700 hover:bg-rose-50",
  ghost: "text-brand-700 hover:bg-brand-50",
};

export function Button({ variant = "primary", className = "", children, ...props }) {
  return (
    <button
      type="button"
      {...props}
      className={
        "inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium " +
        "transition-colors disabled:cursor-not-allowed " +
        `${buttonVariants[variant]} ${className}`
      }
    >
      {children}
    </button>
  );
}

/* ---------- 상태 표시 ---------- */

const badgeTones = {
  승인: "bg-emerald-50 text-emerald-700 border-emerald-200",
  대기: "bg-amber-50 text-amber-700 border-amber-200",
  보류: "bg-slate-100 text-slate-600 border-slate-200",
  탈퇴: "bg-rose-50 text-rose-700 border-rose-200",
  default: "bg-brand-50 text-brand-700 border-brand-200",
};

export function Badge({ children, tone }) {
  return (
    <span
      className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${
        badgeTones[tone || children] || badgeTones.default
      }`}
    >
      {children}
    </span>
  );
}

export function EmptyState({ message = "등록된 내용이 없습니다." }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-300 py-16 text-slate-400">
      <Inbox size={28} />
      <p className="text-sm">{message}</p>
    </div>
  );
}

export function Loading({ label = "불러오는 중입니다..." }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
      <Loader2 size={18} className="animate-spin" />
      {label}
    </div>
  );
}

/* ---------- 모달 ---------- */

export function Modal({ open, title, onClose, children, footer, wide = false }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-brand-950/50 p-4 sm:p-8">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`w-full rounded-xl bg-white shadow-xl ${wide ? "max-w-3xl" : "max-w-lg"}`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-4">
          <h3 className="font-serif text-lg font-bold text-brand-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer && (
          <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- 페이지네이션 ---------- */

export function Pagination({ page, pageCount, onChange }) {
  if (pageCount <= 1) return null;

  const pages = [];
  const start = Math.max(1, Math.min(page - 2, pageCount - 4));
  for (let i = start; i < start + 5 && i <= pageCount; i += 1) pages.push(i);

  const arrow = "rounded-lg border border-slate-300 p-2 text-slate-600 disabled:opacity-40 hover:bg-slate-50";

  return (
    <nav className="mt-8 flex items-center justify-center gap-1.5" aria-label="페이지 이동">
      <button type="button" className={arrow} onClick={() => onChange(page - 1)} disabled={page <= 1} aria-label="이전 페이지">
        <ChevronLeft size={16} />
      </button>
      {pages.map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          aria-current={n === page ? "page" : undefined}
          className={`min-w-9 rounded-lg border px-3 py-2 text-sm ${
            n === page
              ? "border-brand-700 bg-brand-700 font-medium text-white"
              : "border-slate-300 text-slate-600 hover:bg-slate-50"
          }`}
        >
          {n}
        </button>
      ))}
      <button type="button" className={arrow} onClick={() => onChange(page + 1)} disabled={page >= pageCount} aria-label="다음 페이지">
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}
