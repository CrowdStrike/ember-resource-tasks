import { waitFor as _waitFor } from '@ember/test-waiters';
import type { TaskInstance } from 'ember-concurrency';
import type { Resource } from 'ember-could-get-used-to-this';
import type { PublicAPI } from './types';

export { get as consumeTag } from '@ember/object';

export const waitFor = (_waitFor as unknown) as PropertyDecorator;

export function toCacheKey(...tokens: Array<string | string[]>) {
  return tokens.flat().join('-');
}

/**
 * No-op TypeScript helper for helping reshape the type of the Resource in TypeScript files
 */
export function valueFor<SomeResource extends Resource<LazyTrackedArgs>>(instance: SomeResource) {
  return (instance as unknown) as SomeResource['value'];
}

/**
 * NOTE: some properties on a task are not iterable, therefore not included in the spread
 *   This is probably fine, for the most part.
 *   This was more of an issue for ember-concurrency@v2 support though
 */
export function extractTaskData<Return>(
  task: TaskInstance<Return>,
): Omit<PublicAPI<Return>, 'retry'> {
  return {
    ...task,
    value: task.value,
    isRunning: task.isRunning,
  };
}
