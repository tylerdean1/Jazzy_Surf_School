'use client';

import Image from 'next/image';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface Props {
    intervalMs?: number;
    className?: string;
    images?: string[];
    /** height in px for the displayed image (optional) */
    height?: number;
    /** how the image should be fit into the box: 'cover' | 'contain' | 'fill' */
    objectFit?: 'cover' | 'contain' | 'fill';
    /** ordering mode: random (default) or ordered */
    mode?: 'random' | 'ordered';
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

function getRandomIndex(length: number, exclude: number) {
    if (length <= 1) return 0;
    let next = Math.floor(Math.random() * length);
    if (next === exclude) next = (next + 1) % length;
    return next;
}

export default function GalleryCarousel({ intervalMs = 8000, className = '', images: imagesProp, height, objectFit = 'cover', mode = 'random' }: Props) {
    const images = useMemo(() => imagesProp ?? defaultImages, [imagesProp]);
    const FADE_MS = 2000; // fade duration
    const [index, setIndex] = useState(0);
    const [visible, setVisible] = useState(true);
    const intervalRef = useRef<number | null>(null);
    const timeoutRef = useRef<number | null>(null);
    const indexRef = useRef<number>(0);

    const getNextIndex = useCallback(
        (current: number) => {
            if (images.length <= 1) return 0;
            if (mode === 'ordered') return (current + 1) % images.length;
            return getRandomIndex(images.length, current);
        },
        [images, mode]
    );

    // reset when image set changes
    useEffect(() => {
        setIndex(0);
        indexRef.current = 0;
        setVisible(true);
    }, [images]);

    useEffect(() => {
        // start initial interval
        intervalRef.current = window.setInterval(() => {
            // compute next randomly (avoid immediate repeat) and preload it
            const current = indexRef.current;
            const next = getNextIndex(current);
            const preload = document.createElement('img');
            preload.src = images[next];

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
    }, [intervalMs, images, getNextIndex]);

    // preload next image whenever index changes
    useEffect(() => {
        const next = (index + 1) % images.length;
        const preload = document.createElement('img');
        preload.src = images[next];
        indexRef.current = index;
    }, [index, images]);

    const heightClass = height === 160 ? 'gallery-carousel--h160' : '';
    const fitClass = objectFit === 'contain' ? 'gallery-image--contain' : objectFit === 'fill' ? 'gallery-image--fill' : '';
    const imageClassName = `gallery-image ${fitClass} ${visible ? 'visible' : ''}`.trim();

    return (
        <div className={`gallery-carousel ${heightClass} ${className}`.trim()}>
            <Image
                src={images[index]}
                alt={`Gallery ${index + 1}`}
                fill
                sizes="100vw"
                className={imageClassName}
                priority={false}
            />
        </div>
    );
}
