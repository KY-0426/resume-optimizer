// Google AdSense 配置
export const ADSENSE_CONFIG = {
  publisherId: "ca-pub-7808063546241923",
  adSlots: {
    horizontal: "",
    sidebar: "",
    inContent: "",
  },
};

export const isAdSenseConfigured = () => {
  return ADSENSE_CONFIG.publisherId.length > 0;
};