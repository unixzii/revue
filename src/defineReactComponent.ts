import { ComponentPropsOptions, VNode, defineComponent, h } from 'vue';
import { ReactNode, createElement } from 'react';
import { createPortal, flushSync } from 'react-dom';
import { ReactComponent } from './react-types';
import mixins from './define-mixins';

export type DefineReactComponentOptions<P, Input> = {
    /** Mapper function to map the Vue props to React props. */
    propsMapper?: (input: Input) => P,
    /** Function to render the container V-DOM element. */
    containerRender?: () => VNode,
}

/**
 * Define a Vue component by bridging an existing React component.
 *
 * @param comp A React component constructor.
 * @param props Exposed props for the bridged component.
 * @param options Options object.
 * @returns The bridged component.
 */
export default function defineReactComponent<P extends object, Input>(
    comp: ReactComponent<P>,
    props: ComponentPropsOptions<Input>,
    options: DefineReactComponentOptions<P, Input>
) {
    const { propsMapper, containerRender } = options;

    const containerElement = (() => {
        if (containerRender) {
            return containerRender();
        }
        return h('div');
    })();

    return defineComponent({
        props,
        data() {
            return {
                nodeId: 0
            };
        },
        mixins: [mixins],
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
                const { $props, $slots } = this;

                const props = propsMapper ? 
                    propsMapper($props as unknown as Input) :
                    $props as unknown as P;

                // TODO: handle the Vue slot.
                const defaultSlot = $slots.default;
                const children = defaultSlot ? defaultSlot()[0].children : undefined;

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const instNode = createElement(comp, props, children as any);
                return createPortal(instNode, this.$el);
            }
        },
        render() {
            return containerElement;
        },
    });
}
