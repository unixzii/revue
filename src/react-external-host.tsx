import { type ForwardedRef, forwardRef } from 'react';

export const ReactExternalHost = forwardRef(
    (_props, ref: ForwardedRef<HTMLDivElement>) => {
        return <div ref={ref} style={{ display: 'contents' }} />;
    }
);