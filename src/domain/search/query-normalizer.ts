const CHOSEONG = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
const HANGUL_START = 0xac00;
const HANGUL_END = 0xd7a3;

/** 소문자화 + 공백/특수문자 제거. 한글·영문·숫자·자모만 남긴다. */
export function normalizeText(value: string): string {
  return value
    .normalize('NFC')
    .toLowerCase()
    .replace(/[^0-9a-zㄱ-ㆎ가-힣]/g, '');
}

/** 한글 음절을 초성으로 바꾼다. 한글이 아닌 문자는 그대로 둔다. */
export function toChoseong(value: string): string {
  let out = '';
  for (const ch of normalizeText(value)) {
    const code = ch.charCodeAt(0);
    out += code >= HANGUL_START && code <= HANGUL_END ? CHOSEONG[Math.floor((code - HANGUL_START) / 588)] : ch;
  }
  return out;
}

/** 입력이 초성(자음)으로만 이루어졌는지 */
export function isChoseongQuery(value: string): boolean {
  const n = normalizeText(value);
  return n.length > 0 && /^[ㄱ-ㅎ]+$/.test(n);
}

const TRAILING_PARTICLES = ['하고싶어', '하고싶다', '할래', '하기', '해줘', '하려고', '보기', '찾기', '앱', '을', '를', '이', '가', '은', '는', '좀'];

/** 검색어 끝의 조사·어미를 1회 제거한다. 예: "배달앱" → "배달", "영화보기" → "영화" */
export function stripParticles(value: string): string {
  const n = normalizeText(value);
  for (const p of TRAILING_PARTICLES) {
    if (n.length > p.length + 1 && n.endsWith(p)) return n.slice(0, -p.length);
  }
  return n;
}
