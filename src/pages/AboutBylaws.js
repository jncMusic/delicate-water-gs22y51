import { Info } from "lucide-react";
import { bylaws, bylawsNote } from "../data/site";
import { Container, PageHeader } from "../components/ui";

export default function AboutBylaws() {
  return (
    <>
      <PageHeader subtitle="협회의 운영 기준이 되는 정관입니다." />
      <Container>
        <p className="mb-8 flex items-start gap-2.5 rounded-lg border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800">
          <Info size={16} className="mt-0.5 shrink-0" />
          {bylawsNote}
        </p>

        <div className="space-y-10">
          {bylaws.map((chapter) => (
            <section key={chapter.chapter}>
              <h2 className="border-b-2 border-brand-800 pb-2 font-serif text-lg font-bold text-brand-900">
                {chapter.chapter}
              </h2>
              <dl className="mt-5 space-y-5">
                {chapter.articles.map((article) => (
                  <div key={article.no}>
                    <dt className="text-sm font-bold text-brand-800">{article.no}</dt>
                    <dd className="mt-1.5 text-[15px] leading-7 text-slate-700">{article.text}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>
      </Container>
    </>
  );
}
