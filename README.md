# ember-resource-tasks

[![CI](https://github.com/CrowdStrike/ember-resource-tasks/actions/workflows/ci.yml/badge.svg)](https://github.com/CrowdStrike/ember-resource-tasks/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/ember-resource-tasks.svg)](https://badge.fury.io/js/ember-resource-tasks)

`ember-resource-tasks` is a collection of utility [Resources](https://github.com/pzuraq/ember-could-get-used-to-this#resources) for interacting with
async data.

## Installation

```bash
yarn add ember-resource-tasks
# or
npm install ember-resource-tasks
# or
ember install ember-resource-tasks
```

## Compatibility

- Ember.js v3.24 or above
- Node.js v12 or above
- ember-concurrency v1+ and v2+
- Embroider 0.47.2+

## Usage

### Reactive async data in vanilla JavaScript class

A common problem in Frontend JS is knowing when to re-invoke async
functions when args change. With Glimmer's auto-tracking and Resources,
async functions can automatically be kept up to date as the tracked args
to the function change.

For example, given this vanilla JavaScript class with two tracked properties:

```ts
import { tracked } from '@glimmer/tracking';
import { use } from 'ember-could-get-used-to-this';
import { action } from '@ember/object';
import { Task } from 'ember-resource-tasks';

class MyComponent {
  @use data = new Task(() => {
    return {
      named: {
        args: [this.argA, this.argB]
        fn: async (argA, argB) => {

        },
      }
    }
  });

  @tracked argA = 0;
  @tracked argB = 0;
}
```

Whenever changes to `argA` or `argB` occur, the
[ember-concurrency](http://ember-concurrency.com) task that wraps the passed
`fn` function will be re-performed.

Example invocation:

```ts
// Instantiate the Class
let service = new MyService();
// get owner from other container-aware context
setOwner(owner, service);

// task begins
service.data;

// some time later, the value is populated and can be rendered
// in a test, you may `await settled()` to get here
console.log(service.data.value);
```

### Usage from a component

```ts
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { use } from 'ember-could-get-used-to-this';
import { action } from '@ember/object';
import { Task } from 'ember-resource-tasks';

export default class MyComponent extends Component {
  @tracked query = 'Luke Skywalker';

  @use data = new Task(() => {
    return {
      named: {
        args: [this.query]
        fn: this.search,
      }
    }
  });

  @action
  search(query) { /* ... performs search on https://swapi.dev/ ... */ }

  // ... other code that debounces updates to the query property
}
```
```hbs
{{#if this.data.value}}
  Results: {{this.data.value}}
{{/if}}
```

When the template is rendered, the task will run and fetch initial data.
Any changes to the `query` will cause `search` to be re-invoked, and
`this.data.value` will be re-updated when `search` finishes.

### Caching

Sometimes you may want to cache Task results if there is a UI you're implementing
where multiple sets of `args` can be toggled back and forth and you'd like to
avoid re-hitting your API when you've already fetched the data.

There is the `MemoizedTask`, which handles the cache for you.
The usage is the exact same as `Task`, except the import name is different:

```ts
import { MemoizedTask } from 'ember-resource-task';
```

and there is an additional arg that it takes, `cacheKey`.
This `cacheKey` is used to categorize your data, so that multiple instances of
`MemoizedTask` may share data. The `cacheKey` is kind of like a "bucket" that the
cache for all fn/args pairs are grouped in to, so if you happen to have the same
args between two MemoizedTasks, but different `cacheKey`s, they will not overwrite
each other.

Example:

```ts
@use cached = new MemoizedTask(() => {
  return {
    named: {
      cacheKey: 'contacts', // or any string
      args: [this.someTrackedArg],
      fn: (someTrackedArgValue) => { ... }
    }
  }
});
```


### TypeScript

ember-resource-tasks provides a no-op type helper for helping TypeScript
become aware of the return value provided by `@use`.

```ts
import { valueFor } from 'ember-resource-tasks';

// ...

@use data = valueFor(new Task(() => [ /* ... */ ]));
```

the return type if both `@use Task` and `@use MemoizedTask` is a
[TaskInstance](https://ember-concurrency.com/api/TaskInstance.html)
with a `retry` method.

## Contributing

See the [Contributing](CONTRIBUTING.md) guide for details.

## License

This project is licensed under the [MIT License](LICENSE.md).
