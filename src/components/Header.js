import { useState } from "react";
import { Menu, X, Music4, Lock, ChevronDown } from "lucide-react";
import { Link } from "../lib/router";
import { menus, org } from "../data/site";

export default function Header({ path }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);

  const isActive = (menu) =>
    path === menu.path || menu.children.some((child) => path.startsWith(child.path));

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-800 text-gold-400">
            <Music4 size={20} />
          </span>
          <span className="leading-tight">
            <span className="block font-serif text-lg font-bold text-brand-900">{org.name}</span>
            <span className="block text-[10px] uppercase tracking-widest text-slate-400">
              {org.nameEn}
            </span>
          </span>
        </Link>

        {/* 데스크톱 내비게이션 */}
        <nav className="hidden items-center lg:flex" onMouseLeave={() => setOpenMenu(null)}>
          {menus.map((menu) => (
            <div key={menu.label} className="relative" onMouseEnter={() => setOpenMenu(menu.label)}>
              <Link
                to={menu.path}
                className={`flex items-center gap-1 px-4 py-3 text-sm font-medium transition-colors ${
                  isActive(menu) ? "text-brand-700" : "text-slate-700 hover:text-brand-700"
                }`}
              >
                {menu.label}
                {menu.children.length > 1 && <ChevronDown size={14} className="text-slate-400" />}
              </Link>
              {openMenu === menu.label && menu.children.length > 1 && (
                <div className="absolute left-0 top-full w-44 rounded-lg border border-slate-200 bg-white py-1.5 shadow-lg">
                  {menu.children.map((child) => (
                    <Link
                      key={child.path}
                      to={child.path}
                      onClick={() => setOpenMenu(null)}
                      className={`block px-4 py-2 text-sm ${
                        path === child.path
                          ? "font-medium text-brand-700"
                          : "text-slate-600 hover:bg-brand-50 hover:text-brand-700"
                      }`}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/admin"
            className="hidden items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 sm:flex"
          >
            <Lock size={14} />
            관리자
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "메뉴 닫기" : "메뉴 열기"}
            aria-expanded={mobileOpen}
            className="rounded-lg p-2 text-brand-800 hover:bg-slate-100 lg:hidden"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* 모바일 메뉴 */}
      {mobileOpen && (
        <nav className="border-t border-slate-200 bg-white lg:hidden">
          <div className="mx-auto max-w-6xl px-5 py-3">
            {menus.map((menu) => (
              <div key={menu.label} className="border-b border-slate-100 py-3 last:border-0">
                <p className="mb-2 text-sm font-bold text-brand-900">{menu.label}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  {menu.children.map((child) => (
                    <Link
                      key={child.path}
                      to={child.path}
                      onClick={() => setMobileOpen(false)}
                      className={`text-sm ${
                        path === child.path ? "font-medium text-brand-700" : "text-slate-600"
                      }`}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
            <Link
              to="/admin"
              onClick={() => setMobileOpen(false)}
              className="mt-3 flex items-center gap-1.5 text-sm font-medium text-brand-700"
            >
              <Lock size={14} />
              관리자 페이지
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
