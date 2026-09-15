import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
import { Link, navigate } from "../lib/router";
import { org } from "../data/site";

/**
 * 이미지가 없는 배너에 쓰는 배경. 관리자가 고른 색조에 따라 달라진다.
 * 그라데이션 없이 단색만 쓴다.
 */
const TONES = {
  deep: "bg-brand-900",
  darkest: "bg-brand-950",
  mid: "bg-brand-700",
  accent: "bg-accent-500",
};

const AUTOPLAY_MS = 6000;


/** 등록된 배너가 없을 때 대신 보여 주는 첫 화면. */
function DefaultHero() {
  return (
    <section aria-label="협회 소개" className="relative bg-brand-900">
      <div className="mx-auto flex min-h-[320px] max-w-6xl flex-col justify-center px-5 py-16 text-white sm:min-h-[420px]">
        <p className="font-display text-xs font-semibold tracking-[0.2em] text-accent-300">
          {org.nameEn}
        </p>
        <h2 className="mt-4 font-serif text-3xl font-bold leading-tight sm:text-5xl">
          {org.name}
        </h2>
        <p className="mt-5 max-w-2xl text-sm leading-relaxed text-white/85 sm:text-base">
          {org.description}
        </p>
        <p className="mt-3 text-sm text-white/60">{org.founded} 창설</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/members/apply"
            className="rounded-lg bg-accent-500 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-accent-600"
          >
            회원 가입 신청
          </Link>
          <Link
            to="/about/overview"
            className="rounded-lg border border-white/40 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10"
          >
            협회 소개
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function HeroSlider({ banners }) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);

  const total = banners.length;
  const go = useCallback((next) => setIndex(((next % total) + total) % total), [total]);

  useEffect(() => {
    if (!playing || total <= 1) return undefined;
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % total), AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [playing, total]);

  // 배너 수가 줄어들어 현재 위치가 범위를 벗어나면 처음으로 되돌린다.
  useEffect(() => {
    if (index >= total) setIndex(0);
  }, [index, total]);

  // 배너를 한 건도 등록하지 않으면 첫 화면이 통째로 비어 버린다.
  // 사무국이 배너를 올리기 전에도 협회가 어떤 곳인지는 보여야 한다.
  if (total === 0) return <DefaultHero />;

  const current = banners[Math.min(index, total - 1)];
  const clickable = Boolean(current.linkPath);

  return (
    <section aria-label="주요 안내 배너" className="relative">
      <div
        className={`relative h-[320px] overflow-hidden sm:h-[420px] ${
          TONES[current.tone] || TONES.deep
        }`}
      >
        {current.image && (
          <img
            src={current.image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        {current.image && <div aria-hidden="true" className="absolute inset-0 bg-brand-950/45" />}

        <div className="relative mx-auto flex h-full max-w-6xl flex-col justify-center px-5 text-white">
          {/* 한글이 들어오는 자리라 라틴용 넓은 자간을 쓰지 않는다. */}
          <p className="text-xs font-medium tracking-wide text-accent-300">
            {current.caption}
          </p>
          <h2 className="mt-4 max-w-3xl font-serif text-3xl font-bold leading-tight drop-shadow sm:text-5xl">
            {current.title}
          </h2>
          {current.subtitle && (
            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-white/90 sm:text-base">
              {current.subtitle}
            </p>
          )}
          {clickable && (
            <button
              type="button"
              onClick={() => navigate(current.linkPath)}
              className="mt-8 w-fit rounded-lg bg-white/95 px-6 py-3 text-sm font-bold text-brand-900 transition-colors hover:bg-white"
            >
              자세히 보기
            </button>
          )}
        </div>

        {/* 좌우 이동과 현재 위치 */}
        <div className="absolute bottom-5 right-5 flex items-center gap-3 text-white sm:bottom-8 sm:right-8">
          <button
            type="button"
            onClick={() => setPlaying((v) => !v)}
            aria-label={playing ? "배너 자동 넘김 멈춤" : "배너 자동 넘김 시작"}
            className="rounded-full border border-white/40 p-1.5 hover:bg-white/15"
          >
            {playing ? <Pause size={14} /> : <Play size={14} />}
          </button>
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label="이전 배너"
            className="rounded-full border border-white/40 p-1.5 hover:bg-white/15"
          >
            <ArrowLeft size={16} />
          </button>
          <span className="min-w-14 text-center text-sm tabular-nums">
            <strong>{index + 1}</strong>
            <span className="mx-1.5 text-white/50">/</span>
            {total}
          </span>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label="다음 배너"
            className="rounded-full border border-white/40 p-1.5 hover:bg-white/15"
          >
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}
