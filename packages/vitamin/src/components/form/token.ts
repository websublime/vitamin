import type { InjectionKey } from 'vue';

export interface FormContext {
  disabled?: boolean;
  rules?: Record<string, unknown>
}

export const FormToken: InjectionKey<FormContext> = Symbol('vuiFormKey');
