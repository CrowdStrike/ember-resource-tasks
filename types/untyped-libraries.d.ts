type LazyTrackedArgs = {
  positional?: Array<unknown>;
  named?: Record<string, unknown>;
};

declare module 'ember-could-get-used-to-this' {
  type ConstructorFn<Args extends LazyTrackedArgs> = (() => Args) | (() => Args['positional']);

  export const use: PropertyDecorator;
  export class Resource<Args extends LazyTrackedArgs> {
    protected args: Args;

    // This is a lie, but makes the call site nice
    constructor(fn: ConstructorFn<Args>);

    get value(): unknown;
  }
}
