import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type IconName =
  | 'home'
  | 'home-filled'
  | 'search'
  | 'star'
  | 'star-filled'
  | 'settings'
  | 'settings-filled'
  | 'chevron-left'
  | 'chevron-right'
  | 'close'
  | 'scan'
  | 'bell'
  | 'lock'
  | 'theme'
  | 'package'
  | 'cache'
  | 'reset'
  | 'pin'
  | 'clock'
  | 'pause'
  | 'play'
  | 'camera'
  | 'check'
  | 'bolt'
  | 'grid'
  | 'broom'
  | 'plus'
  | 'apps'
  | 'export'
  | 'chart'
  | 'eye-off'
  | 'won'
  | 'car'
  | 'link';

interface Props {
  name: IconName;
  size?: number;
  color: string;
  strokeWidth?: number;
  /** 채워진 아이콘의 안쪽 구멍 색 (배경색) */
  holeColor?: string;
}

/** 레퍼런스 디자인의 라인 아이콘(1.7px 스트로크, 둥근 끝)을 SVG로 재현 */
export function Icon({ name, size = 22, color, strokeWidth = 1.7, holeColor = "#FFFFFF" }: Props) {
  const p = { stroke: color, strokeWidth, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };
  const body = (() => {
    switch (name) {
      case 'home':
        return <Path {...p} d="M4 10.2 12 4l8 6.2V19a1.5 1.5 0 0 1-1.5 1.5H15v-5.2h-6v5.2H5.5A1.5 1.5 0 0 1 4 19z" />;
      case 'home-filled':
        return (
          <Path
            d="M3.4 9.6 11.1 3.6a1.5 1.5 0 0 1 1.8 0l7.7 6v9.6A1.8 1.8 0 0 1 18.8 21H15v-5.6a.9.9 0 0 0-.9-.9h-4.2a.9.9 0 0 0-.9.9V21H5.2a1.8 1.8 0 0 1-1.8-1.8z"
            fill={color}
          />
        );
      case 'search':
        return (
          <>
            <Circle {...p} cx={11} cy={11} r={6.5} />
            <Path {...p} d="m16 16 4 4" />
          </>
        );
      case 'star':
        return (
          <Path
            {...p}
            d="M12 3.8l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 16.1l-4.8 2.6.9-5.4-3.9-3.8 5.4-.8z"
          />
        );
      case 'star-filled':
        return (
          <Path
            d="M12 3.8l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 16.1l-4.8 2.6.9-5.4-3.9-3.8 5.4-.8z"
            fill={color}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
        );
      case 'settings':
        return (
          <>
            <Path {...p} d="M12 3.2 19.6 7.6v8.8L12 20.8l-7.6-4.4V7.6z" />
            <Circle {...p} cx={12} cy={12} r={2.8} />
          </>
        );
      case 'settings-filled':
        return (
          <>
            <Path d="M12 2.6 20.2 7.3v9.4L12 21.4l-8.2-4.7V7.3z" fill={color} />
            <Circle cx={12} cy={12} r={3} fill={holeColor} />
          </>
        );
      case 'chevron-left':
        return <Path {...p} d="M15 5l-7 7 7 7" />;
      case 'chevron-right':
        return <Path {...p} d="M9 5l7 7-7 7" />;
      case 'close':
        return <Path {...p} d="M6 6l12 12M18 6 6 18" />;
      case 'scan':
        return (
          <>
            <Path {...p} d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2" />
            <Path {...p} d="M7.5 12h9" />
          </>
        );
      case 'bell':
        return (
          <>
            <Path {...p} d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 1.5h-15z" />
            <Path {...p} d="M10 20.5a2.2 2.2 0 0 0 4 0" />
          </>
        );
      case 'lock':
        return (
          <>
            <Rect {...p} x={5} y={10.5} width={14} height={10} rx={2.2} />
            <Path {...p} d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5M12 14.5v2.2" />
          </>
        );
      case 'theme':
        return (
          <>
            <Circle {...p} cx={12} cy={12} r={8} />
            <Path d="M12 4a8 8 0 0 0 0 16z" fill={color} />
          </>
        );
      case 'package':
        return (
          <>
            <Rect {...p} x={4.5} y={4.5} width={15} height={15} rx={3} />
            <Path {...p} d="M12 15.5v-7M9 11l3-3 3 3" />
          </>
        );
      case 'cache':
        return (
          <>
            <Path {...p} d="M5 8h14l-1.2 11a1.6 1.6 0 0 1-1.6 1.5H7.8a1.6 1.6 0 0 1-1.6-1.5z" />
            <Path {...p} d="M4 8h16M9.5 5h5M10 12v5M14 12v5" />
          </>
        );
      case 'reset':
        return (
          <>
            <Path {...p} d="M4 7.5A1.5 1.5 0 0 1 5.5 6h4l1.8 2h7.2A1.5 1.5 0 0 1 20 9.5v8a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z" />
            <Path {...p} d="M9.5 13.5a2.5 2.5 0 1 0 1-2M10.4 10.2v1.6H12" />
          </>
        );
      case 'pin':
        return (
          <>
            <Path d="M12 2.5a7 7 0 0 0-7 7c0 5 7 12 7 12s7-7 7-12a7 7 0 0 0-7-7z" fill={color} />
            <Circle cx={12} cy={9.5} r={2.6} fill={holeColor} />
          </>
        );
      case 'clock':
        return (
          <>
            <Circle {...p} cx={12} cy={12} r={8} />
            <Path {...p} d="M12 7.5V12l3 2" />
          </>
        );
      case 'pause':
        return <Path d="M8.5 6.5v11M15.5 6.5v11" stroke={color} strokeWidth={2.6} strokeLinecap="round" />;
      case 'play':
        return <Path d="M8 5.8v12.4a.8.8 0 0 0 1.2.7l10-6.2a.8.8 0 0 0 0-1.4l-10-6.2A.8.8 0 0 0 8 5.8z" fill={color} />;
      case 'camera':
        return (
          <>
            <Path {...p} d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2.2l1.5-2h5.6l1.5 2h2.2A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z" />
            <Circle {...p} cx={12} cy={12.5} r={3.2} />
          </>
        );
      case 'check':
        return <Path {...p} d="M5 12.5l4.5 4.5L19 7.5" />;
      case 'bolt':
        return <Path {...p} d="M13.5 2.5 5 13.5h6l-1 8 8.5-11h-6z" />;
      case 'grid':
        return (
          <>
            <Rect {...p} x={4} y={4} width={6.8} height={6.8} rx={2} />
            <Rect {...p} x={13.2} y={4} width={6.8} height={6.8} rx={2} />
            <Rect {...p} x={4} y={13.2} width={6.8} height={6.8} rx={2} />
            <Rect {...p} x={13.2} y={13.2} width={6.8} height={6.8} rx={2} />
          </>
        );
      case 'broom':
        return (
          <>
            <Path {...p} d="M19.5 3.5 13 10" />
            <Path {...p} d="M10.5 8.5l5 5-1.2 1.2c-.6 2.8-2.5 5.3-5.3 6.3L4 16c1-2.8 3.5-4.7 6.3-5.3z" />
            <Path {...p} d="M7.5 18.3l2-2M9.8 19.8l1.5-1.6" />
          </>
        );
      case 'plus':
        return <Path {...p} d="M12 5v14M5 12h14" />;
      case 'apps':
        return (
          <>
            <Circle {...p} cx={7} cy={7} r={2.4} />
            <Circle {...p} cx={17} cy={7} r={2.4} />
            <Circle {...p} cx={7} cy={17} r={2.4} />
            <Circle {...p} cx={17} cy={17} r={2.4} />
          </>
        );
      case 'export':
        return (
          <>
            <Path {...p} d="M12 14V4M8 7.5 12 4l4 3.5" />
            <Path {...p} d="M5 12v6.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V12" />
          </>
        );
      case 'chart':
        return <Path {...p} d="M5 19V11M10 19V5M15 19v-6M20 19V9" />;
      case 'eye-off':
        return (
          <>
            <Path {...p} d="M3.5 12S6.5 6 12 6s8.5 6 8.5 6-3 6-8.5 6-8.5-6-8.5-6z" />
            <Path {...p} d="M4 4l16 16" />
          </>
        );
      case 'won':
        return (
          <>
            <Circle {...p} cx={12} cy={12} r={8} />
            <Path {...p} d="M8 9l1.6 6L12 9.5l2.4 5.5L16 9M7.5 12h9" strokeWidth={strokeWidth * 0.8} />
          </>
        );
      case 'car':
        return (
          <>
            <Path {...p} d="M5 16.5V12l1.8-4.6A1.6 1.6 0 0 1 8.3 6.3h7.4a1.6 1.6 0 0 1 1.5 1.1L19 12v4.5z" />
            <Path {...p} d="M5 12h14M7 16.5V19M17 16.5V19" />
            <Circle cx={8.3} cy={14.2} r={1} fill={color} />
            <Circle cx={15.7} cy={14.2} r={1} fill={color} />
          </>
        );
      case 'link':
        return (
          <>
            <Path {...p} d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
            <Path {...p} d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
          </>
        );
    }
  })();
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {body}
    </Svg>
  );
}
