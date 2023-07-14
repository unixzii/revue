import { App, ComponentPublicInstance } from 'vue';
import { createElement } from 'react';
import { flushSync } from 'react-dom';
import { createRoot as reactCreateRoot } from 'react-dom/client';
import { IRevueContainer, RevueReactContainer, createContainer } from './react-container';

type RevueRoot = {
    container: IRevueContainer
};

type AppWithRevueRoot = App & { $$reactRoot?: RevueRoot };

function getRootFromApp(app: App): RevueRoot | undefined {
    return (app as unknown as AppWithRevueRoot).$$reactRoot;
}

function attachRootElement(): Element {
    const rootElem = document.createElement('div');
    rootElem.style.display = 'none';
    document.body.appendChild(rootElem);
    return rootElem;
}

export function ensureRoot(inst: ComponentPublicInstance): RevueRoot {
    const { app } = inst.$.appContext;
    let root = getRootFromApp(app);
    if (root) {
        return root;
    }

    const container = createContainer();
    const rootElem = attachRootElement();
    const reactRoot = reactCreateRoot(rootElem);
    flushSync(() => {
        reactRoot.render(createElement(
            RevueReactContainer,
            { container }
        ));
    });
    
    root = { container };
    (app as unknown as AppWithRevueRoot).$$reactRoot = root;

    return root;
}