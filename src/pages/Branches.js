import { MapPin, Phone } from "lucide-react";
import { branches } from "../data/site";
import { Container, PageHeader } from "../components/ui";

export default function Branches() {
  return (
    <>
      <PageHeader subtitle="전국 시·도에 두고 있는 지회와 지부입니다." />
      <Container className="pt-10">
        <p className="mb-6 text-sm text-slate-500">
          전체 <strong className="text-brand-800">{branches.length}</strong>개 지회·지부
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {branches.map((branch) => (
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
      </Container>
    </>
  );
}
