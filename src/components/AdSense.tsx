import { useEffect } from 'react';

export default function AdSense({ className, adSlot }: { className?: string; adSlot?: string }) {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      // swallow errors during SSR or if script not loaded yet
    }
  }, []);

  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-8489892778826982"
        {...(adSlot ? { 'data-ad-slot': adSlot } : {})}
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
}
