export function formatTime(s: number) {
    const secs = (s % 60).toString().padStart(2, '0');
    const mins = Math.floor(s / 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
}