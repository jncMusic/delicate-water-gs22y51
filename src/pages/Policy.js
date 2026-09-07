import { Info } from "lucide-react";
import { memberSideMenu, org } from "../data/site";
import { SidebarPage } from "../components/ui";

const NOTE =
  "아래 문서는 홈페이지 구성을 위한 표준 예시입니다. 실제 운영 전에 협회 사정에 맞게 검토·수정하시고, 필요하면 법률 자문을 받으시기 바랍니다.";

function Notice() {
  return (
    <p className="mb-8 flex items-start gap-2.5 rounded-lg border border-brand-200 bg-brand-50 px-4 py-3 text-sm leading-relaxed text-brand-800">
      <Info size={16} className="mt-0.5 shrink-0" />
      {NOTE}
    </p>
  );
}

function Document({ sections }) {
  return (
    <div className="space-y-9">
      {sections.map((section) => (
        <section key={section.title}>
          <h2 className="border-b-2 border-brand-800 pb-2 font-serif text-base font-bold text-brand-900">
            {section.title}
          </h2>
          <div className="mt-4 space-y-3 text-[15px] leading-7 text-slate-700">
            {section.paragraphs.map((text) => (
              <p key={text.slice(0, 24)}>{text}</p>
            ))}
            {section.list && (
              <ul className="space-y-1.5 pl-1">
                {section.list.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span
                      aria-hidden="true"
                      className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-accent-500"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}

export function Terms() {
  return (
    <SidebarPage menu={memberSideMenu}>
      <Notice />
      <Document
        sections={[
          {
            title: "제1조 (목적)",
            paragraphs: [
              `이 약관은 ${org.fullName}(이하 “협회”)가 운영하는 홈페이지에서 제공하는 서비스의 이용 조건과 절차, 협회와 이용자의 권리·의무를 정함을 목적으로 합니다.`,
            ],
          },
          {
            title: "제2조 (서비스의 내용)",
            paragraphs: ["협회는 홈페이지를 통해 다음의 서비스를 제공합니다."],
            list: [
              "협회 소개 및 사업 안내",
              "공지사항, 보도자료 등 각종 소식 제공",
              "자료실을 통한 서식·교육자료 제공",
              "회원 가입 신청 접수 및 회원 안내",
            ],
          },
          {
            title: "제3조 (이용자의 의무)",
            paragraphs: [
              "이용자는 신청 시 사실에 근거한 정보를 제공하여야 하며, 타인의 정보를 도용하여서는 안 됩니다.",
              "이용자는 홈페이지에 게시된 자료를 협회의 사전 승인 없이 상업적 목적으로 이용할 수 없습니다.",
            ],
          },
          {
            title: "제4조 (게시물의 관리)",
            paragraphs: [
              "협회는 이용자가 등록한 게시물이 다음에 해당하는 경우 사전 통지 없이 삭제할 수 있습니다.",
            ],
            list: [
              "타인의 명예를 훼손하거나 권리를 침해하는 내용",
              "법령에 위반되거나 공공질서에 반하는 내용",
              "서비스와 관련 없는 광고성 내용",
            ],
          },
          {
            title: "제5조 (면책)",
            paragraphs: [
              "협회는 천재지변, 통신 장애 등 불가항력으로 인하여 서비스를 제공할 수 없는 경우 책임이 면제됩니다.",
              "협회는 이용자가 게시한 정보의 신뢰도·정확성에 대하여 책임을 지지 않습니다.",
            ],
          },
          {
            title: "부칙",
            paragraphs: ["이 약관은 공고한 날부터 시행합니다."],
          },
        ]}
      />
    </SidebarPage>
  );
}

export function Privacy() {
  return (
    <SidebarPage menu={memberSideMenu}>
      <Notice />
      <Document
        sections={[
          {
            title: "1. 개인정보의 수집 항목 및 이용 목적",
            paragraphs: [
              `${org.fullName}는 회원 관리와 행사 안내를 위하여 아래의 개인정보를 수집합니다.`,
            ],
            list: [
              "필수 항목: 성명(단체명), 연락처, 이메일",
              "선택 항목: 소속, 직위, 전공 악기, 활동 지역",
              "이용 목적: 회원 자격 확인 및 관리, 행사·교육 안내, 회비 납부 안내",
            ],
          },
          {
            title: "2. 개인정보의 보유 및 이용 기간",
            paragraphs: [
              "수집한 개인정보는 회원 자격이 유지되는 동안 보유하며, 탈퇴 또는 자격 상실 시 지체 없이 파기합니다.",
              "다만 관계 법령에 따라 보존할 필요가 있는 경우에는 해당 기간 동안 보관합니다.",
            ],
          },
          {
            title: "3. 개인정보의 제3자 제공",
            paragraphs: [
              "협회는 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만 법령에 근거하거나 이용자가 사전에 동의한 경우는 예외로 합니다.",
            ],
          },
          {
            title: "4. 정보주체의 권리",
            paragraphs: [
              "이용자는 언제든지 본인의 개인정보에 대한 열람, 정정, 삭제, 처리정지를 요구할 수 있습니다.",
              `요청은 사무국(${org.email}, ${org.phone})으로 접수하실 수 있으며, 협회는 지체 없이 조치합니다.`,
            ],
          },
          {
            title: "5. 개인정보 보호책임자",
            paragraphs: [
              `개인정보 보호책임자: 사무국장 (${org.email} / ${org.phone})`,
              "협회는 개인정보 처리와 관련한 문의·불만을 신속하게 처리하고 있습니다.",
            ],
          },
        ]}
      />
    </SidebarPage>
  );
}

export function EmailPolicy() {
  return (
    <SidebarPage menu={memberSideMenu}>
      <Notice />
      <Document
        sections={[
          {
            title: "이메일 무단수집 거부",
            paragraphs: [
              "본 홈페이지에 게시된 이메일 주소가 전자우편 수집 프로그램이나 그 밖의 기술적 장치를 이용하여 무단으로 수집되는 것을 거부하며, 이를 위반 시 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」에 의해 형사처벌될 수 있습니다.",
            ],
          },
          {
            title: "관련 법령",
            paragraphs: [
              "정보통신망 이용촉진 및 정보보호 등에 관한 법률 제50조의2 (전자우편주소의 무단 수집행위 등 금지)",
            ],
            list: [
              "누구든지 전자우편주소의 수집을 거부하는 의사가 명시된 인터넷 홈페이지에서 자동으로 전자우편주소를 수집하는 프로그램, 그 밖의 기술적 장치를 이용하여 전자우편주소를 수집하여서는 아니 된다.",
              "누구든지 제1항을 위반하여 수집된 전자우편주소를 판매·유통하여서는 아니 된다.",
            ],
          },
        ]}
      />
    </SidebarPage>
  );
}
