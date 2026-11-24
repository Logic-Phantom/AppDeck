import type { AppEntry } from '../apps/app.types';
import { effectiveCategory } from '../apps/app.types';
import type { AppCategoryId } from '../categories/category.types';
import { getCategory } from '../categories/category.catalog';
import { matchIntent, type PurposeIntent } from './intent-matcher';
import { isChoseongQuery, normalizeText, stripParticles, toChoseong } from './query-normalizer';

export type MatchKind = 'exact_name' | 'name' | 'alias' | 'choseong' | 'package' | 'category' | 'intent';

export interface SearchHit {
  app: AppEntry;
  kind: MatchKind;
  score: number;
}

export interface IntentQueryResult {
  normalizedQuery: string;
  intent: PurposeIntent | null;
  matchedCategories: AppCategoryId[];
  hits: SearchHit[];
  reason: string;
  /** 의미가 넓어 여러 카테고리 탭으로 나눠 보여 줘야 하는지 */
  needsDisambiguation: boolean;
}

export interface SearchOptions {
  includePackageName?: boolean;
}

const KIND_SCORE: Record<MatchKind, number> = {
  exact_name: 1000,
  name: 800,
  alias: 700,
  choseong: 600,
  package: 400,
  category: 300,
  intent: 200,
};

/**
 * 검색 순서: 정확한 앱 이름 → 이름 부분 일치 → 사용자 별칭 → 초성 → 패키지명(옵션) → 카테고리명 → 목적 키워드.
 * 순수 함수이며 같은 입력에 같은 결과를 낸다. 전달받은 앱(실제 설치/등록된 앱)만 결과에 포함한다.
 */
export function searchApps(apps: readonly AppEntry[], query: string, options: SearchOptions = {}): IntentQueryResult {
  const q = normalizeText(query);
  const intent = matchIntent(query);
  const matchedCategories = intent?.categories ?? [];
  if (!q) {
    return { normalizedQuery: q, intent: null, matchedCategories: [], hits: [], reason: 'empty', needsDisambiguation: false };
  }
  const stripped = stripParticles(query);
  const choseongQuery = isChoseongQuery(query);
  const hits: SearchHit[] = [];

  for (const app of apps) {
    const name = normalizeText(app.displayName);
    const cat = effectiveCategory(app);
    let kind: MatchKind | null = null;
    if (name === q) kind = 'exact_name';
    else if (name.includes(q) || (stripped.length >= 2 && name.includes(stripped))) kind = 'name';
    else if (app.aliases.some((a) => normalizeText(a).includes(q))) kind = 'alias';
    else if (choseongQuery && toChoseong(app.displayName).includes(q)) kind = 'choseong';
    else if (options.includePackageName && app.packageName && app.packageName.toLowerCase().includes(q)) kind = 'package';
    else if (normalizeText(getCategory(cat).name).includes(q) || normalizeText(getCategory(cat).shortName) === q) kind = 'category';
    else if (matchedCategories.includes(cat)) kind = 'intent';
    if (!kind) continue;
    // 같은 종류 안에서는 목적의 주 카테고리 → 즐겨찾기 → 앱덱 실행 횟수 → 이름 순
    const primaryBonus = matchedCategories[0] === cat ? 50 : 0;
    const score = KIND_SCORE[kind] + primaryBonus + (app.isFavorite ? 20 : 0) + Math.min(app.appDeckLaunchCount, 19);
    hits.push({ app, kind, score });
  }

  hits.sort((a, b) => b.score - a.score || a.app.displayName.localeCompare(b.app.displayName, 'ko'));
  const reason = intent ? `목적 "${intent.label}"과 관련된 카테고리` : hits.length ? '앱 이름·별칭 일치' : '일치하는 앱 없음';
  return {
    normalizedQuery: q,
    intent,
    matchedCategories,
    hits,
    reason,
    needsDisambiguation: matchedCategories.length > 1,
  };
}
