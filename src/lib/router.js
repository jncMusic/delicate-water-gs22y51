import { useEffect, useState, useCallback } from "react";

/**
 * 해시(#) 기반의 아주 작은 라우터.
 * 별도 서버 설정 없이 정적 호스팅(Netlify, Vercel, GitHub Pages 등)에서
 * 새로고침·직접 링크가 모두 동작하도록 해시를 사용한다.
 */

export function currentPath() {
  const hash = window.location.hash.replace(/^#/, "");
  return hash.startsWith("/") ? hash : "/";
}

export function navigate(path) {
  if (currentPath() === path) return;
  window.location.hash = path;
}

export function useRoute() {
  const [path, setPath] = useState(currentPath);

  useEffect(() => {
    const onChange = () => {
      setPath(currentPath());
      window.scrollTo({ top: 0, behavior: "auto" });
    };
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  return path;
}

export function Link({ to, children, className = "", onClick, ...rest }) {
  const handle = useCallback(
    (e) => {
      e.preventDefault();
      navigate(to);
      if (onClick) onClick(e);
    },
    [to, onClick]
  );

  return (
    <a href={`#${to}`} onClick={handle} className={className} {...rest}>
      {children}
    </a>
  );
}
