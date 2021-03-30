import { IconifyJSON } from '@iconify/vue';

declare module '@vue/runtime-core' {
  interface VitaminConfig {
    iconifyPack?: IconifyJSON,
    iconifyPrefix?: string,
    useHtml5Validation?: boolean
  }

  interface Vitamin {
    config: {
      getOptions: () => VitaminConfig,
      setOptions: (option: VitaminConfig) => void
    }
  }

  interface ComponentCustomProperties {
    $vitamin: Vitamin;
  }
}
