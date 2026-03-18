"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { resumeTemplates } from "@/lib/resume-templates";
import { User, getUser, FREE_LIMITS } from "@/lib/user";
import { MemberModal } from "@/components/MemberComponents";
import AdBanner from "@/components/AdBanner";

export default function TemplatesPage() {
  const [user] = useState<User>(() => getUser());
  const [category, setCategory] = useState("全部");
  const [showMember, setShowMember] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const categories = ["全部", "技术", "产品", "运营", "应届生", "管理"];
  const filtered = category === "全部" ? resumeTemplates : resumeTemplates.filter(t => t.category === category);

  const handleSelect = (templateId: string) => {
    const locked = !user.isMember && !FREE_LIMITS.templates.includes(templateId);
    if (locked) {
      setShowMember(true);
      return;
    }
    setSelectedTemplate(templateId);
  };

  const selected = selectedTemplate ? resumeTemplates.find(t => t.id === selectedTemplate) : null;

  return (
    <main className="container mx-auto px-4 py-6 md:py-8">
      <div className="text-center mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">简历模板库</h1>
        <p className="text-sm md:text-base text-muted-foreground">专业简历模板，一键套用</p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-2 mb-6 md:mb-8">
        {categories.map(c => (
          <Button
            key={c}
            variant={category === c ? "default" : "outline"}
            size="sm"
            onClick={() => setCategory(c)}
          >
            {c}
          </Button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(template => {
          const locked = !user.isMember && !FREE_LIMITS.templates.includes(template.id);
          return (
            <Card
              key={template.id}
              className={`cursor-pointer transition-colors hover:border-primary ${locked ? "opacity-70" : ""}`}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{template.category}</p>
                  </div>
                  <span className="text-2xl">{template.preview}</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                {locked ? (
                  <Badge variant="secondary">会员专属</Badge>
                ) : (
                  <Button size="sm" className="w-full" onClick={() => handleSelect(template.id)}>
                    查看详情
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Template Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelectedTemplate(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] sm:max-h-[85vh] overflow-hidden w-[95vw] sm:w-full">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.name}</DialogTitle>
                <p className="text-sm text-muted-foreground">{selected.category}</p>
              </DialogHeader>
              <div className="overflow-y-auto max-h-[60vh]">
                <pre className="text-sm whitespace-pre-wrap leading-relaxed font-sans">
                  {selected.content}
                </pre>
              </div>
              <div className="flex justify-end pt-4 border-t">
                <Button render={<Link href="/optimize" />}>
                  使用此模板
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Ad Banner */}
      <div className="max-w-4xl mx-auto mt-8">
        <AdBanner type="horizontal" />
      </div>

      <MemberModal isOpen={showMember} onClose={() => setShowMember(false)} user={user} onUserUpdate={() => {}} />
    </main>
  );
}