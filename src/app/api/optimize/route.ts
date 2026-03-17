import { NextRequest } from "next/server";

const SYSTEM_PROMPT = `你是一位专业的简历优化顾问。你的任务是：
1. 润色简历语言，使其更专业、更有说服力
2. 优化关键词，提高ATS筛选通过率
3. 如果提供了职位描述，针对性地优化简历匹配度
4. 添加量化描述建议
5. 指出可以改进的地方

请直接返回优化后的简历内容，格式清晰，便于复制。`;

// 本地优化（无需API）
function optimizeLocally(resume: string, jobDescription?: string): string {
  let optimizedContent = resume;

  const sectionHeaders = ["个人信息", "联系方式", "个人简介", "工作经历", "项目经验", "教育背景", "技能", "证书", "自我评价"];
  for (const header of sectionHeaders) {
    const regex = new RegExp(`^(\\s*)${header}`, "gm");
    optimizedContent = optimizedContent.replace(regex, `\n【${header}】`);
  }

  const enhancements: [RegExp, string][] = [
    [/^(\s*[-•*]\s*)做了/gm, "$1完成"],
    [/^(\s*[-•*]\s*)写了/gm, "$1开发"],
    [/^(\s*[-•*]\s*)学了/gm, "$1掌握"],
    [/^(\s*[-•*]\s*)帮忙/gm, "$1协助"],
    [/^(\s*[-•*]\s*)改了/gm, "$1优化"],
  ];

  for (const [pattern, replacement] of enhancements) {
    optimizedContent = optimizedContent.replace(pattern, replacement);
  }

  optimizedContent = optimizedContent.replace(/^(\s*)[-*]\s/gm, "$1• ");

  const suggestions: string[] = [];

  if (!/\d+%|\d+倍|\d+万|\d+个|\d+次|\d+元/.test(resume)) {
    suggestions.push("• 建议添加量化成果，如：提升转化率20%、节省成本50万/年等");
  }

  const actionVerbsCount = (resume.match(/负责|主导|开发|设计|实现|优化|推动|带领|完成/g) || []).length;
  if (actionVerbsCount < 3) {
    suggestions.push("• 建议使用更多行为动词开头，如：主导、推动、优化、提升、完成等");
  }

  if (resume.length < 300) {
    suggestions.push("• 简历内容较少，建议补充更多工作细节和成果描述");
  }

  let result = optimizedContent.trim();

  if (suggestions.length > 0) {
    result += "\n\n---\n\n💡 优化建议：\n\n" + suggestions.join("\n");
  }

  return result;
}

// 创建流式响应
async function createStreamResponse(resume: string, jobDescription?: string): Promise<ReadableStream> {
  const apiKey = process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY;

  // 没有API Key，使用本地优化（模拟流式输出）
  if (!apiKey) {
    const result = optimizeLocally(resume, jobDescription);
    const encoder = new TextEncoder();

    return new ReadableStream({
      async start(controller) {
        // 模拟流式输出，每次输出几个字符
        const chunkSize = 5;
        for (let i = 0; i < result.length; i += chunkSize) {
          const chunk = result.slice(i, i + chunkSize);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`));
          await new Promise(r => setTimeout(r, 10));
        }
        controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
        controller.close();
      }
    });
  }

  const userPrompt = jobDescription
    ? `请优化以下简历，目标职位描述在下方：

【简历内容】
${resume}

【目标职位描述】
${jobDescription}`
    : `请优化以下简历：

【简历内容】
${resume}`;

  // DeepSeek 流式API
  if (process.env.DEEPSEEK_API_KEY) {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "AI优化失败");
    }

    const reader = response.body?.getReader();
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    return new ReadableStream({
      async start(controller) {
        if (!reader) {
          controller.close();
          return;
        }

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n").filter(line => line.trim() !== "");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") {
                  controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
                } else {
                  try {
                    const json = JSON.parse(data);
                    const content = json.choices?.[0]?.delta?.content || "";
                    if (content) {
                      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
                    }
                  } catch {
                    // 忽略解析错误
                  }
                }
              }
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      }
    });
  }

  // OpenAI 流式API
  if (process.env.OPENAI_API_KEY) {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "AI优化失败");
    }

    const reader = response.body?.getReader();
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    return new ReadableStream({
      async start(controller) {
        if (!reader) {
          controller.close();
          return;
        }

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n").filter(line => line.trim() !== "");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") {
                  controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
                } else {
                  try {
                    const json = JSON.parse(data);
                    const content = json.choices?.[0]?.delta?.content || "";
                    if (content) {
                      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
                    }
                  } catch {
                    // 忽略解析错误
                  }
                }
              }
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      }
    });
  }

  // Anthropic 流式API
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
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
      stream: true,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "AI优化失败");
  }

  const reader = response.body?.getReader();
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  return new ReadableStream({
    async start(controller) {
      if (!reader) {
        controller.close();
        return;
      }

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n").filter(line => line.trim() !== "");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const json = JSON.parse(line.slice(6));
                if (json.type === "content_block_delta" && json.delta?.text) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: json.delta.text })}\n\n`));
                }
              } catch {
                // 忽略解析错误
              }
            }
          }
        }
        controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resume, jobDescription } = body;

    if (!resume) {
      return new Response(JSON.stringify({ error: "请输入简历内容" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const stream = await createStreamResponse(resume, jobDescription);

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("优化失败:", error);
    return new Response(JSON.stringify({ error: "优化失败，请稍后重试" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}