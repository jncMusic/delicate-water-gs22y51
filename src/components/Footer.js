import { Music4 } from "lucide-react";
import { Link } from "../lib/router";
import { memberSideMenu, menus, org } from "../data/site";

export default function Footer() {
  return (
    <footer className="mt-auto bg-brand-950 text-brand-200">
      {/* 약관 등 정책 문서 줄 */}
      <div className="border-b border-brand-800">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-5 py-4 text-xs">
          {memberSideMenu.children.slice(1).map((item) => (
            <Link key={item.path} to={item.path} className="hover:text-white">
              {item.label}
            </Link>
          ))}
          <Link to="/admin" className="ml-auto text-brand-400 hover:text-white">
            관리자
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_2fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-800 text-gold-400">
                <Music4 size={17} />
              </span>
              <span className="font-serif text-base font-bold text-white">{org.fullName}</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed">{org.description}</p>
            <p className="mt-4 text-xs text-brand-400">{org.registration}</p>
          </div>

          <div className="grid gap-8 sm:grid-cols-[1.2fr_1fr]">
            <div>
              <h3 className="mb-3 text-sm font-bold text-white">사무국</h3>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="sr-only">주소</dt>
                  <dd>{org.address}</dd>
                </div>
                <div className="flex flex-wrap gap-x-4">
                  <div>
                    <dt className="sr-only">전화</dt>
                    <dd>T. {org.phone}</dd>
                  </div>
                  <div>
                    <dt className="sr-only">팩스</dt>
                    <dd>F. {org.fax}</dd>
                  </div>
                </div>
                <div>
                  <dt className="sr-only">이메일</dt>
                  <dd>
                    <a href={`mailto:${org.email}`} className="hover:text-white">
                      {org.email}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="sr-only">업무시간</dt>
                  <dd className="text-brand-300">{org.hours}</dd>
                </div>
              </dl>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-bold text-white">바로가기</h3>
              <ul className="space-y-2 text-sm">
                {menus.map((menu) => (
                  <li key={menu.label}>
                    <Link to={menu.children[0].path} className="hover:text-white">
                      {menu.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <p className="mt-10 border-t border-brand-800 pt-6 text-xs text-brand-400">
          © {new Date().getFullYear()} {org.fullName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
