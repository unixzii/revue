import { FunctionComponent, ComponentClass } from 'react';

export type ReactComponent<P> = FunctionComponent<P> | ComponentClass<P>;
