import { forwardRef, ImgHTMLAttributes } from 'react';

export type ImageProps = ImgHTMLAttributes<HTMLImageElement> & { alt: string };

export const ImageElement = forwardRef<HTMLImageElement, ImageProps>(({ alt, ...props }, ref) => {
	return <img ref={ref} src={props.src} alt={alt} title={alt} loading="lazy" decoding="async" {...props} />;
});

ImageElement.displayName = 'ImageElement';
