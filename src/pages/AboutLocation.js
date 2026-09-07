import { Building2, Clock, Mail, MapPin, Phone, Printer, Wallet } from "lucide-react";
import { org } from "../data/site";
import { Card, Container, PageHeader, SectionTitle } from "../components/ui";

const rows = [
  { icon: MapPin, label: "주소", value: org.address },
  { icon: Phone, label: "대표전화", value: org.phone },
  { icon: Printer, label: "팩스", value: org.fax },
  { icon: Mail, label: "이메일", value: org.email },
  { icon: Clock, label: "업무시간", value: org.hours },
  { icon: Wallet, label: "회비 계좌", value: org.bank },
];

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
                  <row.icon size={16} className="mt-1 shrink-0 text-gold-600" />
                  <div className="min-w-0">
                    <dt className="text-xs font-medium text-slate-500">{row.label}</dt>
                    <dd className="mt-0.5 break-words text-sm text-slate-800">{row.value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </Card>
        </div>
      </Container>
    </>
  );
}
