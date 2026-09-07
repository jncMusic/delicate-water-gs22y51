import { MapPin, Phone } from "lucide-react";
import { branchList, branchSummary, branchTotals } from "../data/site";
import { Card, Container, PageHeader, SectionTitle } from "../components/ui";

export default function Branches() {
  return (
    <>
      <PageHeader subtitle="협회는 국내외에 지회와 지부를 두고 있습니다." />
      <Container className="pt-10">
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="bg-brand-900 text-white">
            <p className="text-sm text-brand-200">지회</p>
            <p className="mt-1 font-serif text-4xl font-bold">{branchTotals.branches}<span className="ml-1 text-lg">개</span></p>
            <ul className="mt-5 space-y-2 border-t border-white/15 pt-4 text-sm">
              {branchSummary.map((row) => (
                <li key={row.area} className="flex justify-between">
                  <span className="text-brand-200">{row.area}</span>
                  <span className="font-medium">{row.count}개</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <p className="text-sm text-slate-500">지부</p>
            <p className="mt-1 font-serif text-4xl font-bold text-brand-900">
              {branchTotals.chapters}<span className="ml-1 text-lg">개</span>
            </p>
            <p className="mt-5 border-t border-slate-100 pt-4 text-sm leading-relaxed text-slate-600">
              시 단위로 지부를 두고 있습니다. 지회·지부는 국내사업본부와 국제사업본부 아래에서
              지역별 사업을 맡습니다.
            </p>
          </Card>
        </div>

        <div className="mt-16">
          <SectionTitle>지회 목록</SectionTitle>
          {branchList.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center text-sm leading-relaxed text-slate-500">
              지회별 이름과 연락처는 준비 중입니다.
              <br />
              문의는 협회 사무국으로 연락해 주시기 바랍니다.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {branchList.map((branch) => (
                <div key={branch.name} className="rounded-xl border border-slate-200 bg-white p-5">
                  <span className="inline-block rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">
                    {branch.region}
                  </span>
                  <h3 className="mt-3 font-serif text-lg font-bold text-brand-900">{branch.name}</h3>
                  <dl className="mt-3 space-y-1.5 border-t border-slate-100 pt-3 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="shrink-0 text-slate-400" />
                      <dt className="sr-only">지회장</dt>
                      <dd>지회장 {branch.head}</dd>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="shrink-0 text-slate-400" />
                      <dt className="sr-only">연락처</dt>
                      <dd>{branch.phone}</dd>
                    </div>
                  </dl>
                </div>
              ))}
            </div>
          )}
        </div>
      </Container>
    </>
  );
}
