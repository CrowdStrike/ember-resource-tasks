import { Resource } from 'ember-could-get-used-to-this';
import { action } from '@ember/object';
import { assert } from '@ember/debug';

import { taskFor } from 'ember-concurrency-ts';
import { task } from 'ember-concurrency-decorators';

import { consumeTag, waitFor, extractTaskData } from './utils';

import type { TaskGenerator } from 'ember-concurrency';
import type { PublicAPI } from './types';

interface Args<Return, TaskArgs extends any[]> {
  named: {
    args: TaskArgs;
    fn: (...args: TaskArgs) => Promise<Return>;
  };
}

/**
 * Whenever any args change *value*, the task will re run
 * All args must be stringish
 */
export class Task<Return, TaskArgs extends any[]> extends Resource<Args<Return, TaskArgs>> {
  /**
   * @public
   *
   * This is the return value of a resource
   */
  get value(): PublicAPI<Return> {
    let task = this._task.last;

    assert(`A task failed to start`, task);

    // entangle with the task's properties when it resolves
    consumeTag(task, 'value');
    consumeTag(task, 'isFinished');
    consumeTag(task, 'error');

    return { ...extractTaskData(task), retry: this._perform };
  }

  get _task() {
    return taskFor(this.__task);
  }

  @task
  @waitFor
  *__task(this: Task<Return, TaskArgs>): TaskGenerator<Return> {
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
    this._task.perform();
  }

  /**
   * Resource lifecycle methods
   */
  setup() {
    this._perform();
  }

  update() {
    this._perform();
  }

  teardown() {
    this._task.cancelAll();
  }
}
