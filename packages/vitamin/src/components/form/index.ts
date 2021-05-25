import type { App } from 'vue';

import FormComponent from './form.component.vue';
import { FormContext, FormItemContext, FormItemToken, FormToken } from './token';

FormComponent.install = (app: App) => {
  app.component(FormComponent.name, FormComponent);
};

export default FormComponent;

export {
  FormContext,
  FormItemContext,
  FormItemToken,
  FormToken
};
