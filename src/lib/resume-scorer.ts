// ATS简历评分系统

interface ScoreResult {
  totalScore: number;
  breakdown: {
    keywords: { score: number; max: number; details: string[] };
    format: { score: number; max: number; details: string[] };
    quantification: { score: number; max: number; details: string[] };
    actionVerbs: { score: number; max: number; details: string[] };
    sections: { score: number; max: number; details: string[] };
    length: { score: number; max: number; details: string[] };
  };
  suggestions: string[];
}

// 行业关键词库
const INDUSTRY_KEYWORDS: Record<string, string[]> = {
  tech: [
    "React", "Vue", "Angular", "JavaScript", "TypeScript", "Python", "Java", "Go",
    "Node.js", "SQL", "MongoDB", "Redis", "Docker", "Kubernetes", "AWS", "CI/CD",
    "Git", "RESTful", "API", "微服务", "前端", "后端", "全栈", "架构", "性能优化",
    "敏捷开发", "Scrum", "测试", "自动化", "运维", "DevOps", "云原生"
  ],
  product: [
    "产品规划", "用户研究", "需求分析", "原型设计", "Axure", "Figma",
    "数据分析", "用户增长", "竞品分析", "PRD", "MVP", "用户体验", "A/B测试",
    "产品迭代", "商业模式", "市场调研", "用户画像", "产品路线图"
  ],
  marketing: [
    "内容营销", "SEO", "SEM", "社媒运营", "品牌推广", "用户增长", "转化率",
    "ROI", "流量", "曝光量", "粉丝运营", "活动策划", "广告投放", "数据分析",
    "私域流量", "社群运营", "KOL合作"
  ],
  operations: [
    "运营策略", "用户运营", "内容运营", "活动运营", "社群运营", "数据分析",
    "用户增长", "留存率", "活跃度", "转化漏斗", "用户生命周期", "会员运营",
    "新媒体运营", "渠道运营"
  ],
  finance: [
    "财务分析", "预算管理", "成本控制", "风险管理", "投资分析", "估值模型",
    "财务报表", "现金流", "审计", "税务筹划", "合规", "尽职调查", "并购",
    "IPO", "基金管理"
  ],
  hr: [
    "招聘", "培训", "绩效管理", "薪酬福利", "员工关系", "组织发展", "人才发展",
    "HRBP", "HRSSC", "企业文化", "人才盘点", "校园招聘", "猎头", "雇主品牌"
  ],
  general: [
    "团队管理", "项目管理", "跨部门协作", "沟通协调", "问题解决", "领导力",
    "执行力", "创新", "学习能力", "责任心", "抗压能力", "目标导向"
  ]
};

// 行为动词库
const ACTION_VERBS = [
  "主导", "负责", "推动", "实现", "优化", "设计", "开发", "构建", "创建",
  "管理", "领导", "协调", "策划", "执行", "完成", "提升", "降低", "节省",
  "增加", "改善", "重构", "部署", "维护", "分析", "研究", "制定", "建立",
  "组织", "培训", "指导", "监督", "审核", "评估", "谈判", "拓展", "开拓",
  "运营", "推广", "策划", "实施", "落实", "达成", "突破", "创新", "改革"
];

// 必要简历板块
const REQUIRED_SECTIONS = [
  { patterns: [/工作经历|工作经验|职业经历|工作背景/i, /employment|work experience|professional experience/i], name: "工作经历" },
  { patterns: [/教育背景|教育经历|学历|毕业院校/i, /education|academic background/i], name: "教育背景" },
  { patterns: [/项目经验|项目经历|项目描述/i, /project|projects/i], name: "项目经验" },
  { patterns: [/技能|专业技能|技术栈|能力|专长/i, /skills|technical skills|competencies/i], name: "技能" },
  { patterns: [/联系方式|电话|邮箱|手机/i, /contact|phone|email/i], name: "联系方式" },
];

export function scoreResume(resume: string, jobDescription?: string): ScoreResult {
  const breakdown = {
    keywords: analyzeKeywords(resume, jobDescription),
    format: analyzeFormat(resume),
    quantification: analyzeQuantification(resume),
    actionVerbs: analyzeActionVerbs(resume),
    sections: analyzeSections(resume),
    length: analyzeLength(resume),
  };

  const totalScore = Object.values(breakdown).reduce((sum, item) => sum + item.score, 0);

  const suggestions = generateSuggestions(breakdown, jobDescription);

  return {
    totalScore,
    breakdown,
    suggestions,
  };
}

