/** 사이트 전역 상수. TODO는 실제 내용으로 채울 것. */
export const SITE = {
    name: 'Jun Park',
    /** 홈 첫 문단. 주장 말고 사실 — 지금 무엇을 하고 있는지. */
    intro:
        'TODO: 두세 문장. 무슨 일을 하고 있고, 어떤 걸 만들어 왔는지. ' +
        '"열정적인" 같은 형용사 말고 구체적인 명사로.',
    /** 검색 결과와 링크 미리보기 한 줄. */
    description: 'TODO: 한 문장. 누가 검색 결과에서 이걸 보고 클릭할지 생각하고 쓸 것.',
    url: 'https://junpark.me',
    location: 'Dubai',
    /** TODO: 공개할 주소. 비우면 관련 링크가 렌더되지 않는다. */
    email: '',
    /** TODO: 쓰는 것만 채운다. 빈 값은 자동으로 숨겨진다. */
    social: {
        github: '',
        linkedin: '',
    },
} as const;

export const NAV = [
    { href: '/projects/', label: 'Projects' },
    { href: '/blog/', label: 'Blog' },
    { href: '/journal/', label: 'Journal' },
    { href: '/about/', label: 'About' },
] as const;

export const socialLinks = () =>
    Object.entries(SITE.social)
        .filter(([, url]) => url)
        .map(([name, url]) => ({ name, url }));
