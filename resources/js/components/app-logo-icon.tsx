import { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon(props: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            src="/logo_academia.png"
            alt="Academia Linaje"
            {...props}
        />
    );
}
