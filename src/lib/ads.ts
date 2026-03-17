// Google AdSense 配置
// 申请到Publisher ID后填入

export const ADSENSE_CONFIG = {
  // 在这里填入你的 Google AdSense Publisher ID
  // 格式: ca-pub-xxxxxxxxxxxxxxxx
  publisherId: process.env.NEXT_PUBLIC_ADSENSE_ID || "",

  // 广告单元ID（申请后获得）
  adSlots: {
    horizontal: "", // 横幅广告
    sidebar: "",    // 侧边栏广告
    inContent: "",  // 文内广告
  },
};

// 检查是否配置了AdSense
export const isAdSenseConfigured = () => {
  return ADSENSE_CONFIG.publisherId.length > 0;
};