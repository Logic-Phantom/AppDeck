import type { AppDeckRepository } from './repository';
import { createWebRepository } from './web-repository';

let repo: AppDeckRepository | null = null;

/** 웹 프리뷰: expo-sqlite(wasm)를 번들하지 않고 localStorage 저장소를 쓴다. */
export function getRepository(): AppDeckRepository {
  if (!repo) repo = createWebRepository();
  return repo;
}

export * from './repository';
