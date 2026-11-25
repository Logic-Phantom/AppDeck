/** APPDECK 디자인 토큰 v2 — 라벤더 화이트 배경 + 반투명 글래스 카드 + 네이비 텍스트 + 블루 포인트 */
export interface ColorTokens {
  scheme: 'light' | 'dark';
  /** 화면 배경 그라데이션 위/아래 */
  bgTop: string;
  bgBottom: string;
  canvas: string;
  surface: string;
  /** 반투명 글래스 카드 */
  glass: string;
  glassBorder: string;
  surfaceMuted: string;
  surfacePressed: string;
  border: string;
  hairline: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  /** 라인 아이콘 기본색 (네이비) */
  icon: string;
  primary: string;
  onPrimary: string;
  accent: string;
  accentSoft: string;
  /** 선택된 알약 탭 배경 */
  pill: string;
  danger: string;
  success: string;
  ringTrack: string;
  ringStart: string;
  ringEnd: string;
  shadow: string;
  brandTile: string;
  waveA: string;
  waveB: string;
}

export const lightColors: ColorTokens = {
  scheme: 'light',
  bgTop: '#F6F7FE',
  bgBottom: '#EDF0FC',
  canvas: '#F4F6FD',
  surface: '#FFFFFF',
  glass: 'rgba(255,255,255,0.78)',
  glassBorder: 'rgba(255,255,255,0.95)',
  surfaceMuted: '#EEF1FB',
  surfacePressed: '#E3E8F8',
  border: '#E6EAF6',
  hairline: '#ECEFF8',
  text: '#161B33',
  textSecondary: '#5D6683',
  textTertiary: '#9AA2BC',
  icon: '#26316B',
  primary: '#1F2758',
  onPrimary: '#FFFFFF',
  accent: '#4561F5',
  accentSoft: '#E4E9FF',
  pill: '#DCE4FF',
  danger: '#F0485A',
  success: '#22B573',
  ringTrack: '#E7EBF8',
  ringStart: '#1F2758',
  ringEnd: '#4561F5',
  shadow: '#5A6BC0',
  brandTile: '#FFFFFF',
  waveA: '#C9D2FF',
  waveB: '#8FA0FF',
};

export const darkColors: ColorTokens = {
  scheme: 'dark',
  bgTop: '#10132A',
  bgBottom: '#0B0D1C',
  canvas: '#0E1124',
  surface: '#171B33',
  glass: 'rgba(30,35,64,0.82)',
  glassBorder: 'rgba(255,255,255,0.06)',
  surfaceMuted: '#1D223D',
  surfacePressed: '#262C4C',
  border: '#272D4D',
  hairline: '#20253F',
  text: '#F1F3FC',
  textSecondary: '#A4ABC6',
  textTertiary: '#6C7392',
  icon: '#C5CCF3',
  primary: '#E9ECFF',
  onPrimary: '#12162E',
  accent: '#7D92FF',
  accentSoft: '#252D57',
  pill: '#2B3463',
  danger: '#FF6474',
  success: '#3CCB8A',
  ringTrack: '#252A47',
  ringStart: '#B7C3FF',
  ringEnd: '#5E77FF',
  shadow: '#000000',
  brandTile: '#1D223D',
  waveA: '#2A3270',
  waveB: '#4256C9',
};

export const fonts = {
  regular: 'Pretendard-Regular',
  medium: 'Pretendard-Medium',
  semibold: 'Pretendard-SemiBold',
  bold: 'Pretendard-Bold',
} as const;

export const radius = { sm: 10, md: 16, lg: 20, xl: 26, pill: 999 } as const;
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 } as const;

export const type = {
  display: { fontFamily: fonts.bold, fontSize: 30, letterSpacing: -0.4 },
  headline: { fontFamily: fonts.bold, fontSize: 24, lineHeight: 34, letterSpacing: -0.6 },
  title: { fontFamily: fonts.bold, fontSize: 19, letterSpacing: -0.4 },
  section: { fontFamily: fonts.bold, fontSize: 16, letterSpacing: -0.3 },
  body: { fontFamily: fonts.semibold, fontSize: 15, letterSpacing: -0.3 },
  bodyStrong: { fontFamily: fonts.bold, fontSize: 15.5, letterSpacing: -0.3 },
  caption: { fontFamily: fonts.medium, fontSize: 12.5, letterSpacing: -0.2 },
  micro: { fontFamily: fonts.medium, fontSize: 11, letterSpacing: -0.1 },
} as const;

/** 글래스 카드 그림자 (iOS shadow* / Android elevation) */
export function cardShadow(c: ColorTokens, strength: 1 | 2 = 1) {
  return {
    shadowColor: c.shadow,
    shadowOpacity: c.scheme === 'dark' ? 0.3 : strength === 1 ? 0.08 : 0.14,
    shadowRadius: strength === 1 ? 14 : 22,
    shadowOffset: { width: 0, height: strength === 1 ? 6 : 10 },
    elevation: strength === 1 ? 2 : 5,
  };
}
