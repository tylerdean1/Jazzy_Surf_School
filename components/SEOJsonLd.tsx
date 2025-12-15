'use client';

import React from 'react';

export default function SEOJsonLd() {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const imageUrl = origin ? `${origin}/hero_shot/hero_shot.png` : 'https://images.pexels.com/photos/416978/pexels-photo-416978.jpeg';

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: 'Jazmine Dean Surf School',
        image: imageUrl,
        address: {
            '@type': 'PostalAddress',
            addressLocality: 'Rincón',
            addressRegion: 'PR',
            addressCountry: 'US',
        },
        url: origin || 'https://your-vercel-domain.example',
        sameAs: [
            'https://www.youtube.com/@Onlyjazminee',
            'https://www.instagram.com/onlyjazmine/',
            'https://www.facebook.com/jazmine.dean.77',
            'https://www.facebook.com/unlimitedtimetravelers',
            'https://www.instagram.com/unlimitedtimetravelers/'
        ],
        priceRange: '$$',
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}
