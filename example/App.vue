<template>
  <div>
    <h1>Counter: {{ counter }}</h1>
    <NextUIProvider>
      <div style="width: 300px; margin: 12px auto;">
        <Progress :value="Math.min(counter * 10, 100)" />
      </div>
      <div style="display: flex; gap: 8px; justify-content: center;">
        <Button :onClick="increase">Inc</Button>
        <Button :onClick="decrease" v-if="counter > 0">Dec</Button>
      </div>
    </NextUIProvider>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import NextUIProvider from './next-ui-provider';
import Button from './button';
import Progress from './progress';

const counter = ref(0);

function increase() {
    counter.value += 1;
}

function decrease() {
    counter.value -= 1;
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
