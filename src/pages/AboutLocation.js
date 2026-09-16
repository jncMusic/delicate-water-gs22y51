import { Bus, Car, Clock, ExternalLink, Mail, MapPin, Phone, Printer, TrainFront, Wallet } from "lucide-react";
import { directions, org } from "../data/site";
import KakaoMap from "../components/KakaoMap";
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

/**
 * 지도 서비스로 바로 보내는 링크.
 * 열쇠가 필요 없고, 방문객이 쓰던 앱에서 길찾기를 이어서 할 수 있다.
 */
const mapLinks = [
  { label: "카카오맵", href: `https://map.kakao.com/?q=${encodeURIComponent(org.address)}` },
  { label: "네이버 지도", href: `https://map.naver.com/p/search/${encodeURIComponent(org.address)}` },
];

export default function AboutLocation() {
  return (
    <>
      <PageHeader subtitle="협회 사무국 위치와 연락처를 안내합니다." />
      <Container>
        <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
          {/*
            지도에 h-full 을 주면 칸 높이를 통째로 먹어 버려서 아래 버튼이
            칸 밖으로 밀려나고, 모바일에서는 다음 칸의 카드에 가렸다.
            세로 flex 로 두고 지도에 남은 높이를 주면 버튼이 안에 남는다.
          */}
          <div className="flex flex-col">
            <KakaoMap address={org.address} title={org.name} className="flex-1" />
            <div className="mt-3 flex shrink-0 flex-wrap gap-2">
              {mapLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-brand-800 hover:bg-slate-50"
                >
                  {link.label}에서 보기
                  <ExternalLink size={14} className="text-slate-400" />
                </a>
              ))}
            </div>
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
          {directions.length > 0 && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
          )}
          <p className="mt-5 text-sm leading-relaxed text-slate-600">
            방문 전 사무국({org.phone})으로 연락 주시면 담당자를 안내해 드립니다.
            {org.hours && ` 업무시간은 ${org.hours} 입니다.`}
          </p>
        </div>
      </Container>
    </>
  );
}
