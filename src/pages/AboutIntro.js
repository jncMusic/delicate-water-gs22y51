import { greeting, missions, org } from "../data/site";
import { Card, Container, PageHeader, SectionTitle } from "../components/ui";

export default function AboutIntro() {
  return (
    <>
      <PageHeader
        title="인사말"
        subtitle={org.slogan}
        breadcrumb={["협회소개", "인사말"]}
      />
      <Container>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.6fr]">
          <div>
            <div className="rounded-xl bg-gradient-to-br from-brand-800 to-brand-600 p-8 text-white">
              <p className="font-serif text-2xl font-bold leading-snug">{org.slogan}</p>
              <dl className="mt-8 space-y-3 border-t border-white/20 pt-6 text-sm">
                <div className="flex gap-3">
                  <dt className="w-16 shrink-0 text-brand-200">설립</dt>
                  <dd>{org.founded}</dd>
                </div>
                <div className="flex gap-3">
                  <dt className="w-16 shrink-0 text-brand-200">영문명</dt>
                  <dd>{org.nameEn}</dd>
                </div>
                <div className="flex gap-3">
                  <dt className="w-16 shrink-0 text-brand-200">사무국</dt>
                  <dd>{org.phone}</dd>
                </div>
              </dl>
            </div>
          </div>

          <div>
            <SectionTitle>{greeting.title}</SectionTitle>
            <div className="space-y-5 text-[15px] leading-8 text-slate-700">
              {greeting.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 20)}>{paragraph}</p>
              ))}
            </div>
            <p className="mt-10 font-serif text-lg font-bold text-brand-900">
              {greeting.signature}
            </p>
          </div>
        </div>

        <div className="mt-16">
          <SectionTitle description="협회가 수행하는 주요 역할입니다.">주요 역할</SectionTitle>
          <div className="grid gap-5 sm:grid-cols-2">
            {missions.map((mission) => (
              <Card key={mission.title}>
                <h3 className="font-bold text-brand-900">{mission.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{mission.body}</p>
              </Card>
            ))}
          </div>
        </div>
      </Container>
    </>
  );
}
