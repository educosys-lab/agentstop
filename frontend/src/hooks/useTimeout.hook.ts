import { useRef } from 'react';

export const useTimeout = () => {
    const timeoutRef = useRef<NodeJS.Timeout>();

    const timeout = (callback: () => void, time: number) => {
        clearTimeout(timeoutRef.current!);
        timeoutRef.current = setTimeout(() => {
            callback();
        }, time);
    };

    return timeout;
};
