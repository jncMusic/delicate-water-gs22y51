import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";

/**
 * 오시는 길의 위치 안내.
 *
 * 기본은 주소를 큼직하게 보여 주는 안내판이다. 협회는 카카오맵 키 없이
 * 주소만으로 운영하기로 했고, 방문객은 어차피 쓰던 지도 앱에서 길찾기를 한다.
 *
 * REACT_APP_KAKAO_MAP_KEY 를 넣어 두면 그 자리가 실제 약도로 바뀐다. 키가
 * 없거나 스크립트를 받지 못하면 안내판이 그대로 남으므로, 어느 쪽이든 화면이
 * 비지 않는다.
 *
 * 좌표를 코드에 박지 않고 주소로 찾는다. 사무국이 이사하면 site.js 의 주소만
 * 고치면 지도도 따라 움직인다.
 */

const SDK_ID = "kakao-maps-sdk";
const KEY = process.env.REACT_APP_KAKAO_MAP_KEY || "";

let sdkPromise = null;

/** SDK 는 한 번만 받는다. 화면을 오가며 여러 번 불러도 script 는 하나다. */
function loadKakaoSdk() {
  if (!KEY) return Promise.reject(new Error("키가 없습니다"));
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise((resolve, reject) => {
    // autoload=false 로 받아 왔으므로 maps.load 를 직접 불러 줘야 한다.
    const ready = () => window.kakao.maps.load(() => resolve(window.kakao));

    const existing = document.getElementById(SDK_ID);
    if (existing) {
      if (window.kakao && window.kakao.maps) ready();
      else existing.addEventListener("load", ready, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = SDK_ID;
    script.async = true;
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KEY}&autoload=false&libraries=services`;
    script.onload = ready;
    script.onerror = () => reject(new Error("스크립트를 받지 못했습니다"));
    document.head.appendChild(script);
  });

  return sdkPromise;
}

export default function KakaoMap({ address, title, className = "" }) {
  const box = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!KEY || !address) return undefined;
    let alive = true;

    loadKakaoSdk()
      .then((kakao) => {
        if (!alive || !box.current) return;
        new kakao.maps.services.Geocoder().addressSearch(address, (result, status) => {
          if (!alive || !box.current) return;
          if (status !== kakao.maps.services.Status.OK || !result[0]) return;

          const position = new kakao.maps.LatLng(result[0].y, result[0].x);
          const map = new kakao.maps.Map(box.current, { center: position, level: 3 });
          const marker = new kakao.maps.Marker({ map, position });
          new kakao.maps.InfoWindow({
            content: `<div style="padding:6px 12px;font-size:12px;white-space:nowrap">${title}</div>`,
          }).open(map, marker);
          map.addControl(new kakao.maps.ZoomControl(), kakao.maps.ControlPosition.RIGHT);
          setReady(true);
        });
      })
      .catch(() => {
        // 키가 없거나 못 받았을 뿐이다. 아래 주소 판이 대신 보인다.
      });

    return () => {
      alive = false;
    };
  }, [address, title]);

  return (
    <div
      className={`relative min-h-[260px] overflow-hidden rounded-xl border border-slate-200 bg-brand-900 ${className}`}
    >
      <div ref={box} className="absolute inset-0" />
      {!ready && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-8 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
            <MapPin size={24} className="text-accent-400" />
          </span>
          <div>
            <p className="font-display text-[11px] font-semibold uppercase tracking-[0.25em] text-accent-400">
              Address
            </p>
            <p className="mt-3 font-serif text-lg font-bold leading-relaxed text-white sm:text-xl">
              {address}
            </p>
            <p className="mt-2 text-sm text-brand-200">{title} 사무국</p>
          </div>
        </div>
      )}
    </div>
  );
}
