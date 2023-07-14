import { h } from 'vue';
import { Button } from '@nextui-org/react';
import { defineReactComponent } from '../src/index';

export default defineReactComponent(Button, {
    onClick: Function,
}, {
    containerRender() {
        return h('div', {
            style: { display: 'inline-block' }
        });
    },
});
