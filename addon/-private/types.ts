import type { TaskInstance } from 'ember-concurrency';

export interface PublicAPI<Return> {
  retry: () => void;
  value: TaskInstance<Return>['value'];
  error: TaskInstance<Return>['error'];

  isRunning: TaskInstance<Return>['isRunning'];
  isCanceled: TaskInstance<Return>['isCanceled'];
  isError: TaskInstance<Return>['isError'];
  isFinished: TaskInstance<Return>['isFinished'];
  isSuccessful: TaskInstance<Return>['isSuccessful'];
  hasStarted: TaskInstance<Return>['hasStarted'];
}
