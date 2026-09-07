import { affiliateTypes } from "../data/site";
import { Container, PageHeader } from "../components/ui";

export default function Affiliates() {
  return (
    <>
      <PageHeader subtitle="학교단체, 군악단체, 일반단체가 회원단체로 참여하고 있습니다." />
      <Container className="pt-10">
        <div className="space-y-4">
          {affiliateTypes.map((type, index) => (
            <article
              key={type.name}
              className="grid gap-5 rounded-xl border border-slate-200 bg-white p-7 sm:grid-cols-[200px_1fr]"
            >
              <div>
                <span className="font-serif text-2xl font-bold text-brand-100">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-1 font-serif text-lg font-bold text-brand-900">{type.name}</h3>
              </div>
              <div>
                <p className="text-[15px] leading-7 text-slate-700">{type.summary}</p>
                {type.groups.length > 0 && (
                  <ul className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                    {type.groups.map((name) => (
                      <li
                        key={name}
                        className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700"
                      >
                        {name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </article>
          ))}
        </div>

        <p className="mt-8 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center text-sm leading-relaxed text-slate-500">
          단체별 명단은 준비 중입니다. 회원단체 가입 문의는 협회 사무국으로 연락해 주시기 바랍니다.
        </p>
      </Container>
    </>
  );
}
