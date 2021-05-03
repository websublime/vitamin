import type { InjectionKey } from 'vue';

import type { EventEmitter } from '@/utils/emitter';

export interface FormContext {
  formEmitter: EventEmitter;
  model?: Record<string, unknown>;
  disabled?: boolean;
  rules?: Record<string, unknown>
}

export interface FormItemContext {
  prop?: string;
  itemEmitter: EventEmitter;
}

export const FormToken: InjectionKey<FormContext> = Symbol('vuiFormKey');
export const FormItemToken: InjectionKey<FormItemContext> = Symbol('vuiFormItemKey');
