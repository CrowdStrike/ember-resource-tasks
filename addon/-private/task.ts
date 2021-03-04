import { Resource } from 'ember-could-get-used-to-this';
import { action } from '@ember/object';
import { assert } from '@ember/debug';

import { task } from 'ember-concurrency-decorators';
import { taskFor } from 'ember-concurrency-ts';

import { consumeTag, waitFor } from './utils';

import type { TaskInstance } from 'ember-concurrency';

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
  private declare cacheBucket: Map<string, TaskInstance<Return>>;

  /**
   * @public
   *
   * This is the return value of a resource
   */
  get value() {
    let task = this._task.last;

    assert(`A task failed to start`, task);

    // entangle with the task's properties when it resolves
    consumeTag(task, 'value');
    consumeTag(task, 'isFinished');
    consumeTag(task, 'error');

    return { ...task, retry: this._perform };
  }

  private get fn() {
    return this.args.named.fn;
  }

  private get fnArgs() {
    return this.args.named.args;
  }

  @task
  @waitFor
  _task = taskFor(async () => {
    // Because async functions can set tracked data during rendering, (before an await is hit in execution)
    // we are presented with this assertion:
    //
    // Error: Assertion Failed: You attempted to update `someProperty` on `<SomeObject:ember1159>`,
    // but it had already been used previously in the same computation.
    // Attempting to update a value after using it in a computation can cause logical errors,
    // infinite revalidation bugs, and performance issues, and is not supported.
    await Promise.resolve();

    let result = await this.fn(...this.fnArgs);

    return result;
  });

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
