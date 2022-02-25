import { computed, inject, InjectionKey, provide, ref, WritableComputedRef } from 'vue';

interface LoadingContextType {
  active: WritableComputedRef<boolean>;
  setActive: () => void;
  setDeactive: () => void;
  // eslint-disable-next-line no-unused-vars
  setState(status: boolean): boolean;
  toggle: () => void;
}

export const LoadingContext = Symbol('LoadingContext') as InjectionKey<LoadingContextType>;

function useApi(init = false): LoadingContextType {
  const state = ref(init);

  const setActive = () => state.value = true;
  const setDeactive = () => state.value = false;
  const setState = (status: boolean) => state.value = status;
  const toggle = () => state.value ? setDeactive() : setActive();

  const api = {
    active: computed({
      get: () => state.value,
      set: (status) => state.value = status
    }),
    setActive,
    setDeactive,
    setState,
    toggle
  };

  return api;
}

export function useLoadingContext() {
  const context = inject(LoadingContext, useApi());

  return context;
}

export function useLoading(init = false) {
  const api = useApi(init);

  provide(LoadingContext, api);

  return api;
}
