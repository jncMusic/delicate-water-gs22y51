import { useEffect, useState } from "react";
import { Menu, X, Music4, Lock } from "lucide-react";
import { Link } from "../lib/router";
import { menus, menuHome, org } from "../data/site";

/** 대메뉴에 걸린 소메뉴를 박스 타일로 펼쳐 보여주는 데스크톱 드롭다운. */
function TileDropdown({ menu, activePath, onSelect }) {
  return (
    <div className="absolute left-1/2 top-full z-30 -translate-x-1/2 pt-1">
      <div className="grid grid-cols-3 border border-slate-200 bg-white shadow-lg lg:grid-cols-5">
        {menu.children.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={onSelect}
            className={`whitespace-nowrap border-b border-r border-slate-100 px-5 py-3.5 text-center text-xs transition-colors ${
              item.path === activePath
                ? "bg-brand-50 font-bold text-brand-800"
                : "text-slate-600 hover:bg-brand-50 hover:text-brand-700"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

/** 전체메뉴: 모든 대메뉴와 소메뉴를 한 화면에 펼친다. */
function FullMenu({ onClose, activePath }) {
  return (
    <div className="border-t border-slate-200 bg-white shadow-inner">
      <div className="mx-auto grid max-w-6xl gap-x-6 gap-y-8 px-5 py-10 sm:grid-cols-3 lg:grid-cols-5">
        {menus.map((menu) => (
          <div key={menu.label}>
            <h3 className="border-b-2 border-brand-800 pb-2 font-serif text-base font-bold text-brand-900">
              {menu.label}
            </h3>
            <ul className="mt-3 space-y-1.5">
              {menu.children.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={onClose}
                    className={`block py-0.5 text-sm ${
                      item.path === activePath
                        ? "font-bold text-brand-700"
                        : "text-slate-600 hover:text-brand-700"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

/** 모바일 전용 서랍 메뉴. 참고 사이트처럼 어두운 배경에 목록으로 펼친다. */
function MobileDrawer({ onClose, activePath }) {
  const items = menus.flatMap((menu) => menu.children);

  return (
    <div className="fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto bg-brand-900 lg:hidden">
      <ul className="px-5 py-2">
        {items.map((item) => (
          <li key={item.path} className="border-b border-white/10 last:border-0">
            <Link
              to={item.path}
              onClick={onClose}
              className={`flex items-center justify-between py-4 text-sm ${
                item.path === activePath ? "font-bold text-gold-400" : "font-medium text-white"
              }`}
            >
              {item.label}
              <span aria-hidden="true" className="text-white/40">›</span>
            </Link>
          </li>
        ))}
        <li className="border-t border-white/20">
          <Link
            to="/admin"
            onClick={onClose}
            className="flex items-center gap-2 py-4 text-sm font-medium text-brand-200"
          >
            <Lock size={14} />
            관리자 페이지
          </Link>
        </li>
      </ul>
    </div>
  );
}

export default function Header({ path }) {
  const [hovered, setHovered] = useState(null);
  const [fullMenu, setFullMenu] = useState(false);
  const [drawer, setDrawer] = useState(false);

  // 경로가 바뀌면 열려 있던 메뉴를 닫는다.
  useEffect(() => {
    setFullMenu(false);
    setDrawer(false);
    setHovered(null);
  }, [path]);

  useEffect(() => {
    document.body.style.overflow = drawer ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawer]);

  const isActive = (menu) => menu.children.some((child) => path.startsWith(child.path));

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm">
      <div className="border-b border-slate-200">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
          <Link to="/" className="flex shrink-0 items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-900 text-gold-400">
              <Music4 size={19} />
            </span>
            <span className="leading-tight">
              <span className="block font-serif text-base font-bold text-brand-900">
                {org.fullName}
              </span>
              <span className="block text-[9px] uppercase tracking-[0.15em] text-slate-400">
                {org.nameEn}
              </span>
            </span>
          </Link>

          <nav
            aria-label="주 메뉴"
            className="hidden h-full items-stretch lg:flex"
            onMouseLeave={() => setHovered(null)}
          >
            {menus.map((menu) => (
              <div
                key={menu.label}
                className="relative flex items-stretch"
                onMouseEnter={() => setHovered(menu.label)}
              >
                <Link
                  to={menuHome(menu)}
                  className={`flex items-center border-b-2 px-6 text-[15px] font-medium transition-colors ${
                    isActive(menu)
                      ? "border-brand-700 text-brand-800"
                      : "border-transparent text-slate-700 hover:text-brand-700"
                  }`}
                >
                  {menu.label}
                </Link>
                {hovered === menu.label && (
                  <TileDropdown
                    menu={menu}
                    activePath={path}
                    onSelect={() => setHovered(null)}
                  />
                )}
              </div>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => setFullMenu((v) => !v)}
              aria-expanded={fullMenu}
              className="hidden items-center gap-1.5 rounded px-3 py-2 text-xs text-brand-800 hover:bg-slate-50 lg:flex"
            >
              {fullMenu ? <X size={16} /> : <Menu size={16} />}
              전체메뉴
            </button>
            <Link
              to="/admin"
              className="hidden items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 lg:flex"
            >
              <Lock size={13} />
              관리자
            </Link>
            <button
              type="button"
              onClick={() => setDrawer((v) => !v)}
              aria-label={drawer ? "메뉴 닫기" : "메뉴 열기"}
              aria-expanded={drawer}
              className="rounded-lg p-2 text-brand-800 hover:bg-slate-100 lg:hidden"
            >
              {drawer ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {fullMenu && <FullMenu onClose={() => setFullMenu(false)} activePath={path} />}
      {drawer && <MobileDrawer onClose={() => setDrawer(false)} activePath={path} />}
    </header>
  );
}
