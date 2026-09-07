import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
import { navigate } from "../lib/router";

/**
 * 이미지가 없는 배너에 쓰는 배경. 관리자가 고른 색조에 따라 달라진다.
 * 협회 색상 안에서만 조합해서, 팔레트를 바꾸면 배너도 함께 따라간다.
 */
const TONES = {
  light: "from-brand-500 via-brand-700 to-brand-950",
  deep: "from-brand-700 via-brand-900 to-brand-950",
  gold: "from-gold-400 via-gold-600 to-brand-900",
  duo: "from-gold-500 via-brand-700 to-brand-950",
};

const AUTOPLAY_MS = 6000;

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

  if (total === 0) return null;

  const current = banners[Math.min(index, total - 1)];
  const clickable = Boolean(current.linkPath);

  return (
    <section aria-label="주요 안내 배너" className="relative">
      <div
        className={`relative h-[320px] overflow-hidden bg-gradient-to-br sm:h-[420px] ${
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
          <p className="text-xs font-medium tracking-wide text-gold-300">
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
