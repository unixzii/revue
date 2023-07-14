# revue

A library for bridging React components to Vue.

> This library is currently a PoC, only for demostrating the possibility of using React components in Vue.

## Features

* Updates of React components are fully driven by reactivity.
* Single React root per Vue app, providing more friendly devtools experience.
* The context of a React component are synchronized within the Vue component tree. 

## Getting Started

First, define the bridge component (e.g. in `button.ts`):

```typescript
import { h } from 'vue';
import { Button } from '@nextui-org/react';
import { defineReactComponent } from 'revue';

export default defineReactComponent(Button, {
    onClick: Function,
}, {
    containerRender() {
        return h('div', {
            style: { display: 'inline-block' }
        });
    },
});
```

Since every React component must be mounted on a DOM element, you can customize the host element by specifying `containerRender`.

Then you can use your favorite React component in any Vue component:

```vue
<template>
  <div>
    <Button :onClick="sayHello">Say Hello</Button>
  </div>
</template>

<script lang="ts" setup>
import Button from './button';  // Import the bridged component.

function sayHello() {
    console.log('Hello, world!');
}
</script>
```

## Example

Clone the repository, and run the following command to serve the example locally:

```bash
npm install
npm run dev
```

## License

MIT