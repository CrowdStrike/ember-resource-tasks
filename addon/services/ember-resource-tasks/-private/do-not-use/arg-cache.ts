import Service from '@ember/service';

/**
 * This service is basically just Map<string, Map<string, any>>
 *  - this cache exists as a service so it can be cleaned up during tests
 *  - used by MemoizedTask where args must be stringifyable
 *    as they are joined together to use as a key to the map.
 *    at some point, we may want a dynamically deep Map
 *    so that the stringifyability doesn't matter, and then
 *    any args could be passed to the MemoizedTask fnArgs
 *
 */
export default class ArgCache extends Service {
  private _cache = new Map<string, Map<string, unknown>>();

  getEnsuringBucket(cacheName: string) {
    let bucket = this._cache.get(cacheName);

    if (!bucket) {
      bucket = new Map();
      this._cache.set(cacheName, bucket);
    }

    return bucket;
  }
}
