import { classifyApp } from '@/domain/categories/category-classifier';
import { CATEGORY_CATALOG } from '@/domain/categories/category.catalog';
import { matchIntent } from '@/domain/search/intent-matcher';
import { DEMO_DEVICE_APPS } from '@/platform/web/demo-apps';

const cat = (pkg: string, name: string) => classifyApp({ packageName: pkg, displayName: name }).categoryId;

describe('카테고리 v2', () => {
  it('여행: 기차·고속버스·항공·숙박', () => {
    expect(cat('com.korail.talk', '코레일톡')).toBe('travel_booking');
    expect(cat('kr.co.tmoney.tmoneybus', '고속버스티머니')).toBe('travel_booking');
    expect(cat('com.koreanair.passenger', '대한항공')).toBe('travel_booking');
    expect(cat('kr.goodchoice.abouthere', '여기어때')).toBe('travel_booking');
    expect(classifyApp({ displayName: 'SRT 승차권' }).categoryId).toBe('travel_booking');
  });

  it('교통(시내 이동)은 여행과 구분된다', () => {
    expect(cat('com.kakao.taxi', '카카오 T')).toBe('transport_mobility');
    expect(cat('com.tmoney.tmoneygo', '티머니GO')).toBe('transport_mobility');
  });

  it('써브웨이(SUBWAY)는 샌드위치 브랜드라 음식점·카페로 분류된다', () => {
    expect(cat('com.subway.mobile.subwayapp03', 'Subway')).toBe('food_dining');
    expect(cat('kr.co.subway.app', '써브웨이')).toBe('food_dining');
    expect(classifyApp({ displayName: '서브웨이' }).categoryId).toBe('food_dining');
  });

  it('지하철 앱은 교통으로 분류된다', () => {
    expect(cat('com.imagedrome.jihachul', '지하철 종결자')).toBe('transport_mobility');
    expect(cat('kr.co.seoulmetro.smartapp', '또타지하철')).toBe('transport_mobility');
    expect(classifyApp({ displayName: '지하철 노선도' }).categoryId).toBe('transport_mobility');
  });

  it('짧은 단어가 다른 앱 이름에 섞여 잘못 분류되지 않는다', () => {
    expect(cat('com.example.pancakemaker', 'Pancake Maker')).not.toBe('education');
    expect(cat('com.example.webshop', 'Web Shop')).not.toBe('education');
    expect(cat('com.example.bluetoothspeaker', 'Speaker Boost')).not.toBe('education');
  });

  it('메신저에 문자(SMS) 앱이 포함된다', () => {
    expect(cat('com.samsung.android.messaging', '메시지')).toBe('messaging_social');
    expect(cat('com.google.android.apps.messaging', 'Messages')).toBe('messaging_social');
    expect(cat('com.kakao.talk', '카카오톡')).toBe('messaging_social');
  });

  it('게임', () => {
    expect(cat('com.devsisters.ck', '쿠키런: 킹덤')).toBe('games');
    expect(cat('com.supercell.clashofclans', 'Clash of Clans')).toBe('games');
  });

  it('공과금·세금·민원', () => {
    expect(cat('kr.go.nts.android', '손택스')).toBe('bills_tax');
    expect(cat('kr.go.minwon.m', '정부24')).toBe('bills_tax');
    expect(cat('com.kepco.cyberbranch', '한전ON')).toBe('bills_tax');
    expect(classifyApp({ displayName: '아파트아이 관리비' }).categoryId).toBe('bills_tax');
  });

  it('유틸리티', () => {
    expect(cat('com.sec.android.app.popupcalculator', '계산기')).toBe('system_tools');
    expect(cat('com.naver.labs.translator', '파파고')).toBe('system_tools');
  });

  it('네이버 지도는 지도, 네이버 웹툰은 읽을거리로 분류된다', () => {
    expect(cat('com.nhn.android.nmap', '네이버 지도')).toBe('maps_navigation');
    expect(cat('com.nhn.android.webtoon', '네이버 웹툰')).toBe('news_reading');
  });

  it('목적 검색: 기차·숙소·문자·공과금·게임·교통', () => {
    expect(matchIntent('기차')?.id).toBe('travel');
    expect(matchIntent('숙소 예약')?.id).toBe('travel');
    expect(matchIntent('문자')?.id).toBe('chat');
    expect(matchIntent('공과금')?.id).toBe('bills');
    expect(matchIntent('게임')?.id).toBe('game');
    expect(matchIntent('교통·이동')?.id).toBe('transport');
  });

  it('모든 카테고리에 이름·부제목·그룹이 있다', () => {
    for (const c of CATEGORY_CATALOG) {
      expect(c.name && c.tagline && c.appLabel && c.group).toBeTruthy();
    }
  });

  it('웹 데모 앱은 모두 "기타"가 아닌 카테고리로 분류된다', () => {
    const others = DEMO_DEVICE_APPS.filter((a) => cat(a.packageName, a.displayName) === 'other').map((a) => a.displayName);
    expect(others).toEqual([]);
  });
});
