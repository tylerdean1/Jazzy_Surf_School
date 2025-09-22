'use client';

import React from 'react';

export default function SEOJsonLd() {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: 'Jazmine Dean Surf School',
        image: 'https://images.pexels.com/photos/416978/pexels-photo-416978.jpeg',
        address: {
            '@type': 'PostalAddress',
            addressLocality: 'Rincón',
            addressRegion: 'PR',
            addressCountry: 'US',
        },
        url: 'https://your-vercel-domain.example',
        sameAs: [
            'https://www.instagram.com/',
            'https://www.facebook.com/',
            'https://www.youtube.com/',
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
