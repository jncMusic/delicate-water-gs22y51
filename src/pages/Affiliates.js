import { affiliates } from "../data/site";
import { Container, PageHeader } from "../components/ui";

export default function Affiliates() {
  return (
    <>
      <PageHeader subtitle="협회와 함께 활동하는 산하단체입니다." />
      <Container className="pt-10">
        <div className="space-y-4">
          {affiliates.map((group, index) => (
            <article
              key={group.name}
              className="grid gap-5 rounded-xl border border-slate-200 bg-white p-7 sm:grid-cols-[200px_1fr] sm:items-center"
            >
              <div>
                <span className="font-serif text-2xl font-bold text-brand-100">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-1 font-serif text-lg font-bold text-brand-900">{group.name}</h3>
                <p className="mt-1 text-xs text-gold-600">{group.since}</p>
              </div>
              <p className="text-[15px] leading-7 text-slate-700">{group.summary}</p>
            </article>
          ))}
        </div>
      </Container>
    </>
  );
}
