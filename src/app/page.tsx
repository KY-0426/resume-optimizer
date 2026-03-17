import { Navbar, Footer, FeatureCard, CTAButton } from "@/components/Layout";

export const metadata = {
  title: "AI简历优化助手 - 免费智能简历润色工具",
  description: "免费AI简历优化工具，智能润色简历语言、优化关键词、匹配职位要求。提高ATS筛选通过率。",
};

export default function HomePage() {
  const features = [
    { icon: "✨", title: "AI智能优化", desc: "一键润色简历语言", href: "/optimize" },
    { icon: "📊", title: "ATS评分", desc: "智能评估简历质量", href: "/score" },
    { icon: "📋", title: "模板库", desc: "专业简历模板下载", href: "/templates" },
    { icon: "👑", title: "会员特权", desc: "解锁更多高级功能", href: "/member" },
  ];

  const advantages = [
    { title: "100%免费", desc: "核心功能完全免费使用" },
    { title: "无需注册", desc: "打开即用，保护隐私" },
    { title: "智能优化", desc: "DeepSeek AI驱动" },
    { title: "即时生成", desc: "流式输出，秒级响应" },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 rounded-full shadow-sm border border-gray-100 mb-8">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          <span className="text-sm text-gray-600">已有 1,234+ 用户使用</span>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
          <span className="gradient-text">AI驱动</span>
          <br />
          让简历脱颖而出
        </h1>

        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10">
          智能润色简历语言，优化关键词匹配，提高ATS筛选通过率。
          <br />
          无需注册，完全免费。
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <CTAButton href="/optimize">
            <span>✨</span> 立即优化简历
          </CTAButton>
          <a
            href="/score"
            className="inline-flex items-center gap-2 px-8 py-4 border-2 border-indigo-200 text-indigo-600 font-semibold rounded-xl hover:bg-indigo-50 transition-colors"
          >
            <span>📊</span> 查看评分
          </a>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">核心功能</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <FeatureCard key={i} {...f} />
          ))}
        </div>
      </section>

      {/* Advantages */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-white mb-12">为什么选择我们</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {advantages.map((a, i) => (
              <div key={i} className="text-center text-white">
                <h3 className="text-xl font-semibold mb-2">{a.title}</h3>
                <p className="text-white/80 text-sm">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">使用流程</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { step: "1", title: "粘贴简历", desc: "将你的简历内容粘贴到输入框" },
            { step: "2", title: "AI优化", desc: "点击优化按钮，AI智能润色" },
            { step: "3", title: "下载使用", desc: "复制或导出优化后的简历" },
          ].map((item, i) => (
            <div key={i} className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-lg shadow-indigo-200">
                {item.step}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="glass-card p-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">准备好优化你的简历了吗？</h2>
          <p className="text-gray-600 mb-8">完全免费，无需注册，立即开始</p>
          <CTAButton href="/optimize">
            <span>🚀</span> 开始使用
          </CTAButton>
        </div>
      </section>

      <Footer />
    </div>
  );
}