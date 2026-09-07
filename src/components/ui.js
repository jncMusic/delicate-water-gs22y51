import { useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Home, Inbox, Loader2 } from "lucide-react";
import { Link, useRoute } from "../lib/router";
import { findMenu } from "../data/site";

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

/** 서브페이지 상단 띠의 배경 악보 무늬. */
function StaffPattern() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 220 120"
      className="pointer-events-none absolute inset-x-0 bottom-0 h-20 w-full text-white/10"
      preserveAspectRatio="none"
    >
      {[0, 1, 2, 3, 4].map((line) => (
        <line
          key={line}
          x1="0"
          x2="220"
          y1={40 + line * 12}
          y2={30 + line * 12}
          stroke="currentColor"
          strokeWidth="1.5"
        />
      ))}
      <circle cx="52" cy="74" r="7" fill="currentColor" />
      <circle cx="104" cy="62" r="7" fill="currentColor" />
      <circle cx="156" cy="52" r="7" fill="currentColor" />
    </svg>
  );
}

/** 홈 > 대메뉴 > 소메뉴 형태의 경로 표시. */
function Breadcrumb({ group, child }) {
  return (
    <nav aria-label="현재 위치" className="flex items-center gap-2 text-xs text-slate-500">
      <Link to="/" aria-label="홈" className="text-slate-400 hover:text-brand-700">
        <Home size={14} />
      </Link>
      {group && (
        <>
          <span aria-hidden="true" className="text-slate-300">›</span>
          <span>{group.label}</span>
        </>
      )}
      {child && (
        <>
          <span aria-hidden="true" className="text-slate-300">›</span>
          <span className="font-medium text-brand-800">{child.label}</span>
        </>
      )}
    </nav>
  );
}

/**
 * 서브페이지 상단.
 * 왼쪽 네이비 띠에 대메뉴 이름, 오른쪽에 소메뉴 타일을 늘어놓고
 * 그 아래에 경로 표시와 가운데 정렬한 페이지 제목을 둔다.
 */
export function PageHeader({ title, subtitle }) {
  const path = useRoute();
  const found = findMenu(path);
  const group = found?.group;
  const child = found?.child;
  const heading = title || child?.label || "";

  return (
    <>
      <div className="border-b border-slate-200">
        <div className="mx-auto flex max-w-6xl flex-col sm:flex-row">
          {/* before 로 화면 왼쪽 끝까지 네이비 배경을 이어 붙인다. */}
          <div className="relative flex shrink-0 items-center justify-center bg-brand-900 px-6 py-7 sm:w-56 sm:justify-end sm:py-10 sm:before:absolute sm:before:right-full sm:before:top-0 sm:before:h-full sm:before:w-screen sm:before:bg-brand-900 sm:before:content-['']">
            <span className="absolute inset-0 overflow-hidden">
              <StaffPattern />
            </span>
            <h2 className="relative font-serif text-xl font-bold text-white sm:text-2xl">
              {group ? group.label : "안내"}
            </h2>
          </div>

          {group && group.children.length > 1 && (
            <nav
              aria-label={`${group.label} 하위 메뉴`}
              className="grid flex-1 grid-cols-2 border-slate-200 sm:m-6 sm:grid-cols-3 sm:border lg:grid-cols-5"
            >
              {group.children.map((item) => {
                const active = item.path === child?.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    aria-current={active ? "page" : undefined}
                    className={`border-b border-r border-slate-200 px-3 py-3 text-center text-xs transition-colors sm:border-0 sm:border-b sm:border-r ${
                      active
                        ? "bg-brand-50 font-bold text-brand-800"
                        : "text-slate-600 hover:bg-slate-50 hover:text-brand-700"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-5 pt-8">
        <Breadcrumb group={group} child={child} />
        <div className="mt-6 text-center">
          <h1 className="font-serif text-2xl font-bold text-brand-900 sm:text-3xl">{heading}</h1>
          {subtitle && <p className="mt-3 text-sm text-slate-600">{subtitle}</p>}
          <span aria-hidden="true" className="mx-auto mt-5 block h-0.5 w-16 bg-brand-700" />
        </div>
      </div>
    </>
  );
}

/**
 * 좌측 세로 메뉴를 쓰는 레이아웃. 가입 신청과 약관 페이지처럼
 * 단계가 있거나 문서 성격인 화면에 쓴다.
 */
export function SidebarPage({ menu, title, subtitle, children }) {
  const path = useRoute();
  const child = menu.children.find((item) => path === item.path);

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <div className="mb-6 flex justify-end">
        <Breadcrumb group={menu} child={child} />
      </div>

      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="relative overflow-hidden rounded-2xl bg-brand-900 px-5 py-8 text-white">
          <StaffPattern />
          <h2 className="relative font-serif text-xl font-bold">{menu.label}</h2>
          <nav aria-label={`${menu.label} 메뉴`} className="relative mt-8 space-y-1">
            {menu.children.map((item) => {
              const active = item.path === path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  aria-current={active ? "page" : undefined}
                  className={`block rounded-lg px-4 py-2.5 text-sm transition-colors ${
                    active
                      ? "bg-brand-600 font-bold text-white"
                      : "text-brand-200 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <div>
          <div className="text-center">
            <h1 className="font-serif text-2xl font-bold text-brand-900 sm:text-3xl">
              {title || child?.label}
            </h1>
            {subtitle && <p className="mt-3 text-sm text-slate-600">{subtitle}</p>}
            <span aria-hidden="true" className="mx-auto mt-5 block h-0.5 w-16 bg-brand-700" />
          </div>
          <div className="mt-10">{children}</div>
        </div>
      </div>
    </div>
  );
}

/** 가입 신청처럼 여러 단계로 나뉜 화면의 진행 표시. */
export function StepIndicator({ steps, current }) {
  return (
    <ol className="flex flex-wrap items-center justify-center gap-2">
      {steps.map((label, index) => {
        const no = index + 1;
        const active = no === current;
        const done = no < current;
        return (
          <li key={label} className="flex items-center gap-2">
            <span
              aria-current={active ? "step" : undefined}
              className={`flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-1.5 text-xs transition-colors ${
                active ? "bg-brand-50 pr-4 text-brand-800" : ""
              }`}
            >
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                  active
                    ? "bg-brand-700 text-white"
                    : done
                    ? "bg-brand-200 text-brand-800"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {String(no).padStart(2, "0")}
              </span>
              {active && <span className="font-bold">{label}</span>}
            </span>
          </li>
        );
      })}
    </ol>
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
      <div className="mt-3 h-0.5 w-10 bg-accent-500" />
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
  gold: "bg-accent-500 text-brand-950 hover:bg-accent-400 disabled:bg-accent-300",
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
