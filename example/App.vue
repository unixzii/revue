<template>
    <NextUIProvider>
        <div style="width: 480px; margin: 0 auto; padding: 64px 0;">
        <h1 style="text-align: center;">Timer</h1>
        <div style="display: flex; flex-direction: column; gap: 12px;">
            <TimerComponent v-for="timer in timers" :key="timer.id" :timer="timer" />
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 32px;">
            <Input label="Duration (s)" type="number" :value="duration" :onChange="onDurationChange" />
            <Button :onClick="startTimer">Start</Button>
        </div>
    </div>
  </NextUIProvider>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue';
import TimerComponent from './Timer.vue';
import NextUIProvider from './next-ui-provider';
import Button from './button';
import Input from './input';
import { formatTime } from './utils';
import { type Timer } from './timer';

const duration = ref(0);
const timers: Timer[] = reactive([]);
let id = 0;

function onDurationChange(e: InputEvent) {
    duration.value = +((e.target as HTMLInputElement)?.value);
}

function startTimer() {
    const curId = ++id;
    const durationValue = duration.value;
    timers.push({
        id: curId,
        title: formatTime(durationValue),
        remain: durationValue,
        total: durationValue
    });
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>
