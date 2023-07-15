<!-- eslint-disable vue/multi-word-component-names -->
<template>
    <Collapse :title="props.timer.title" bordered>
        <p>{{ formatTime(props.timer.remain) }}</p>
        <Progress :value="progress" />
    </Collapse>
</template>

<script lang="ts" setup>
import { computed, onMounted, onBeforeUnmount } from 'vue';
import Collapse from './collapse';
import Progress from './progress';
import { formatTime } from './utils';
import { type Timer } from './timer';

const props = defineProps<{
    timer: Timer
}>();

const progress = computed(() => {
    const timer = props.timer;
    return (1 - timer.remain / timer.total) * 100;
});

// Note: this timer implementation is just for demo.
let timerId: number | undefined;
onMounted(() => {
    timerId = setInterval(() => {
        const timer = props.timer;
        if (timer.remain > 0) {
            timer.remain -= 1;
        }
    }, 1000);
});
onBeforeUnmount(() => {
    if (timerId) {
        clearInterval(timerId);
    }
});
</script>