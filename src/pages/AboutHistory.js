import { history } from "../data/site";
import { Container, PageHeader } from "../components/ui";

export default function AboutHistory() {
  return (
    <>
      <PageHeader subtitle="창립 이후 협회가 걸어온 길입니다." />
      <Container>
        <div className="space-y-14">
          {history.map((block) => (
            <section key={block.period} className="grid gap-6 sm:grid-cols-[160px_1fr]">
              <h2 className="font-serif text-2xl font-bold text-gold-600">{block.period}</h2>
              <ol className="relative border-l-2 border-brand-100 pl-6">
                {block.items.map((item) => (
                  <li key={`${item.year}-${item.text}`} className="relative pb-7 last:pb-0">
                    <span
                      aria-hidden="true"
                      className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full border-2 border-white bg-brand-600"
                    />
                    <p className="text-sm font-bold text-brand-800">{item.year}</p>
                    <p className="mt-1 text-[15px] text-slate-700">{item.text}</p>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      </Container>
    </>
  );
}
