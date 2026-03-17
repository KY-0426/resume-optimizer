import { NextRequest, NextResponse } from "next/server";

// AI优化简历的核心逻辑
async function optimizeResume(resume: string, jobDescription?: string): Promise<string> {
  // 如果配置了AI API，使用真正的AI服务
  // 否则使用本地优化的规则

  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY;

  if (apiKey) {
    // 使用AI API
    return await optimizeWithAI(resume, jobDescription, apiKey);
  }

  // 本地优化规则
  return optimizeLocally(resume, jobDescription);
}

// 本地优化（无需API）
function optimizeLocally(resume: string, jobDescription?: string): string {
  // 优化后的简历内容
  let optimizedContent = resume;

  // 1. 格式化章节标题
  const sectionHeaders = ["个人信息", "联系方式", "个人简介", "工作经历", "项目经验", "教育背景", "技能", "证书", "自我评价", "工作经历：", "项目经验：", "教育背景："];
  for (const header of sectionHeaders) {
    const regex = new RegExp(`^(\\s*)${header}`, "gm");
    optimizedContent = optimizedContent.replace(regex, `\n【${header.replace("：", "")}】`);
  }

  // 2. 优化列表项表达
  const enhancements: [RegExp, string][] = [
    [/^(\s*[-•*]\s*)做了/gm, "$1完成"],
    [/^(\s*[-•*]\s*)写了/gm, "$1开发"],
    [/^(\s*[-•*]\s*)学了/gm, "$1掌握"],
    [/^(\s*[-•*]\s*)帮忙/gm, "$1协助"],
    [/^(\s*[-•*]\s*)改了/gm, "$1优化"],
    [/^(\s*[-•*]\s*)做了/gm, "$1负责实施"],
  ];

  for (const [pattern, replacement] of enhancements) {
    optimizedContent = optimizedContent.replace(pattern, replacement);
  }

  // 3. 统一列表符号
  optimizedContent = optimizedContent.replace(/^(\s*)[-*]\s/gm, "$1• ");

  // 生成优化建议
  const suggestions: string[] = [];

  // 检查是否包含量化数据
  if (!/\d+%|\d+倍|\d+万|\d+个|\d+次|\d+元/.test(resume)) {
    suggestions.push("• 建议添加量化成果，如：提升转化率20%、节省成本50万/年等");
  }

  // 检查是否有行为动词
  const actionVerbsCount = (resume.match(/负责|主导|开发|设计|实现|优化|推动|带领|完成/g) || []).length;
  if (actionVerbsCount < 3) {
    suggestions.push("• 建议使用更多行为动词开头，如：主导、推动、优化、提升、完成等");
  }

  // 检查是否太短
  if (resume.length < 300) {
    suggestions.push("• 简历内容较少，建议补充更多工作细节和成果描述");
  }

  // 如果有JD，添加匹配建议
  if (jobDescription && jobDescription.trim()) {
    const keywords = extractKeywords(jobDescription);
    const matchedKeywords = keywords.filter(k => resume.toLowerCase().includes(k.toLowerCase()));

    if (keywords.length > 0) {
      suggestions.push(`• 职位关键词：${keywords.slice(0, 5).join("、")}`);
    }
    if (matchedKeywords.length > 0) {
      suggestions.push(`• 已匹配关键词：${matchedKeywords.slice(0, 5).join("、")}`);
    }

    const unmatched = keywords.filter(k => !resume.toLowerCase().includes(k.toLowerCase())).slice(0, 3);
    if (unmatched.length > 0) {
      suggestions.push(`• 建议补充关键词：${unmatched.join("、")}`);
    }
  }

  // 组合结果
  let result = optimizedContent.trim();

  if (suggestions.length > 0) {
    result += "\n\n---\n\n💡 优化建议：\n\n" + suggestions.join("\n");
  }

  return result;
}

// 从JD提取关键词
function extractKeywords(text: string): string[] {
  const techKeywords = text.match(/React|Vue|Angular|Node\.?js|TypeScript|JavaScript|Python|Java|Go|SQL|MongoDB|MySQL|Redis|Docker|Kubernetes|AWS|前端|后端|全栈|移动端|算法|机器学习|深度学习|数据分析|微服务|分布式|高并发/gi) || [];
  const skillKeywords = text.match(/熟悉|精通|掌握|具备|了解|有.*经验|能够|擅长/g) || [];

  return [...new Set([...techKeywords.map(k => k.toLowerCase()), ...skillKeywords])].slice(0, 10);
}

// 使用AI API优化
async function optimizeWithAI(resume: string, jobDescription: string | undefined, apiKey: string): Promise<string> {
  const systemPrompt = `你是一位专业的简历优化顾问。你的任务是：
1. 润色简历语言，使其更专业、更有说服力
2. 优化关键词，提高ATS筛选通过率
3. 如果提供了职位描述，针对性地优化简历匹配度
4. 添加量化描述建议
5. 指出可以改进的地方

请直接返回优化后的简历内容，格式清晰，便于复制。`;

  const userPrompt = jobDescription
    ? `请优化以下简历，目标职位描述在下方：

【简历内容】
${resume}

【目标职位描述】
${jobDescription}`
    : `请优化以下简历：

【简历内容】
${resume}`;

  // 根据可用的API选择
  if (process.env.ANTHROPIC_API_KEY) {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 4000,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    const data = await response.json();
    return data.content[0].text;
  }

  // OpenAI API
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resume, jobDescription } = body;

    if (!resume) {
      return NextResponse.json({ error: "请输入简历内容" }, { status: 400 });
    }

    const result = await optimizeResume(resume, jobDescription);

    return NextResponse.json({ result });
  } catch (error) {
    console.error("优化失败:", error);
    return NextResponse.json(
      { error: "优化失败，请稍后重试" },
      { status: 500 }
    );
  }
}