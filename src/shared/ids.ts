/** 충돌 가능성이 낮은 로컬 ID (암호학적 용도 아님) */
export function createId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
