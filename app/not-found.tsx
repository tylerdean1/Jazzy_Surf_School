import Link from 'next/link';

export default function NotFound() {
    return (
        <main style={{ padding: 24 }}>
            <h1>Page not found</h1>
            <p>The page you’re looking for doesn’t exist.</p>
            <p>
                <Link href="/en">Go to home</Link>
            </p>
        </main>
    );
}
