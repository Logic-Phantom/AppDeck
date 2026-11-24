import { classifyApp } from '@/domain/categories/category-classifier';

describe('category-classifier', () => {
  it('사용자 지정 분류가 항상 우선한다', () => {
    const r = classifyApp({ displayName: '넷플릭스', packageName: 'com.netflix.mediaclient', userCategoryId: 'games' });
    expect(r).toMatchObject({ categoryId: 'games', source: 'user', confidence: 'high' });
  });

  it('패키지명 규칙은 가장 구체적인 패턴을 택한다', () => {
    expect(classifyApp({ displayName: '쿠팡이츠', packageName: 'com.coupang.mobile.eats' }).categoryId).toBe('food_delivery');
    expect(classifyApp({ displayName: '쿠팡', packageName: 'com.coupang.mobile' }).categoryId).toBe('shopping');
    expect(classifyApp({ displayName: '쿠팡플레이', packageName: 'com.coupang.mobile.play' }).categoryId).toBe('streaming_video');
  });

  it('대표 카테고리를 분류한다', () => {
    expect(classifyApp({ displayName: '네이버 지도', packageName: 'com.nhn.android.nmap' }).categoryId).toBe('maps_navigation');
    expect(classifyApp({ displayName: 'YouTube', packageName: 'com.google.android.youtube' }).categoryId).toBe('streaming_video');
    expect(classifyApp({ displayName: '멜론', packageName: 'com.iloen.melon' }).categoryId).toBe('music_audio');
  });

  it('패키지 정보가 없으면 이름 키워드로 후보를 낸다', () => {
    const r = classifyApp({ displayName: '우리동네 배달' });
    expect(r.categoryId).toBe('food_delivery');
    expect(r.source).toBe('local_rule');
  });

  it('Android 플랫폼 카테고리는 힌트로만 쓴다', () => {
    expect(classifyApp({ displayName: 'Zzz', packageName: 'com.example.zzz', platformCategory: 0 })).toMatchObject({
      categoryId: 'games',
      source: 'platform',
    });
  });

  it('근거가 없으면 기타(낮은 신뢰도)로 둔다', () => {
    expect(classifyApp({ displayName: '알수없는앱', packageName: 'com.example.unknownthing' })).toMatchObject({
      categoryId: 'other',
      confidence: 'low',
      source: 'fallback',
    });
  });

  it('"페이스북"을 결제(페이)로 잘못 분류하지 않는다', () => {
    expect(classifyApp({ displayName: '페이스북' }).categoryId).toBe('messaging_social');
  });
});
