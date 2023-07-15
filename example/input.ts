import { Input } from '@nextui-org/react';
import { defineReactComponent } from '../src/index';

export default defineReactComponent(Input, {
    label: String,
    type: String,
    value: String,
    onChange: Function
}, {});
