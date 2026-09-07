import { Building2, Bus, Car, Clock, Mail, MapPin, Phone, Printer, TrainFront, Wallet } from "lucide-react";
import { directions, org } from "../data/site";
import { Card, Container, PageHeader, SectionTitle } from "../components/ui";

const allRows = [
  { icon: MapPin, label: "주소", value: org.address },
  { icon: Phone, label: "대표전화", value: org.phone },
  { icon: Printer, label: "팩스", value: org.fax },
  { icon: Mail, label: "이메일", value: org.email },
  { icon: Clock, label: "업무시간", value: org.hours },
  { icon: Wallet, label: "회비 계좌", value: org.bank },
];

// 아직 확인되지 않은 항목은 화면에 내지 않는다.
const rows = allRows.filter((row) => row.value);

const ICONS = { 지하철: TrainFront, 버스: Bus, 자가용: Car };

export default function AboutLocation() {
  return (
    <>
      <PageHeader subtitle="협회 사무국 위치와 연락처를 안내합니다." />
      <Container>
        <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
          {/* 지도 자리. 실제 운영 시 카카오/네이버 지도 스크립트로 교체하세요. */}
          <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-slate-400">
            <Building2 size={36} />
            <p className="text-sm">지도 영역</p>
            <p className="max-w-xs text-center text-xs leading-relaxed">
              카카오맵 또는 네이버 지도 스크립트를 이 자리에 넣으면 실제 약도가 표시됩니다.
            </p>
          </div>

          <Card>
            <SectionTitle>사무국 안내</SectionTitle>
            <dl className="space-y-5">
              {rows.map((row) => (
                <div key={row.label} className="flex gap-3">
                  <row.icon size={16} className="mt-1 shrink-0 text-accent-600" />
                  <div className="min-w-0">
                    <dt className="text-xs font-medium text-slate-500">{row.label}</dt>
                    <dd className="mt-0.5 break-words text-sm text-slate-800">{row.value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </Card>
        </div>

        <div className="mt-16">
          <SectionTitle description="사무국 방문 시 참고해 주세요.">교통 안내</SectionTitle>
          <div className="grid gap-5 sm:grid-cols-3">
            {directions.map((way) => {
              const Icon = ICONS[way.type] || Bus;
              return (
                <div key={way.type} className="rounded-xl border border-slate-200 bg-white p-6">
                  <h3 className="flex items-center gap-2 font-bold text-brand-900">
                    <Icon size={17} className="text-accent-600" />
                    {way.type}
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {way.items.map((item) => (
                      <li key={item} className="flex gap-2 text-sm leading-relaxed text-slate-600">
                        <span
                          aria-hidden="true"
                          className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent-500"
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
          <p className="mt-5 text-xs text-slate-500">
            방문 전 사무국({org.phone})으로 연락 주시면 담당자를 안내해 드립니다.
            {org.hours && ` 업무시간은 ${org.hours} 입니다.`}
          </p>
        </div>
      </Container>
    </>
  );
}
