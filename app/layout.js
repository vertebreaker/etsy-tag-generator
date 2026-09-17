import './globals.css';

export const metadata = {
  title: 'Free Etsy SEO Listing & Tag Generator (No Sign-Up)',
  description: 'Generate high-ranking Etsy titles, 13 compliant SEO tags, and listing copy instantly for free.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 min-h-screen antialiased">{children}</body>
    </html>
  );
}
