import Link from "next/link";

export default function HomePage() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-16">
      {/* Hero */}
      <div className="text-center mb-20">
        <h1 className="text-4xl font-bold text-neutral-900 mb-4">
          用AI优化你的简历
        </h1>
        <p className="text-lg text-neutral-600 mb-8 max-w-xl mx-auto">
          智能润色简历语言，优化关键词匹配，提高ATS筛选通过率
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/optimize" className="btn btn-primary">
            开始优化
          </Link>
          <Link href="/score" className="btn btn-outline">
            简历评分
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-6 mb-20">
        <div className="card p-6">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="font-semibold text-neutral-900 mb-2">AI智能优化</h3>
          <p className="text-sm text-neutral-600">一键润色简历，提升专业度</p>
        </div>

        <div className="card p-6">
          <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="font-semibold text-neutral-900 mb-2">ATS评分</h3>
          <p className="text-sm text-neutral-600">智能评估简历质量分数</p>
        </div>

        <div className="card p-6">
          <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z" />
            </svg>
          </div>
          <h3 className="font-semibold text-neutral-900 mb-2">专业模板</h3>
          <p className="text-sm text-neutral-600">精选简历模板直接使用</p>
        </div>
      </div>

      {/* How it works */}
      <div className="mb-20">
        <h2 className="text-2xl font-semibold text-neutral-900 mb-8 text-center">使用方法</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { step: "1", title: "粘贴简历", desc: "将简历内容粘贴到输入框" },
            { step: "2", title: "AI优化", desc: "点击按钮，AI自动润色" },
            { step: "3", title: "导出使用", desc: "复制或下载优化结果" },
          ].map((item) => (
            <div key={item.step} className="flex items-start gap-4">
              <div className="w-8 h-8 bg-neutral-900 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                {item.step}
              </div>
              <div>
                <h4 className="font-medium text-neutral-900">{item.title}</h4>
                <p className="text-sm text-neutral-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="card p-8 text-center">
        <h2 className="text-xl font-semibold text-neutral-900 mb-2">准备好优化简历了吗？</h2>
        <p className="text-neutral-600 mb-6">完全免费，无需注册</p>
        <Link href="/optimize" className="btn btn-primary">
          立即开始
        </Link>
      </div>
    </main>
  );
}