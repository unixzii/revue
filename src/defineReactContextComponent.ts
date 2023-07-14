import { ComponentPropsOptions, defineComponent } from 'vue';
import { ReactNode, createElement } from 'react';
import { flushSync } from 'react-dom';
import { ReactComponent } from './react-types';
import { ContainerKey, RevueReactContainer, createContainer } from './react-container';
import mixins from './define-mixins';

export type DefineReactContextComponentOptions<P, Input> = {
    /** Mapper function to map the Vue props to React props. */
    propsMapper?: (input: Input) => P,
}

export default function defineReactContextComponent<P extends object, Input>(
    comp: ReactComponent<P>,
    props: ComponentPropsOptions<Input>,
    options: DefineReactContextComponentOptions<P, Input>
) {
    const { propsMapper } = options;

    return defineComponent({
        props,
        data() {
            const ownedContainer = createContainer();

            return {
                nodeId: 0,
                ownedContainer,
                containerProps: {
                    container: ownedContainer
                }
            };
        },
        mixins: [mixins],
        provide() {
            return {
                [ContainerKey]: this.ownedContainer
            };
        },
        mounted() {
            const node = this.getReactNode();

            flushSync(() => {
                this.nodeId = this.getContainer().attachFn(node);
            });
        },
        beforeUnmount() {
            const nodeId = this.nodeId;
            if (nodeId) {
                flushSync(() => {
                    this.getContainer().detachFn(nodeId);
                });
            }
        },
        updated() {
            const node = this.getReactNode();
            this.getContainer().updateFn(this.nodeId, node);
        },
        methods: {
            getReactNode(): ReactNode {
                const { $props } = this;
                const props = propsMapper ? 
                    propsMapper($props as unknown as Input) :
                    $props as unknown as P;
            
                const instNode = createElement(RevueReactContainer, {
                    ...this.containerProps,
                    contextProvider: createElement(comp, props)
                });
                return instNode;
            }
        },
        render() {
            const defaultSlot = this.$slots.default;
            return defaultSlot ? defaultSlot() : undefined;
        }
    });
}