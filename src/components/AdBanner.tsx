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
    horizontal: "h-24",
    vertical: "h-64 w-full max-w-xs",
    square: "h-64 w-64",
  };

  useEffect(() => {
    // 如果已配置AdSense，尝试加载广告
    if (isAdSenseConfigured() && adRef.current) {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (error) {
        console.error("AdSense error:", error);
      }
    }
  }, []);

  // 如果已配置AdSense，显示真实广告
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
    <div className={`${sizes[type]} ${className} bg-gradient-to-r from-gray-100 to-gray-50 rounded-lg border border-gray-200 flex items-center justify-center`}>
      <div className="text-center">
        <p className="text-xs text-gray-400">广告位</p>
        <p className="text-xs text-gray-300 mt-1">联系: your@email.com</p>
      </div>
    </div>
  );
}