function analyzeKeywords(resume: string, jobDescription?: string): { score: number; max: number; details: string[] } {
  const details: string[] = [];
  let score = 0;
  const max = 20;

  // 获取所有关键词
  const allKeywords = Object.values(INDUSTRY_KEYWORDS).flat();
  const resumeLower = resume.toLowerCase();

  // 统计匹配的关键词
  const matchedKeywords = allKeywords.filter(keyword =>
    resumeLower.includes(keyword.toLowerCase())
  );

  // 基础分：根据匹配数量
  const keywordScore = Math.min(matchedKeywords.length * 2, 12);
  score += keywordScore;

  if (matchedKeywords.length >= 8) {
    details.push(`✓ 包含 ${matchedKeywords.length} 个行业关键词`);
  } else if (matchedKeywords.length >= 4) {
    details.push(`△ 包含 ${matchedKeywords.length} 个关键词，建议增加更多专业术语`);
  } else {
    details.push(`✗ 关键词不足（仅 ${matchedKeywords.length} 个），建议添加更多专业技能词汇`);
  }

  // 如果有JD，分析JD关键词匹配度
  if (jobDescription) {
    const jdKeywords = extractKeywordsFromJD(jobDescription);
    const jdMatched = jdKeywords.filter(keyword =>
      resumeLower.includes(keyword.toLowerCase())
    );

    if (jdKeywords.length > 0) {
      const matchRate = jdMatched.length / jdKeywords.length;
      const jdScore = Math.round(matchRate * 8);
      score += jdScore;

      if (matchRate >= 0.6) {
        details.push(`✓ JD关键词匹配度 ${Math.round(matchRate * 100)}%`);
      } else if (matchRate >= 0.3) {
        details.push(`△ JD关键词匹配度 ${Math.round(matchRate * 100)}%，建议补充相关词汇`);
      } else {
        details.push(`✗ JD关键词匹配度低（${Math.round(matchRate * 100)}%），需要针对性优化`);
      }
    }
  } else {
    score += 4; // 没有JD时给予基础分
  }

  return { score: Math.min(score, max), max, details };
}

function extractKeywordsFromJD(jd: string): string[] {
  // 提取JD中的关键词
  const keywords: string[] = [];
  const jdLower = jd.toLowerCase();

  // 检查所有行业关键词
  Object.values(INDUSTRY_KEYWORDS).flat().forEach(keyword => {
    if (jdLower.includes(keyword.toLowerCase())) {
      keywords.push(keyword);
    }
  });

  // 提取要求年限
  const yearMatch = jd.match(/(\d+)\s*[年以上]/);
  if (yearMatch) {
    keywords.push(`${yearMatch[1]}年经验`);
  }

  return [...new Set(keywords)];
}

function analyzeFormat(resume: string): { score: number; max: number; details: string[] } {
  const details: string[] = [];
  let score = 0;
  const max = 15;

  // 检查是否有清晰的结构
  const hasBullets = /^[•\-\*·]/m.test(resume) || /^\s*[-•]\s/m.test(resume);
  if (hasBullets) {
    score += 5;
    details.push("✓ 使用了列表格式，结构清晰");
  } else {
    details.push("△ 建议使用项目符号列表展示经历");
  }

  // 检查日期格式
  const datePatterns = [
    /\d{4}[.\/年]\s*\d{1,2}[.\/月]?/,
    /\d{4}\s*[-~至]\s*\d{4}/,
    /\d{2}\.\d{2}\.\d{4}/,
  ];
  const hasDates = datePatterns.some(pattern => pattern.test(resume));
  if (hasDates) {
    score += 5;
    details.push("✓ 包含清晰的时间线");
  } else {
    details.push("△ 建议添加工作/项目时间段");
  }

  // 检查段落分隔
  const paragraphs = resume.split(/\n\s*\n/);
  if (paragraphs.length >= 3) {
    score += 5;
    details.push("✓ 内容分段合理");
  } else {
    details.push("△ 建议分段展示不同内容模块");
  }

  return { score, max, details };
}

function analyzeQuantification(resume: string): { score: number; max: number; details: string[] } {
  const details: string[] = [];
  let score = 0;
  const max = 20;

  // 匹配量化成果
  const quantPatterns = [
    /(\d+(?:\.\d+)?)\s*[%％百分比]/g,  // 百分比
    /(\d+(?:\.\d+)?)\s*[万千亿]/g,       // 金额
    /(\d+)\s*(人|个|次|件|项目|用户|客户)/g, // 数量
    /提升|增长|提高|节省|降低|减少|增加.*?(\d+)/g, // 描述性量化
  ];

  const matches: string[] = [];
  quantPatterns.forEach(pattern => {
    const found = resume.match(pattern);
    if (found) matches.push(...found);
  });

  if (matches.length >= 5) {
    score = 20;
    details.push(`✓ 包含 ${matches.length} 处量化成果，数据丰富`);
  } else if (matches.length >= 3) {
    score = 15;
    details.push(`✓ 包含 ${matches.length} 处量化成果`);
  } else if (matches.length >= 1) {
    score = 8;
    details.push(`△ 量化数据较少（${matches.length} 处），建议增加更多成果数据`);
  } else {
    score = 0;
    details.push("✗ 缺少量化成果，建议添加具体数字（如提升比例、节省成本等）");
  }

  return { score, max, details };
}

