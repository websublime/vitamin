import { Icon } from '@iconify/vue';
import { defineComponent } from 'vue';

const IconComponent = defineComponent({
	components: { Icon },
	name: 'VuiIcon',
	props: {
		icon: {
			default: null,
			type: String
		}
	}
});

export default IconComponent;