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
  const lines = resume.split("\n");
  const optimized: string[] = [];

  let section = "";

  for (let line of lines) {
    const trimmedLine = line.trim();

    // 跳过空行但保留格式
    if (!trimmedLine) {
      optimized.push("");
      continue;
    }

    // 识别并标记章节
    if (/^(个人信息|联系方式|个人简介|工作经历|项目经验|教育背景|技能|证书|自我评价)/i.test(trimmedLine)) {
      section = trimmedLine;
      optimized.push(`\n【${trimmedLine}】`);
      continue;
    }

    // 优化工作经历描述
    if (section.includes("工作") || /(\d{4}.*至今|\d{4}.*\d{4})/.test(trimmedLine)) {
      // 为描述添加行为动词前缀（如果开头不是行为动词）
      const actionVerbs = ["负责", "主导", "参与", "开发", "设计", "优化", "实现", "完成", "提升", "改进", "推动", "协调", "带领"];
      const startsWithAction = actionVerbs.some(v => trimmedLine.startsWith(v));

      // 如果是列表项，优化表达
      if (trimmedLine.startsWith("-") || trimmedLine.startsWith("•") || trimmedLine.startsWith("*")) {
        const content = trimmedLine.replace(/^[-•*]\s*/, "");
        optimized.push(`  • ${enhanceDescription(content)}`);
      } else {
        optimized.push(line);
      }
    } else {
      optimized.push(line);
    }
  }

  // 添加优化建议
  let suggestions = "\n\n---\n\n💡 优化建议：\n\n";

  // 检查是否包含量化数据
  if (!/\d+%|\d+倍|\d+万|\d+个|\d+次/.test(resume)) {
    suggestions += "• 建议添加量化成果，如：提升转化率20%、节省成本50万/年等\n";
  }

  // 检查是否有行为动词
  const actionVerbsCount = (resume.match(/负责|主导|开发|设计|实现|优化|推动|带领/g) || []).length;
  if (actionVerbsCount < 3) {
    suggestions += "• 建议使用更多行为动词开头，如：主导、推动、优化、提升等\n";
  }

  // 检查是否太短
  if (resume.length < 500) {
    suggestions += "• 简历内容较少，建议补充更多工作细节和成果描述\n";
  }

  // 如果有JD，添加匹配建议
  if (jobDescription) {
    const keywords = extractKeywords(jobDescription);
    const matchedKeywords = keywords.filter(k => resume.includes(k));

    suggestions += `• 从职位描述中提取的关键词：${keywords.slice(0, 5).join("、")}\n`;
    suggestions += `• 已匹配关键词：${matchedKeywords.slice(0, 5).join("、") || "无"}\n`;

    const unmatched = keywords.filter(k => !resume.includes(k)).slice(0, 3);
    if (unmatched.length > 0) {
      suggestions += `• 建议补充关键词：${unmatched.join("、")}\n`;
    }
  }

  return optimized.join("\n") + suggestions;
}

// 增强描述语句
function enhanceDescription(text: string): string {
  const enhancements: [RegExp, string][] = [
    [/做了(.+)/i, "完成$1"],
    [/写了(.+)/i, "开发$1"],
    [/学了(.+)/i, "掌握$1"],
    [/帮忙(.+)/i, "协助$1"],
    [/改了(.+)/i, "优化$1"],
  ];

  let result = text;
  for (const [pattern, replacement] of enhancements) {
    result = result.replace(pattern, replacement);
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