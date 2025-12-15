"use client";

import React from 'react';
import GalleryCarousel from './GalleryCarousel';

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
    return <GalleryCarousel images={images} intervalMs={intervalMs} className={className} mode="ordered" />;
}
