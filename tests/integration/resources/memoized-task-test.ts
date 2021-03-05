import { use } from 'ember-could-get-used-to-this';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setOwner } from '@ember/application';
import { settled } from '@ember/test-helpers';
import { waitFor } from '@ember/test-waiters';

import { MemoizedTask, valueFor } from 'ember-resource-tasks';
import { consumeTag } from 'ember-resource-tasks/-private/utils';

import type ApplicationInstance from '@ember/application/instance';

module('Integration | Resource | MemoizedTask', function (hooks) {
  setupTest(hooks);

  let invocations = 0;

  hooks.beforeEach(function () {
    invocations = 0;
  });

  class VanillaClass {
    @tracked left = 1;
    @tracked right = 0;

    @use
    data = valueFor(
      new MemoizedTask(() => {
        return {
          named: {
            cacheKey: 'data',
            args: [this.left, this.right],
            fn: this.add,
          },
        };
      }),
    );

    @use
    alt = valueFor(
      new MemoizedTask(() => {
        return {
          named: {
            cacheKey: 'alt',
            args: [this.left, this.right],
            fn: this.add,
          },
        };
      }),
    );

    @action
    @waitFor
    add(left: number, right: number) {
      let result = left + right;

      invocations++;

      return Promise.resolve(result);
    }
  }

  function create(owner: ApplicationInstance): VanillaClass {
    let instance = new VanillaClass();

    setOwner(instance, owner);

    return instance;
  }

  test('it works', async function (assert) {
    let subject = create(this.owner);
    let subject2 = create(this.owner);

    assert.equal(invocations, 0);
    assert.equal(subject.data.value, undefined);

    await settled();

    assert.equal(subject.data.value, 1);
    assert.equal(invocations, 1);

    subject.left = 2;
    consumeTag(subject, 'data');
    await settled();

    assert.equal(subject.data.value, 2);
    assert.equal(invocations, 2);

    subject2.left = subject.left;
    subject2.right = subject.right;

    consumeTag(subject2, 'data');
    await settled();

    assert.equal(subject2.data.value, 2, 'the cache bucket transfers to other instances');
    assert.equal(invocations, 2, 'value used is from cache and not recomputed');

    subject.right = 3;
    subject2.left = subject.left;
    subject2.right = subject.right;
    consumeTag(subject, 'data');
    await settled();

    assert.equal(subject.data.value, 5);
    assert.equal(invocations, 3);

    consumeTag(subject2, 'data');
    await settled();

    assert.equal(subject2.data.value, 5, 'the cache bucket transfers to other instances');
    assert.equal(invocations, 3, 'value used is from cache and not recomputed');
  });
});
