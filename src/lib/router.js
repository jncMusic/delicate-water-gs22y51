import { useCallback, useEffect, useState } from "react";

/**
 * 아주 작은 라우터. 두 가지 방식을 모두 지원한다.
 *
 * - history: 주소가 kbaband.kr/about/intro 처럼 깔끔하다. 정적 호스팅에서
 *   "없는 주소는 index.html 을 주라"는 설정이 필요하며, 그 설정은
 *   public/_redirects 와 vercel.json 에 넣어 두었다.
 * - hash: 주소에 # 이 붙지만 어떤 환경에서도 그대로 동작한다.
 *   서버 설정을 못 하는 곳(단일 파일 미리보기 등)에서 쓴다.
 *
 * .env 의 REACT_APP_ROUTER 로 고르며, 값이 없으면 history 를 쓴다.
 */
export const ROUTER_MODE = process.env.REACT_APP_ROUTER === "hash" ? "hash" : "history";

/** history 방식은 pushState 로 주소만 바꾸므로 알림 이벤트를 직접 쏜다. */
const ROUTE_EVENT = "kba:route";

const clean = (value) => (value && value.startsWith("/") ? value : "/");

export function currentPath() {
  if (ROUTER_MODE === "hash") return clean(window.location.hash.replace(/^#/, ""));
  return clean(window.location.pathname);
}

export function hrefFor(path) {
  return ROUTER_MODE === "hash" ? `#${path}` : path;
}

export function navigate(path) {
  if (currentPath() === path) return;

  if (ROUTER_MODE === "hash") {
    window.location.hash = path;
    return;
  }
  window.history.pushState({}, "", path);
  window.dispatchEvent(new Event(ROUTE_EVENT));
}

export function useRoute() {
  const [path, setPath] = useState(currentPath);

  useEffect(() => {
    const onChange = () => {
      setPath(currentPath());
      window.scrollTo({ top: 0, behavior: "auto" });
    };
    const events = ROUTER_MODE === "hash" ? ["hashchange"] : ["popstate", ROUTE_EVENT];
    events.forEach((name) => window.addEventListener(name, onChange));
    return () => events.forEach((name) => window.removeEventListener(name, onChange));
  }, []);

  return path;
}

export function Link({ to, children, className = "", onClick, ...rest }) {
  const handle = useCallback(
    (e) => {
      // 새 탭으로 열기(Ctrl/Cmd 클릭, 가운데 버튼)는 브라우저에 맡긴다.
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      navigate(to);
      if (onClick) onClick(e);
    },
    [to, onClick]
  );

  return (
    <a href={hrefFor(to)} onClick={handle} className={className} {...rest}>
      {children}
    </a>
  );
}
