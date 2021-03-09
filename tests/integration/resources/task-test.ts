import { use } from 'ember-could-get-used-to-this';
import { tracked } from '@glimmer/tracking';
import Component from '@glimmer/component';
import { setComponentTemplate } from '@ember/component';
import { hbs } from 'ember-cli-htmlbars';
import { action } from '@ember/object';
import { module, test } from 'qunit';
import { setupRenderingTest, setupTest } from 'ember-qunit';
import { setOwner } from '@ember/application';
import { settled, render } from '@ember/test-helpers';
import { waitFor } from '@ember/test-waiters';

import { Task, valueFor } from 'ember-resource-tasks';
import { consumeTag } from 'ember-resource-tasks/-private/utils';

import type ApplicationInstance from '@ember/application/instance';

module('Integration | Resource | Task', function () {
  module('in JS', function (hooks) {
    setupTest(hooks);

    class VanillaClass {
      @tracked left = 1;
      @tracked right = 0;

      @use
      data = valueFor(
        new Task(() => {
          return { named: { args: [this.left, this.right], fn: this.add } };
        }),
      );

      @action
      @waitFor
      add(left: number, right: number) {
        let result = left + right;

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

      assert.equal(subject.data.value, undefined);

      await settled();

      assert.equal(subject.data.value, 1);

      subject.left = 2;
      consumeTag(subject, 'data');
      await settled();

      assert.equal(subject.data.value, 2);

      subject.right = 3;
      consumeTag(subject, 'data');
      await settled();

      assert.equal(subject.data.value, 5);
    });
  });

  module('in Templates', function (hooks) {
    setupRenderingTest(hooks);

    test('it works', async function (assert) {
      class Foo extends Component<{ left: number; right: number }> {
        @use
        data = valueFor(
          new Task(() => {
            let { left, right } = this.args;

            return { named: { args: [left, right], fn: this.add } };
          }),
        );

        @action
        @waitFor
        add(left: number, right: number) {
          let result = left + right;

          return Promise.resolve(result);
        }
      }

      this.setProperties({ left: 1, right: 0 });

      this.owner.register(
        'component:foo',
        setComponentTemplate(hbs`The Result: {{this.data.value}}`, Foo),
      );

      await render(hbs`<Foo @left={{this.left}} @right={{this.right}} />`);

      assert.dom().hasText('The Result: 1');

      this.setProperties({ left: 2 });
      await settled();
      assert.dom().hasText('The Result: 2');

      this.setProperties({ right: 3 });
      await settled();
      assert.dom().hasText('The Result: 5');
    });
  });
});
