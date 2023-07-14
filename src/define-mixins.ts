import { ComponentOptionsMixin } from 'vue';
import { IRevueContainer, ContainerKey } from './react-container';
import { ensureRoot } from './react-root';

export default {
    inject: {
        container: {
            from: ContainerKey,
        }
    },
    methods: {
        getContainer(): IRevueContainer {
            const container = this.container as unknown as IRevueContainer;
            if (container) {
                return container;
            }
            return ensureRoot(this).container;
        },
    }
} satisfies ComponentOptionsMixin;