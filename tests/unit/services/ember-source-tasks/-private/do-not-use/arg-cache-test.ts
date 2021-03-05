import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

import type ArgCache from 'ember-resource-tasks/services/ember-resource-tasks/-private/do-not-use/arg-cache';

module('Unit | Service | ember-source-tasks/-private/do-not-use/arg-cache', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let service = this.owner.lookup(
      'service:ember-resource-tasks/-private/do-not-use/arg-cache',
    ) as ArgCache;

    assert.ok(service);
    assert.ok(service.getEnsuringBucket('this could be anything'));
    assert.ok(service.getEnsuringBucket('this could be anything') instanceof Map);
  });
});
