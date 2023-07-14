import { NextUIProvider } from '@nextui-org/react';
import { defineReactContextComponent } from '../src/index';

export default defineReactContextComponent(NextUIProvider, {
    theme: String
}, {});
