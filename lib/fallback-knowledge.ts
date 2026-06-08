// 크롤링 실패 시 사용하는 기본 회사 지식베이스
export const FALLBACK_KNOWLEDGE: Record<string, string> = {
  "mitos-thera.com": `
[Mitos Therapeutics Inc. - 회사 개요]
미토스테라퓨틱스(Mitos Therapeutics Inc.)는 미토콘드리아(Mitochondria) 기반의 항대사증후군/항암 신약을 개발하는 바이오벤처 기업입니다.
슬로건: Innovation Today, Healthier Tomorrow
위치: 대전광역시 유성구 대학로 99, 산학연 (충남대학교), 34134, South Korea
이메일: insulin@mitos-thera.com
전화: +82-42-825-6702
팁스(TIPS) 선정 기업

[핵심 연구 분야]
- 미토콘드리아 기능 조절을 통한 대사증후군 치료제 개발
- 미토콘드리아 타겟 항암제 개발
- 미토콘드리아 관련 희귀질환 치료제 연구

[주요 파이프라인]
- 항대사증후군 신약 후보물질 (제2형 당뇨, 비만, 지방간 타겟)
- 항암 신약 후보물질 (미토콘드리아 에너지 대사 조절 기전)

[과학적 배경 (Science)]
미토콘드리아는 세포의 에너지 공장으로, 기능 이상 시 당뇨병·암·노화 등 다양한 질환과 직결됩니다.
미토스테라퓨틱스는 이 미토콘드리아를 직접 타겟하는 혁신적 접근법으로 신약을 개발합니다.

[비전]
오늘의 혁신으로 더 건강한 내일을 만듭니다.
`,
  "mitoshealthcare.com": `
[Mitos Healthcare - 회사 개요]
미토스헬스케어(Mitos Healthcare)는 미토스테라퓨틱스의 헬스케어 브랜드로,
근육 건강기능성 식품과 기능성 화장품을 개발·판매합니다.

[주요 제품군]
1. 근육 건강기능성 식품
   - 근감소증(sarcopenia) 예방을 위한 기능성 제품
   - 미토콘드리아 활성화를 통한 에너지 대사 개선 제품
   - 운동 성능 향상 및 회복 지원 보조식품

2. 기능성 화장품
   - 미토콘드리아 기반 피부 기능 개선 화장품
   - 항노화(Anti-aging) 기능성 스킨케어 라인
   - 세포 에너지 대사 활성화 원료 적용 제품

[브랜드 특징]
- 모기업(미토스테라퓨틱스)의 미토콘드리아 연구 기반 기술 적용
- 과학적 근거 기반의 기능성 소재 사용
- 신약 연구에서 검증된 원료를 헬스케어 제품에 응용
`,
};

export function getFallbackKnowledge(url: string): string | null {
  for (const [domain, knowledge] of Object.entries(FALLBACK_KNOWLEDGE)) {
    if (url.includes(domain)) return knowledge;
  }
  return null;
}
