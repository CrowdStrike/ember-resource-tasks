# How To Contribute

## Installation

*   `git clone <repository-url>`
*   `cd ember-resource-tasks`
*   `yarn install`

## Linting

* `yarn lint`
* `yarn lint:fix`

## Running tests

*   `ember test` – Runs the test suite on the current Ember version
*   `ember test --server` – Runs the test suite in "watch mode"
*   `ember try:each` – Runs the test suite against multiple Ember versions

### Running tests for an ember-try scenario:

```bash
# ember try:one <scenario-name> --- <cli command in the context of this scenario>
ember try:one ember-concurrency-2.x --- ember s
```
then visit http://localhost:4200/tests

## Running the dummy application

*   `ember serve`
*   Visit the dummy application at <http://localhost:4200>.

For more information on using ember-cli, visit <https://ember-cli.com/>.
