import { useIntersection } from 'react-use';
import { forwardRef, RefObject, useEffect, useImperativeHandle, useRef } from 'react';

import { useAtBottom } from '@/hooks/useAtBottom.hook';

type AutoScrollToBottomElementProps = {
	trigger?: any;
	containerRef?: RefObject<HTMLDivElement>;
	stopAutoScroll?: boolean;
	paddingBottom?: string;
};

export const AutoScrollToBottomElement = forwardRef(
	({ trigger, containerRef, stopAutoScroll, paddingBottom = '50px' }: AutoScrollToBottomElementProps, ref) => {
		const endPointRef = useRef<HTMLDivElement>(null);
		const isAtBottom = useAtBottom({ containerRef });

		const endPointIntersection = useIntersection(endPointRef, { root: null, rootMargin: '0px', threshold: 1 });
		const isEndPointVisible = endPointIntersection?.isIntersecting;

		useImperativeHandle(ref, () => ({
			scrollToBottom,
		}));

		const scrollToBottom = () => {
			if (!endPointRef.current) return;
			endPointRef.current.scrollIntoView({ behavior: 'auto' });
		};

		useEffect(() => {
			if (isEndPointVisible || !endPointRef.current || stopAutoScroll || !isAtBottom) return;
			endPointRef.current.scrollIntoView({ behavior: 'smooth' });
		}, [stopAutoScroll, isAtBottom, trigger]);

		return <div ref={endPointRef} style={{ paddingBlockEnd: paddingBottom }} className="h-20"></div>;
	},
);

AutoScrollToBottomElement.displayName = 'AutoScrollToBottomElement';
