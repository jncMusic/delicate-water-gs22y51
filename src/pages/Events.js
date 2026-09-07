import { useMemo } from "react";
import { CalendarDays, MapPin } from "lucide-react";
import { useCollection } from "../lib/useCollection";
import { Badge, Container, EmptyState, Loading, PageHeader, SectionTitle } from "../components/ui";

function EventRow({ event, past }) {
  const [year, month, day] = String(event.startDate || "--").split("-");
  return (
    <li
      className={`flex items-center gap-5 rounded-xl border border-slate-200 bg-white p-5 ${
        past ? "opacity-60" : ""
      }`}
    >
      <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-lg bg-brand-800 text-white">
        <span className="text-[10px] text-brand-200">{year}</span>
        <span className="text-lg font-bold leading-none">
          {month}.{day}
        </span>
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{event.category || "행사"}</Badge>
          <h3 className="font-bold text-brand-900">{event.title}</h3>
        </div>
        <p className="mt-1.5 flex items-center gap-1.5 text-sm text-slate-500">
          <MapPin size={14} />
          {event.location || "장소 미정"}
        </p>
      </div>
    </li>
  );
}

export default function Events() {
  const { rows, loading } = useCollection("events");

  const { upcoming, past } = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const sorted = [...rows].sort((a, b) =>
      String(a.startDate).localeCompare(String(b.startDate))
    );
    return {
      upcoming: sorted.filter((e) => !e.startDate || e.startDate >= today),
      past: sorted.filter((e) => e.startDate && e.startDate < today).reverse(),
    };
  }, [rows]);

  return (
    <>
      <PageHeader subtitle="협회가 주최·주관하는 행사 일정입니다." />
      <Container>
        <SectionTitle description="신청과 세부 안내는 공지사항에서 확인하실 수 있습니다.">
          예정된 행사
        </SectionTitle>
        {loading ? (
          <Loading />
        ) : upcoming.length === 0 ? (
          <EmptyState message="예정된 행사가 없습니다." />
        ) : (
          <ul className="space-y-3">
            {upcoming.map((event) => (
              <EventRow key={event.id} event={event} />
            ))}
          </ul>
        )}

        {past.length > 0 && (
          <div className="mt-16">
            <SectionTitle>지난 행사</SectionTitle>
            <ul className="space-y-3">
              {past.map((event) => (
                <EventRow key={event.id} event={event} past />
              ))}
            </ul>
          </div>
        )}

        {!loading && rows.length > 0 && (
          <p className="mt-8 flex items-center gap-2 text-xs text-slate-400">
            <CalendarDays size={14} />
            일정은 협회 사정에 따라 변경될 수 있습니다.
          </p>
        )}
      </Container>
    </>
  );
}
