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
            {/* CI 는 감청색 단색이라 어두운 배경에서는 흰 판 위에 얹는다. */}
            <span className="inline-block rounded-lg bg-white px-3 py-2">
              <img
                src={`${process.env.PUBLIC_URL || ""}/logo-kba-wide.svg`}
                alt={org.name}
                className="h-8 w-auto"
              />
            </span>
            <p className="mt-4 text-sm leading-relaxed">{org.description}</p>
            {org.registration && (
              <p className="mt-4 text-xs text-brand-400">{org.registration}</p>
            )}
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
                  {org.fax && (
                    <div>
                      <dt className="sr-only">팩스</dt>
                      <dd>F. {org.fax}</dd>
                    </div>
                  )}
                </div>
                {org.email && (
                  <div>
                    <dt className="sr-only">이메일</dt>
                    <dd>
                      <a href={`mailto:${org.email}`} className="hover:text-white">
                        {org.email}
                      </a>
                    </dd>
                  </div>
                )}
                {org.hours && (
                  <div>
                    <dt className="sr-only">업무시간</dt>
                    <dd className="text-brand-300">{org.hours}</dd>
                  </div>
                )}
                {/*
                  협회 블로그. 그동안 index.html 의 JSON-LD 안에만 적혀 있었는데,
                  그건 기계만 읽는 자리라 사람에게는 보이지 않았다. 네이버는 제
                  블로그에서 바깥으로 나가는 링크를 잘 따라가므로, 양쪽을 서로
                  이어 두는 편이 낫다.
                */}
                {org.blog && (
                  <div>
                    <dt className="sr-only">협회 블로그</dt>
                    <dd>
                      <a
                        href={org.blog}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-white"
                      >
                        협회 블로그
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-bold text-white">바로가기</h3>
              <ul className="space-y-2 text-sm">
                {/*
                  가입 신청은 머리띠에도 없고 여기에도 없었다. 공지를 읽다가
                  가입할 마음이 든 사람이 갈 데가 홈 화면 가운데 띠 하나뿐이라,
                  모든 쪽 발치에 문을 하나 둔다. 맨 위에 두고 글자를 밝게 한다.
                */}
                <li>
                  <Link to="/members/apply" className="font-bold text-white hover:text-accent-300">
                    회원 가입 신청
                  </Link>
                </li>
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
