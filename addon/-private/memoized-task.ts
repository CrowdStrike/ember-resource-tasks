import { Resource } from 'ember-could-get-used-to-this';
import { action } from '@ember/object';
import { assert } from '@ember/debug';
import { getOwner } from '@ember/application';

import { taskFor } from 'ember-concurrency-ts';
import { task } from 'ember-concurrency-decorators';
import { consumeTag, toCacheKey, waitFor } from './utils';

import type { TaskInstance, TaskGenerator } from 'ember-concurrency';

type CacheableArgs = Array<string | string[]>;

interface Args<Return, TaskArgs extends CacheableArgs> {
  named: {
    cacheKey: string;
    args: TaskArgs;
    fn: (...args: TaskArgs) => Promise<Return>;
  };
}

const CACHE = 'service:ember-resource-tasks/-private/do-not-use/arg-cache';

/**
 * Whenever any args change *value*, the task will re run
 * All args must be stringish
 */
export class MemoizedTask<Return, TaskArgs extends CacheableArgs> extends Resource<
  Args<Return, TaskArgs>
> {
  private declare cacheBucket: Map<string, TaskInstance<Return>>;

  /**
   * @public
   *
   * This is the return value of a resource
   */
  get value() {
    let task = this.cacheBucket.get(this.cacheKey);

    assert(`A task failed to start`, task);

    // entangle with the task's properties when it resolves
    consumeTag(task, 'value');
    consumeTag(task, 'isFinished');
    consumeTag(task, 'error');

    // NOTE: some properties on a task are not iterable, therefore not included in the spread
    //       This is probably fine, for the most part.
    return { ...task, isRunning: task.isRunning, retry: this._perform };
  }

  private get cacheKey() {
    return toCacheKey(...this.args.named.args);
  }

  private get needsUpdate() {
    return !this.cacheBucket.has(this.cacheKey);
  }

  get _task() {
    return taskFor(this.__task);
  }

  @task
  @waitFor
  *__task(this: MemoizedTask<Return, TaskArgs>): TaskGenerator<Return> {
    let { fn, args } = this.args.named;

    // Because async functions can set tracked data during rendering, (before an await is hit in execution)
    // we are presented with this assertion:
    //
    // Error: Assertion Failed: You attempted to update `someProperty` on `<SomeObject:ember1159>`,
    // but it had already been used previously in the same computation.
    // Attempting to update a value after using it in a computation can cause logical errors,
    // infinite revalidation bugs, and performance issues, and is not supported.
    yield Promise.resolve();

    let result = yield fn(...args);

    return result;
  }

  @action
  _perform() {
    let task = this._task.perform();

    this.cacheBucket.set(this.cacheKey, task);
  }

  /**
   * Resource lifecycle methods
   */
  setup() {
    this.cacheBucket = getOwner(this).lookup(CACHE).getEnsuringBucket(this.args.named.cacheKey);

    if (this.needsUpdate) {
      this._perform();
    }
  }

  update() {
    if (this.needsUpdate) {
      this._perform();
    }
  }

  teardown() {
    this._task.cancelAll();
  }
}
