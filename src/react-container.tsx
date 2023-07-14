import { FC, ReactNode, ReactElement, Fragment, useEffect, useReducer, cloneElement } from 'react';
import { reactive } from 'vue';
import invariant from 'invariant';

export const ContainerKey = Symbol('ContainerKey');

export interface IRevueContainer {
    pendingNodeMap: Record<number, ReactNode>,
    pendingNodes: number[],
    nextNodeId: number,

    attachFn: ((node: ReactNode) => number),
    updateFn: ((nodeId: number, node: ReactNode) => void),
    detachFn: ((nodeId: number) => void);
}

export function createContainer() {
    function noop() {
        invariant(false, 'Container is not mounted');
    }

    const container = reactive({
        pendingNodeMap: {},
        pendingNodes: [],
        nextNodeId: 1,

        attachFn(node: ReactNode): number {
            const nodeId = this.nextNodeId;
            this.nextNodeId += 1;

            this.pendingNodeMap[nodeId] = node;
            this.pendingNodes.push(nodeId);
            return nodeId;
        },
        updateFn: noop,
        detachFn: noop,
    } satisfies IRevueContainer);
    return container;
}

type RevueReactContainerProps = {
    container: IRevueContainer,
    contextProvider?: ReactElement
};

export const RevueReactContainer: FC<RevueReactContainerProps> = (props) => {
    const { container, contextProvider } = props;

    type State = {
        nodeMap: Record<number, ReactNode>,
        nodes: number[],
        nextNodeId: number
    };
    type Action =
        { type: 'attach', node: ReactNode } |
        { type: 'update', nodeId: number, node: ReactNode } |
        { type: 'detach', nodeId: number };

    const [state, update] = useReducer((prev: State, action: Action) => {
        if (action.type === 'attach') {
            return {
                nodeMap: { ...prev.nodeMap, [prev.nextNodeId]: action.node },
                nodes: [...prev.nodes, prev.nextNodeId],
                nextNodeId: prev.nextNodeId + 1,
            };
        } else if (action.type === 'update') {
            const nodeMap = { ...prev.nodeMap };
            nodeMap[action.nodeId] = action.node;
            return {
                nodeMap,
                nodes: prev.nodes,
                nextNodeId: prev.nextNodeId,
            };
        } else if (action.type === 'detach') {
            const nodeMap = { ...prev.nodeMap };
            delete nodeMap[action.nodeId];
            return {
                nodeMap,
                nodes: prev.nodes.filter(i => i !== action.nodeId),
                nextNodeId: prev.nextNodeId,
            };
        } else {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            invariant(false, `Unknown action type: ${(action as any).type}`);
        }
    }, {
        nodeMap: container.pendingNodeMap,
        nodes: container.pendingNodes,
        nextNodeId: container.nextNodeId 
    });
    const { nodeMap, nodes, nextNodeId } = state;

    useEffect(() => {
        container.attachFn = (node: ReactNode) => {
            update({ type: 'attach', node });
            return nextNodeId;
        };
        container.updateFn = (nodeId: number, node: ReactNode) => {
            update({ type: 'update', nodeId, node });
        };
        container.detachFn = (nodeId: number) => {
            update({ type: 'detach', nodeId });
        };
    }, [container, update, nextNodeId]);

    const children = nodes.map(i => (
        <Fragment key={`node-${i}`}>{nodeMap[i]}</Fragment>
    ));

    if (!contextProvider) {
        return <>{children}</>;
    }

    return cloneElement(contextProvider, undefined, children);
};