"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, MessageCircle, BarChart, Award, CheckCircle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function HomePage() {
  const [taskId, setTaskId] = useState('');
  const router = useRouter();

  const handleTaskSearch = () => {
    if (taskId.trim()) {
      router.push(`/task/${taskId.trim()}`);
    }
  };

  const features = [
    {
      icon: MessageCircle,
      title: "智能对话引导",
      description: "AI助手通过自然对话了解您的品牌信息"
    },
    {
      icon: BarChart,
      title: "专业评估模型",
      description: "基于BrandZ模型的科学品牌价值评估"
    },
    {
      icon: Award,
      title: "详细分析报告",
      description: "包含财务价值、品牌贡献度等多维度分析"
    }
  ];

  const steps = [
    "与AI助手对话，描述您的品牌",
    "AI自动提取和整理品牌信息",
    "生成专业的品牌价值评估报告",
    "获得改进建议和SWOT分析"
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            智能品牌价值评估系统
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            通过AI对话，快速评估您的品牌价值
          </p>
          
          {/* Task ID Search Section */}
          <Card className="mb-8 max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-lg">查询任务状态</CardTitle>
              <CardDescription>输入您的任务ID查看评估进度</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="输入任务ID (如: task_123456789_abc)"
                  value={taskId}
                  onChange={(e) => setTaskId(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleTaskSearch()}
                />
                <Button onClick={handleTaskSearch} size="icon">
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Link href="/evaluation">
            <Button size="lg" className="gap-2">
              开始新评估
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {features.map((feature, index) => (
            <Card key={index}>
              <CardHeader>
                <feature.icon className="w-10 h-10 mb-2 text-primary" />
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* How it works */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="text-2xl">如何使用</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <p className="text-muted-foreground">{step}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* What you'll get */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">您将获得</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>BrandZ综合评分和等级评定</span>
              </div>
              <div className="flex gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>财务价值和品牌贡献度分析</span>
              </div>
              <div className="flex gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>品牌一致性评估</span>
              </div>
              <div className="flex gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>SWOT战略分析</span>
              </div>
              <div className="flex gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>个性化改进建议</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center mt-16">
          <Link href="/evaluation">
            <Button size="lg" variant="default" className="gap-2">
              立即开始评估
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground mt-4">
            整个评估过程只需 5-10 分钟
          </p>
        </div>
      </div>
    </div>
  );
}