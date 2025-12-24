"use client";

import React from 'react';
import GalleryCarousel from './GalleryCarousel';

interface Props {
    intervalMs?: number;
    className?: string;
    images?: string[];
}

export default function TargetCarousel({ intervalMs = 7000, className = '', images = [] }: Props) {
    return <GalleryCarousel images={images} intervalMs={intervalMs} className={className} mode="ordered" />;
}
