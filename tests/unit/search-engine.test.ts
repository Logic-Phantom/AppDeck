import { matchIntent } from '@/domain/search/intent-matcher';
import { searchApps } from '@/domain/search/search-engine';

import { syntheticApps } from '../fixtures/synthetic-apps';

const names = (q: string) => searchApps(syntheticApps(), q).hits.map((h) => h.app.displayName);

describe('intent-matcher', () => {
  it.each([
    ['배달 주문', 'delivery'],
    ['음식 주문', 'delivery'],
    ['길찾기', 'directions'],
    ['내비', 'directions'],
    ['OTT', 'ott'],
    ['드라마', 'ott'],
    ['영화', 'movie'],
    ['음악', 'music'],
    ['여행', 'travel'],
    ['송금', 'finance'],
  ])('"%s" → %s', (q, id) => {
    expect(matchIntent(q)?.id).toBe(id);
  });

  it('관련 없는 검색어는 목적이 없다', () => {
    expect(matchIntent('넷플릭스')).toBeNull();
    expect(matchIntent('')).toBeNull();
  });
});

describe('search-engine', () => {
  it('목적 검색은 설치(등록)된 앱만 돌려준다', () => {
    const r = names('배달 주문');
    expect(r).toEqual(expect.arrayContaining(['배달의민족', '쿠팡이츠']));
    expect(r).not.toContain('요기요'); // 기기에 없는 앱은 절대 나오지 않음
    expect(r).not.toContain('넷플릭스');
  });

  it('OTT 검색에 영상 앱이 나온다', () => {
    expect(names('OTT')).toEqual(expect.arrayContaining(['넷플릭스', 'YouTube']));
  });

  it('길찾기 검색에 지도 앱이 나온다', () => {
    expect(names('길찾기')).toContain('네이버 지도');
  });

  it('정확한 앱 이름이 가장 먼저 나온다', () => {
    expect(names('쿠팡')[0]).toBe('쿠팡');
  });

  it('초성 검색을 지원한다', () => {
    expect(names('ㅂㄷㅇㅁㅈ')).toEqual(['배달의민족']);
    expect(names('ㄴㅍ')).toContain('넷플릭스');
  });

  it('사용자 별칭으로 찾는다', () => {
    const apps = syntheticApps().map((a) => (a.displayName === '배달의민족' ? { ...a, aliases: ['배민'] } : a));
    expect(searchApps(apps, '배민').hits.map((h) => h.app.displayName)).toEqual(['배달의민족']);
  });

  it('패키지명 검색은 옵션일 때만 동작한다', () => {
    expect(searchApps(syntheticApps(), 'nmap').hits).toHaveLength(0);
    expect(searchApps(syntheticApps(), 'nmap', { includePackageName: true }).hits[0].app.displayName).toBe('네이버 지도');
  });

  it('여러 카테고리에 걸친 목적은 탭 분리가 필요하다고 알려 준다', () => {
    const r = searchApps(syntheticApps(), '배달');
    expect(r.matchedCategories).toEqual(['food_delivery', 'food_dining']);
    expect(r.needsDisambiguation).toBe(true);
  });

  it('같은 입력에 같은 결과를 낸다', () => {
    expect(names('영화')).toEqual(names('영화'));
  });

  it('일치하는 앱이 없으면 빈 결과', () => {
    expect(searchApps(syntheticApps(), '여행').hits).toHaveLength(0);
  });
});
