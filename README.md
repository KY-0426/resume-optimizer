# AI简历优化助手

使用AI技术优化你的简历，提高面试通过率。

## 功能特点

- 智能润色简历语言
- 关键词优化
- 支持职位JD匹配
- 100%免费使用

## 本地开发

```bash
npm install
npm run dev
```

打开 http://localhost:3000 查看

## 部署到Vercel

1. 将代码推送到GitHub
2. 在Vercel导入项目
3. 自动部署

## 环境变量（可选）

- `ANTHROPIC_API_KEY` - 使用Claude API增强优化效果
- `OPENAI_API_KEY` - 使用OpenAI API增强优化效果

不配置API Key也可以使用，会使用本地优化规则。

## 技术栈

- Next.js 16
- Tailwind CSS
- TypeScript