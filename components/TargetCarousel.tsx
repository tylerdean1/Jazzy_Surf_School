"use client";

import React, { useEffect, useRef, useState } from 'react';

interface Props {
    intervalMs?: number;
    className?: string;
}

// deterministic ordered images: first prices.png then 1-5, repeating
const images = [
    '/target_audiance/prices.png',
    '/target_audiance/1.png',
    '/target_audiance/2.png',
    '/target_audiance/3.png',
    '/target_audiance/4.png',
    '/target_audiance/5.png'
];

export default function TargetCarousel({ intervalMs = 7000, className = '' }: Props) {
    const FADE_MS = 2000;
    const [index, setIndex] = useState(0);
    const [visible, setVisible] = useState(true);
    const intervalRef = useRef<number | null>(null);
    const timeoutRef = useRef<number | null>(null);

    useEffect(() => {
        intervalRef.current = window.setInterval(() => {
            // preload next
            const next = (index + 1) % images.length;
            const img = new Image();
            img.src = images[next];

            setVisible(false);
            timeoutRef.current = window.setTimeout(() => {
                setIndex(next);
                setVisible(true);
            }, FADE_MS);
        }, intervalMs);

        return () => {
            if (intervalRef.current) window.clearInterval(intervalRef.current);
            if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [index, intervalMs]);

    // preload following whenever index changes
    useEffect(() => {
        const next = (index + 1) % images.length;
        const img = new Image();
        img.src = images[next];
    }, [index]);

    return (
        <div className={`gallery-carousel ${className}`} style={{ background: 'hsl(var(--background))' }}>
            <img
                src={images[index]}
                alt={`Target ${index + 1}`}
                className={`gallery-image ${visible ? 'visible' : ''}`}
                style={{ transitionDuration: `${FADE_MS}ms` }}
                draggable={false}
            />
        </div>
    );
}
