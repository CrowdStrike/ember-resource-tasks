import { waitFor as _waitFor } from '@ember/test-waiters';
import type { Resource } from 'ember-could-get-used-to-this';

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
