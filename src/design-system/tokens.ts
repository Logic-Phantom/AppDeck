/** APPDECK 디자인 토큰 — 화이트/오프화이트 + 차콜 텍스트 + 단일 포인트 블루 */
export interface ColorTokens {
  scheme: 'light' | 'dark';
  canvas: string;
  surface: string;
  surfaceMuted: string;
  surfacePressed: string;
  border: string;
  hairline: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  primary: string;
  onPrimary: string;
  accent: string;
  accentSoft: string;
  danger: string;
  success: string;
  ringTrack: string;
  ringStart: string;
  ringEnd: string;
  shadow: string;
  brandTile: string;
  brandMark: string;
  splashTop: string;
  splashBottom: string;
}

export const lightColors: ColorTokens = {
  scheme: 'light',
  canvas: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceMuted: '#F4F5F9',
  surfacePressed: '#ECEEF4',
  border: '#ECEEF3',
  hairline: '#F0F1F5',
  text: '#15171C',
  textSecondary: '#6B7080',
  textTertiary: '#A0A5B2',
  primary: '#15171C',
  onPrimary: '#FFFFFF',
  accent: '#4B63F0',
  accentSoft: '#E8ECFF',
  danger: '#F0484E',
  success: '#22B573',
  ringTrack: '#EDEFF5',
  ringStart: '#1B2140',
  ringEnd: '#4B63F0',
  shadow: 'rgba(30, 40, 90, 0.08)',
  brandTile: '#FFFFFF',
  brandMark: '#111317',
  splashTop: '#F6F7FC',
  splashBottom: '#E9ECFB',
};

export const darkColors: ColorTokens = {
  scheme: 'dark',
  canvas: '#0F1115',
  surface: '#171A20',
  surfaceMuted: '#1C1F26',
  surfacePressed: '#252933',
  border: '#272B34',
  hairline: '#20232A',
  text: '#F2F3F7',
  textSecondary: '#A3A8B6',
  textTertiary: '#6E7381',
  primary: '#F2F3F7',
  onPrimary: '#111317',
  accent: '#7B8CFF',
  accentSoft: '#232A4D',
  danger: '#FF6268',
  success: '#3CCB8A',
  ringTrack: '#232731',
  ringStart: '#AFC0FF',
  ringEnd: '#5A70FF',
  shadow: 'rgba(0, 0, 0, 0.4)',
  brandTile: '#1C1F26',
  brandMark: '#F2F3F7',
  splashTop: '#11131A',
  splashBottom: '#171B2E',
};

export const fonts = {
  regular: 'Pretendard-Regular',
  medium: 'Pretendard-Medium',
  semibold: 'Pretendard-SemiBold',
  bold: 'Pretendard-Bold',
} as const;

export const radius = { sm: 10, md: 14, lg: 18, xl: 24, pill: 999 } as const;
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 } as const;

export const type = {
  display: { fontFamily: fonts.bold, fontSize: 30, letterSpacing: -0.4 },
  title: { fontFamily: fonts.bold, fontSize: 18, letterSpacing: -0.3 },
  greeting: { fontFamily: fonts.semibold, fontSize: 17, lineHeight: 25, letterSpacing: -0.3 },
  section: { fontFamily: fonts.bold, fontSize: 15, letterSpacing: -0.2 },
  body: { fontFamily: fonts.medium, fontSize: 14.5, letterSpacing: -0.2 },
  bodyStrong: { fontFamily: fonts.semibold, fontSize: 14.5, letterSpacing: -0.2 },
  caption: { fontFamily: fonts.medium, fontSize: 12, letterSpacing: -0.1 },
  micro: { fontFamily: fonts.medium, fontSize: 10.5, letterSpacing: -0.1 },
} as const;
