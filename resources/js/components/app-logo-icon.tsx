import type { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon(
    props: ImgHTMLAttributes<HTMLImageElement>,
) {
    return (
        <img
            {...props}
            src="/images/brand/jbtechline-icon-v3.png"
            alt="JBTECHLINE"
            draggable={false}
        />
    );
}
