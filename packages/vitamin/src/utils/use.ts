import { getCurrentInstance } from 'vue';

export function useOptions() {
  const { proxy } = getCurrentInstance();
  // eslint-disable-next-line id-match
  const { $vitamin } = proxy;
  const { config } = $vitamin || {};
  const { getOptions } = config || {};

  return getOptions ? getOptions() : {};
}
