/* eslint-disable @typescript-eslint/no-explicit-any */
import 'ember';
import '@ember/component';
import 'ember-concurrency-ts';

import './untyped-libraries';


import type { TemplateFactory } from 'ember-cli-htmlbars';

type TF = TemplateFactory;

declare module '@ember/component' {
  // TODO:  remove when this is actually a thing that exists?
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export function setComponentTemplate(template: TF, klass: any): any;
}