function analyzeActionVerbs(resume: string): { score: number; max: number; details: string[] } {
  const details: string[] = [];
  let score = 0;
  const max = 15;

  // 统计行为动词使用
  const usedVerbs: string[] = [];
  ACTION_VERBS.forEach(verb => {
    const regex = new RegExp(verb, 'g');
    if (regex.test(resume)) {
      usedVerbs.push(verb);
    }
  });

  if (usedVerbs.length >= 6) {
    score = 15;
    details.push(`✓ 使用了 ${usedVerbs.length} 个行为动词，表达专业`);
  } else if (usedVerbs.length >= 3) {
    score = 10;
    details.push(`△ 使用了 ${usedVerbs.length} 个行为动词，可以更多`);
  } else if (usedVerbs.length >= 1) {
    score = 5;
    details.push(`△ 行为动词较少，建议使用如"主导"、"推动"等词汇`);
  } else {
    score = 0;
    details.push("✗ 缺少行为动词，建议用主动语态描述经历");
  }

  return { score, max, details };
}

function analyzeSections(resume: string): { score: number; max: number; details: string[] } {
  const details: string[] = [];
  let score = 0;
  const max = 20;

  const foundSections: string[] = [];

  REQUIRED_SECTIONS.forEach(section => {
    const found = section.patterns.some(pattern => pattern.test(resume));
    if (found) {
      score += 4;
      foundSections.push(section.name);
    }
  });

  const missingSections = REQUIRED_SECTIONS
    .filter(s => !foundSections.includes(s.name))
    .map(s => s.name);

  if (missingSections.length === 0) {
    details.push(`✓ 包含完整的简历模块`);
  } else if (missingSections.length <= 2) {
    details.push(`△ 缺少模块：${missingSections.join("、")}`);
  } else {
    details.push(`✗ 建议补充：${missingSections.join("、")}`);
  }

  return { score, max, details };
}

function analyzeLength(resume: string): { score: number; max: number; details: string[] } {
  const details: string[] = [];
  let score = 0;
  const max = 10;

  const charCount = resume.length;
  const wordCount = resume.split(/\s+/).filter(w => w).length;

  // 中文字符大约300-1000字为宜
  if (charCount >= 300 && charCount <= 1500) {
    score = 10;
    details.push(`✓ 简历长度适中（${charCount}字）`);
  } else if (charCount < 300) {
    score = 3;
    details.push(`△ 简历内容较少（${charCount}字），建议补充详细信息`);
  } else if (charCount > 2500) {
    score = 6;
    details.push(`△ 简历较长（${charCount}字），建议精简到重点内容`);
  } else {
    score = 8;
    details.push(`✓ 简历长度合理（${charCount}字）`);
  }

  return { score, max, details };
}

function generateSuggestions(
  breakdown: ScoreResult['breakdown'],
  jobDescription?: string
): string[] {
  const suggestions: string[] = [];

  // 关键词建议
  if (breakdown.keywords.score < 15) {
    if (jobDescription) {
      suggestions.push("对照职位描述，补充相关的专业技能关键词");
    } else {
      suggestions.push("添加更多行业相关的专业技能关键词");
    }
  }

  // 量化建议
  if (breakdown.quantification.score < 15) {
    suggestions.push("用具体数字描述工作成果，如'提升30%'、'节省50万成本'");
  }

  // 行为动词建议
  if (breakdown.actionVerbs.score < 10) {
    suggestions.push("使用行为动词开头描述经历，如'主导'、'推动'、'实现'");
  }

  // 格式建议
  if (breakdown.format.score < 10) {
    suggestions.push("使用项目符号和清晰的分段来组织内容");
  }

  // 模块建议
  if (breakdown.sections.score < 16) {
    suggestions.push("确保简历包含完整的工作经历、教育背景、技能等模块");
  }

  // 长度建议
  if (breakdown.length.score < 8) {
    suggestions.push("调整简历长度到300-1500字，突出重点信息");
  }

  return suggestions;
}