import { normalizeText } from '../search/query-normalizer';
import { ANDROID_PLATFORM_CATEGORY, CATEGORY_RULES } from './category-keywords.ko';
import type { AppCategoryId, CategorySuggestion } from './category.types';

export interface ClassifierInput {
  displayName: string;
  packageName?: string | null;
  platformCategory?: number | string | null;
  userCategoryId?: AppCategoryId | null;
}

/**
 * 분류 근거 순서: 사용자 지정 → 패키지명 규칙 → 앱 이름 규칙 → 플랫폼 카테고리 힌트 → 기타.
 * 패키지 규칙이 여러 개 맞으면 가장 긴(구체적인) 패턴을 택한다. 예: coupang.mobile.eats > coupang.mobile
 */
export function classifyApp(input: ClassifierInput): CategorySuggestion {
  if (input.userCategoryId) {
    return { categoryId: input.userCategoryId, confidence: 'high', reasons: ['사용자가 직접 지정'], source: 'user' };
  }

  const pkg = (input.packageName ?? '').toLowerCase();
  if (pkg) {
    let best: { id: AppCategoryId; pattern: string } | null = null;
    for (const rule of CATEGORY_RULES) {
      for (const pattern of rule.packagePatterns) {
        if (pkg.includes(pattern) && (!best || pattern.length > best.pattern.length)) {
          best = { id: rule.categoryId, pattern };
        }
      }
    }
    if (best) {
      return { categoryId: best.id, confidence: 'high', reasons: [`패키지명 규칙: ${best.pattern}`], source: 'local_rule' };
    }
  }

  const name = normalizeText(input.displayName);
  if (name) {
    let best: { id: AppCategoryId; keyword: string } | null = null;
    for (const rule of CATEGORY_RULES) {
      for (const keyword of rule.nameKeywords) {
        const k = normalizeText(keyword);
        if (k && name.includes(k) && (!best || k.length > best.keyword.length)) {
          best = { id: rule.categoryId, keyword: k };
        }
      }
    }
    if (best) {
      const confidence = best.keyword.length >= 3 ? 'medium' : 'low';
      return { categoryId: best.id, confidence, reasons: [`앱 이름 키워드: ${best.keyword}`], source: 'local_rule' };
    }
  }

  const platform =
    typeof input.platformCategory === 'number' ? ANDROID_PLATFORM_CATEGORY[input.platformCategory] : undefined;
  if (platform) {
    return { categoryId: platform, confidence: 'medium', reasons: ['Android 시스템 카테고리 힌트'], source: 'platform' };
  }

  return { categoryId: 'other', confidence: 'low', reasons: ['일치하는 규칙 없음'], source: 'fallback' };
}
