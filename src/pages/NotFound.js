import { Link } from "../lib/router";
import { Container, PageHeader } from "../components/ui";

export default function NotFound() {
  return (
    <>
      <PageHeader title="페이지를 찾을 수 없습니다" />
      <Container>
        <div className="py-10 text-center">
          <p className="text-slate-600">
            주소가 변경되었거나 삭제된 페이지입니다. 주소를 다시 확인해 주세요.
          </p>
          <Link
            to="/"
            className="mt-6 inline-block rounded-lg bg-brand-700 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-800"
          >
            홈으로 이동
          </Link>
        </div>
      </Container>
    </>
  );
}
