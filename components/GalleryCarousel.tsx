'use client';

import React, { useEffect, useRef, useState } from 'react';

interface Props {
    intervalMs?: number;
    className?: string;
    images?: string[];
    /** height in px for the displayed image (optional) */
    height?: number;
    /** how the image should be fit into the box: 'cover' | 'contain' | 'fill' */
    objectFit?: 'cover' | 'contain' | 'fill';
}

const defaultImages = [
    '/school_content/image_6483441%20(1).JPG',
    '/school_content/image_6483441%20(5).JPG',
    '/school_content/IMG_2505%202.JPG',
    '/school_content/IMG_2505.JPG',
    '/school_content/IMG_3627.JPG',
    '/school_content/IMG_3629.JPG',
    '/school_content/IMG_3633.JPG',
    '/school_content/IMG_3855.JPG',
    '/school_content/IMG_3856.JPG',
    '/school_content/IMG_3859.JPG',
    '/school_content/surfSchoolShot.png'
];

export default function GalleryCarousel({ intervalMs = 8000, className = '', images: imagesProp, height, objectFit = 'cover' }: Props) {
    const images = imagesProp ?? defaultImages;
    const FADE_MS = 2000; // fade duration
    const [index, setIndex] = useState(0);
    const [visible, setVisible] = useState(true);
    const intervalRef = useRef<number | null>(null);
    const timeoutRef = useRef<number | null>(null);
    const indexRef = useRef<number>(0);

    function getRandomIndex(length: number, exclude: number) {
        if (length <= 1) return 0;
        let next = Math.floor(Math.random() * length);
        // avoid immediate repeat
        if (next === exclude) {
            next = (next + 1) % length;
        }
        return next;
    }

    useEffect(() => {
        // start initial interval
        intervalRef.current = window.setInterval(() => {
            // compute next randomly (avoid immediate repeat) and preload it
            const current = indexRef.current;
            const next = getRandomIndex(images.length, current);
            const img = new Image();
            img.src = images[next];

            // start fade out
            setVisible(false);

            // after fade duration, swap image and fade in
            timeoutRef.current = window.setTimeout(() => {
                setIndex(next);
                setVisible(true);
            }, FADE_MS);
        }, intervalMs);

        return () => {
            if (intervalRef.current) window.clearInterval(intervalRef.current);
            if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
        };
    }, [intervalMs, images.length]);

    // preload next image whenever index changes
    useEffect(() => {
        const next = (index + 1) % images.length;
        const img = new Image();
        img.src = images[next];
        indexRef.current = index;
    }, [index, images.length]);

    const imgStyle: React.CSSProperties = {
        transitionDuration: `${FADE_MS}ms`,
        width: '100%',
        height: height ? `${height}px` : 'auto',
        objectFit: objectFit,
        display: 'block'
    };

    return (
        <div className={`gallery-carousel ${className}`} style={{ background: 'hsl(var(--background))', overflow: 'hidden' }}>
            <img
                src={images[index]}
                alt={`Gallery ${index + 1}`}
                className={`gallery-image ${visible ? 'visible' : ''}`}
                style={imgStyle}
                draggable={false}
            />
        </div>
    );
}
