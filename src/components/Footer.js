import { Music4 } from "lucide-react";
import { Link } from "../lib/router";
import { menus, org } from "../data/site";

export default function Footer() {
  return (
    <footer className="mt-auto bg-brand-950 text-brand-200">
      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="grid gap-10 md:grid-cols-[1.4fr_2fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-800 text-gold-400">
                <Music4 size={18} />
              </span>
              <span className="font-serif text-lg font-bold text-white">{org.name}</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed">{org.description}</p>
          </div>

          <div className="grid gap-8 sm:grid-cols-[1fr_1fr]">
            <div>
              <h3 className="mb-3 text-sm font-bold text-white">바로가기</h3>
              <ul className="space-y-2 text-sm">
                {menus.map((menu) => (
                  <li key={menu.label}>
                    <Link to={menu.path} className="hover:text-white">
                      {menu.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="mb-3 text-sm font-bold text-white">사무국</h3>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="sr-only">주소</dt>
                  <dd>{org.address}</dd>
                </div>
                <div className="flex gap-4">
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
          </div>
        </div>

        <div className="mt-10 border-t border-brand-800 pt-6 text-xs text-brand-400">
          © {new Date().getFullYear()} {org.name}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
