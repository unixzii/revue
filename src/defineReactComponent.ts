import { type ComponentPropsOptions, type VNode, Teleport, defineComponent, h } from 'vue';
import { type ReactNode, createElement } from 'react';
import { createPortal, flushSync } from 'react-dom';
import invariant from 'invariant';
import { type ReactComponent } from './react-types';
import {
    type IRevueContainer,
    ContainerKey,
    RevueReactContainer,
    createContainer
} from './react-container';
import { ReactExternalHost } from './react-external-host';
import { ensureRoot } from './react-root';

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
        return h('div', { style: 'display: contents;' });
    })();

    return defineComponent({
        props,
        data() {
            const thisContainer = createContainer();
            return {
                nodeId: 0,
                thisContainer,
                containerNodeProps: {
                    container: thisContainer
                },
                hostElement: null as (HTMLElement | null)
            };
        },
        inject: {
            container: {
                from: ContainerKey,
                default() {
                    return ensureRoot(this).container;
                }
            }
        },
        provide() {
            return {
                [ContainerKey]: this.thisContainer
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
            if (!nodeId) {
                return;
            }
            flushSync(() => {
                this.getContainer().detachFn(nodeId);
            });
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

                const containerNode = createElement(RevueReactContainer, {
                    ...this.containerNodeProps,
                    children: (attachedChildren) => {
                        const children = [...(attachedChildren || [])];
                        const reactChildren = this.getReactChildren();
                        if (reactChildren) {
                            children.push(reactChildren);
                        }
                        const instNode = createElement(
                            comp,
                            props,
                            // Some components could not have children, we
                            // should behave like it is used in React. 
                            children.length > 0 ? children : undefined
                        );
                        const wrapperNode = createPortal(instNode, this.getPortalElement());
                        return wrapperNode;
                    }
                });
                return containerNode;
            },
            getReactChildren(): ReactNode {
                const { $slots } = this;

                const defaultSlot = $slots.default;
                const children = defaultSlot ? defaultSlot() : undefined;
                
                if (!children) {
                    return null;
                }

                // Create a React component to host the child Vue components.
                return createElement(ReactExternalHost, {
                    key: 'host',
                    ref: (element) => {
                        // `element` can be null during the reconciliation 
                        // process, don't sync it to the Vue instance to
                        // avoid infinity updating.
                        if (!this.hostElement) {
                            this.hostElement = element;
                        }
                    }
                });
            },
            getContainer(): IRevueContainer {
                const container = this.container as unknown as IRevueContainer;
                invariant(!!container, '`container` should not be nullish');
                return container;
            },
            getPortalElement(): Element {
                // For Vue components which have multiple root nodes,
                // the value of `$el` will be a tracker node in the
                // DOM. Normally, we can get the first rendered node
                // by getting the next sibling node.
                return this.$el.nextSibling;
            }
        },
        render() {
            const { $slots, hostElement } = this;

            if (hostElement) {
                const defaultSlot = $slots.default;
                const children = defaultSlot ? defaultSlot() : false;

                return [
                    containerElement,
                    h(Teleport, { to: this.hostElement }, children)
                ];
            }

            return [containerElement, null];
        },
    });
}
