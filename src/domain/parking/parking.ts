/** 주차 위치 메모 — 사용자가 직접 입력한 값만 저장한다(위치 권한·외부 API 없음). */
export interface ParkingSession {
  id: string;
  /** 1줄: 층/구역, 2줄: 기둥 번호 등 */
  locationTitle: string;
  locationDetail: string;
  photoUris: string[];
  startedAt: string;
  /** 일시정지 누적(ms) */
  pausedTotalMs: number;
  pausedAt: string | null;
  /** 요금 규칙은 사용자가 입력한다. 입력 전이면 null → 요금 표시 안 함 */
  feeRule: ParkingFeeRule | null;
  endedAt: string | null;
}

export interface ParkingFeeRule {
  baseMinutes: number;
  baseFee: number;
  unitMinutes: number;
  unitFee: number;
}

export function elapsedMs(session: ParkingSession, nowMs: number): number {
  const end = session.endedAt ? Date.parse(session.endedAt) : nowMs;
  const pausing = session.pausedAt ? end - Date.parse(session.pausedAt) : 0;
  return Math.max(0, end - Date.parse(session.startedAt) - session.pausedTotalMs - pausing);
}

export function formatDuration(ms: number): string {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':');
}

/** 기본 시간까지 기본 요금, 이후 단위 시간마다 추가 요금(올림). */
export function estimateFee(rule: ParkingFeeRule, ms: number): number {
  const minutes = Math.ceil(ms / 60000);
  if (minutes <= rule.baseMinutes) return rule.baseFee;
  const extraUnits = Math.ceil((minutes - rule.baseMinutes) / Math.max(1, rule.unitMinutes));
  return rule.baseFee + extraUnits * rule.unitFee;
}

export function togglePause(session: ParkingSession, nowIso: string): ParkingSession {
  if (session.pausedAt) {
    const paused = Date.parse(nowIso) - Date.parse(session.pausedAt);
    return { ...session, pausedAt: null, pausedTotalMs: session.pausedTotalMs + Math.max(0, paused) };
  }
  return { ...session, pausedAt: nowIso };
}
