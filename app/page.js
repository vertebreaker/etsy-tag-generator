import { Suspense } from 'react';
import EtsySeoSuite from '../components/EtsySeoSuite';

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-slate-400 text-sm">
          Loading Etsy SEO Suite...
        </div>
      }
    >
      <EtsySeoSuite />
    </Suspense>
  );
}
