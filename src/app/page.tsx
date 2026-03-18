import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AdBanner from "@/components/AdBanner";

export default function HomePage() {
  const features = [
    {
      title: "AI智能优化",
      description: "一键润色简历，提升专业度",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      title: "ATS评分",
      description: "智能评估简历质量分数",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      title: "专业模板",
      description: "精选简历模板直接使用",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z" />
        </svg>
      ),
    },
  ];

  const steps = [
    { step: "1", title: "粘贴简历", desc: "将简历内容粘贴到输入框" },
    { step: "2", title: "AI优化", desc: "点击按钮，AI自动润色" },
    { step: "3", title: "导出使用", desc: "复制或下载优化结果" },
  ];

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            用AI优化你的简历
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            智能润色简历语言，优化关键词匹配，提高ATS筛选通过率
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" render={<Link href="/optimize" />} className="text-base px-8">
              开始优化
            </Button>
            <Button variant="outline" size="lg" render={<Link href="/score" />}>
              简历评分
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            核心功能
          </h2>
          <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
            {features.map((feature) => (
              <Card key={feature.title} className="border-none shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="items-center text-center pb-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center pt-0">
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            使用方法
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((item, index) => (
              <div key={item.step} className="relative text-center">
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-6 left-[60%] w-[80%] h-0.5 bg-primary/20" />
                )}
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Ad Banner */}
          <div className="max-w-4xl mx-auto mt-12">
            <AdBanner type="horizontal" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto border-primary/20 bg-primary/5">
            <CardHeader className="items-center text-center pb-2">
              <CardTitle className="text-2xl md:text-3xl">准备好优化简历了吗？</CardTitle>
              <CardDescription className="text-base">完全免费，无需注册</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center pt-4">
              <Button size="lg" render={<Link href="/optimize" />} className="text-base px-10">
                立即开始
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}