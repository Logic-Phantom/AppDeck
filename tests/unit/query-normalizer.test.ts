import { isChoseongQuery, normalizeText, stripParticles, toChoseong } from '@/domain/search/query-normalizer';

describe('query-normalizer', () => {
  it('대소문자·공백·특수문자를 정규화한다', () => {
    expect(normalizeText('  Netflix! ')).toBe('netflix');
    expect(normalizeText('배달 주문')).toBe('배달주문');
    expect(normalizeText('카카오 T')).toBe('카카오t');
  });

  it('한글을 초성으로 바꾼다', () => {
    expect(toChoseong('배달의민족')).toBe('ㅂㄷㅇㅁㅈ');
    expect(toChoseong('네이버 지도')).toBe('ㄴㅇㅂㅈㄷ');
    expect(toChoseong('CGV 앱')).toBe('cgvㅇ');
  });

  it('초성 검색어를 판별한다', () => {
    expect(isChoseongQuery('ㅂㄷ')).toBe(true);
    expect(isChoseongQuery('배달')).toBe(false);
    expect(isChoseongQuery('')).toBe(false);
  });

  it('끝 조사·어미를 1회 제거한다', () => {
    expect(stripParticles('배달앱')).toBe('배달');
    expect(stripParticles('영화보기')).toBe('영화');
    expect(stripParticles('지도를')).toBe('지도');
    expect(stripParticles('앱')).toBe('앱');
  });
});
