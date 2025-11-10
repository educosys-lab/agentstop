import { useState, useEffect, RefObject } from 'react';

export function useAtBottom(props: { containerRef?: RefObject<HTMLElement>; offset?: number }): boolean {
	const { containerRef, offset = 0 } = props;

	const [isAtBottom, setIsAtBottom] = useState(false);

	useEffect(() => {
		const element = containerRef?.current || window;

		const handleScroll = () => {
			let hasReachedBottom = false;

			if (containerRef?.current) {
				const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
				hasReachedBottom = scrollTop + clientHeight >= scrollHeight - offset;
			} else {
				hasReachedBottom =
					window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - offset;
			}

			setIsAtBottom(hasReachedBottom);
		};

		handleScroll();
		element.addEventListener('scroll', handleScroll, { passive: true });
		return () => {
			element.removeEventListener('scroll', handleScroll);
		};
	}, [containerRef, offset]);

	return isAtBottom;
}
