import { programs } from "../data/site";
import { Container, PageHeader } from "../components/ui";

export default function Programs() {
  return (
    <>
      <PageHeader subtitle="협회가 연중 운영하는 사업을 안내합니다." />
      <Container>
        <div className="space-y-6">
          {programs.map((program, index) => (
            <article
              key={program.name}
              className="grid gap-6 rounded-xl border border-slate-200 bg-white p-7 sm:grid-cols-[1fr_1.6fr]"
            >
              <div>
                <span className="font-serif text-3xl font-bold text-brand-100">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h2 className="mt-1 font-serif text-xl font-bold text-brand-900">{program.name}</h2>
                {program.period && (
                  <p className="mt-2 inline-block rounded-full bg-accent-500/15 px-3 py-1 text-xs font-medium text-accent-600">
                    {program.period}
                  </p>
                )}
              </div>
              <div>
                <p className="text-[15px] leading-7 text-slate-700">{program.summary}</p>
                {program.details.length > 0 && (
                <ul className="mt-4 space-y-1.5 border-t border-slate-100 pt-4">
                  {program.details.map((detail) => (
                    <li key={detail} className="flex gap-2 text-sm text-slate-600">
                      <span
                        aria-hidden="true"
                        className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent-500"
                      />
                      {detail}
                    </li>
                  ))}
                </ul>
                )}
              </div>
            </article>
          ))}
        </div>
      </Container>
    </>
  );
}
