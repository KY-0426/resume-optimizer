"use client";

import { useEffect, useRef } from "react";
import { ADSENSE_CONFIG, isAdSenseConfigured } from "@/lib/ads";

interface AdBannerProps {
  type?: "horizontal" | "vertical" | "square";
  slot?: string;
  className?: string;
}

export default function AdBanner({ type = "horizontal", slot, className = "" }: AdBannerProps) {
  const adRef = useRef<HTMLModElement>(null);

  const sizes = {
    horizontal: "h-20",
    vertical: "h-64 w-full max-w-xs",
    square: "h-48 w-full",
  };

  useEffect(() => {
    if (isAdSenseConfigured() && adRef.current) {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (error) {
        console.error("AdSense error:", error);
      }
    }
  }, []);

  // 已配置AdSense时显示真实广告
  if (isAdSenseConfigured()) {
    return (
      <ins
        ref={adRef}
        className={`adsbygoogle ${className}`}
        style={{ display: "block" }}
        data-ad-client={ADSENSE_CONFIG.publisherId}
        data-ad-slot={slot || ADSENSE_CONFIG.adSlots.horizontal}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    );
  }

  // 未配置时显示占位符
  return (
    <div className={`${sizes[type]} ${className} bg-muted/50 rounded-lg border flex items-center justify-center`}>
      <div className="text-center">
        <p className="text-xs text-muted-foreground">广告位</p>
      </div>
    </div>
  );
}