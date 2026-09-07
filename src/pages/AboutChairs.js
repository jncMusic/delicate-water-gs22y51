import { pastChairs } from "../data/site";
import { Container, PageHeader } from "../components/ui";

export default function AboutChairs() {
  return (
    <>
      <PageHeader subtitle="역대 회장 명단입니다. 현 대표 직함은 이사장입니다." />
      <Container className="pt-10">
        <table className="w-full border-t-2 border-brand-800 text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th scope="col" className="w-32 py-3 font-medium">대수</th>
              <th scope="col" className="py-3 font-medium">성명</th>
              <th scope="col" className="w-48 py-3 font-medium">재임 기간</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pastChairs.map((chair) => (
              <tr
                key={chair.order}
                className={chair.current ? "bg-brand-50 font-medium text-brand-900" : ""}
              >
                <td className="py-3.5 text-center">
                  {chair.order}
                  {chair.current && (
                    <span className="ml-2 rounded-full bg-brand-700 px-2 py-0.5 text-[10px] text-white">
                      현직
                    </span>
                  )}
                </td>
                <td className="py-3.5 text-center text-slate-800">{chair.name}</td>
                <td className="py-3.5 text-center text-slate-500">{chair.term}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Container>
    </>
  );
}
