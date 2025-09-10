"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, MessageCircle, BarChart, Award, CheckCircle, Search, Brain, Shield, Zap, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

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
      description: "CMOCHAT自研算法，AI Agent精准分析用户品牌特征和需求"
    },
    {
      icon: BarChart,
      title: "专业评估模型",
      description: "基于BrandZ模型的科学品牌价值评估体系，融合国际标准与本土化洞察"
    },
    {
      icon: Award,
      title: "详细分析报告",
      description: "包含财务价值、品牌贡献度等多维度分析"
    }
  ];

  const scientificFeatures = [
    {
      icon: Brain,
      title: "CMOCHAT自研算法",
      description: "独家研发的智能对话引擎，深度理解品牌语义，精准提取关键信息",
      highlight: "核心技术"
    },
    {
      icon: Shield,
      title: "BrandZ国际标准",
      description: "采用全球认可的BrandZ品牌评估方法论，确保评估结果的科学性和权威性",
      highlight: "国际认证"
    },
    {
      icon: Zap,
      title: "AI Agent智能分析",
      description: "智能代理实时分析用户品牌特征，动态调整评估维度，提供个性化洞察",
      highlight: "智能创新"
    }
  ];

  const steps = [
    "与AI助手对话，描述您的品牌",
    "AI自动提取和整理品牌信息",
    "生成专业的品牌价值评估报告",
    "获得改进建议和SWOT分析"
  ];

  const benefits = [
    { text: "BrandZ综合评分和等级评定", important: true },
    { text: "财务价值和品牌贡献度分析", important: true },
    { text: "品牌一致性评估", important: false },
    { text: "SWOT战略分析", important: false },
    { text: "个性化改进建议", important: false }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Gradient Background */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute inset-0">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        </div>
        
        <div className="container relative mx-auto px-4 py-24 max-w-6xl">
          <div className="text-center space-y-6">
            {/* Hero Badge */}
            <Badge variant="outline" className="mb-4 px-4 py-1.5 text-sm border-primary/20 bg-primary/5">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              专业品牌价值评估平台
            </Badge>
            
            {/* Main Title */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              智能品牌价值
              <span className="block text-primary mt-2">评估系统</span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              通过AI对话，快速评估您的品牌价值
            </p>
            
            {/* Scientific Credibility Line */}
            <div className="flex flex-wrap justify-center items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-primary" />
                基于BrandZ模型
              </span>
              <span className="text-muted-foreground/50">·</span>
              <span className="flex items-center gap-1.5">
                <Brain className="w-4 h-4 text-primary" />
                CMOCHAT自研算法
              </span>
              <span className="text-muted-foreground/50">·</span>
              <span className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-primary" />
                AI Agent智能分析
              </span>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Link href="/evaluation">
                <Button size="lg" className="gap-2 px-8 h-12 text-base shadow-lg hover:shadow-xl transition-all">
                  开始新评估
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              
              {/* Inline Task Search */}
              <div className="flex items-center gap-2 max-w-sm">
                <Input
                  placeholder="输入任务ID查看进度"
                  value={taskId}
                  onChange={(e) => setTaskId(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleTaskSearch()}
                  className="h-12"
                />
                <Button onClick={handleTaskSearch} size="icon" variant="outline" className="h-12 w-12">
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Scientific Foundation Section - Improved Layout */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">科学评估，专业可信</h2>
            <p className="text-lg text-muted-foreground">三大核心技术，确保评估结果的准确性和实用性</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {scientificFeatures.map((feature, index) => (
              <Card key={index} className="relative border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
                <Badge className="absolute -top-3 left-6 px-3">{feature.highlight}</Badge>
                <CardHeader className="pt-8">
                  <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-7 h-7 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Main Features - Card Layout */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group">
                <div className="h-full p-8 rounded-xl border bg-card hover:bg-accent/50 transition-all duration-300 hover:scale-105">
                  <feature.icon className="w-12 h-12 mb-4 text-primary group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Timeline Style */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card className="border-2">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-3xl">如何使用</CardTitle>
              <CardDescription className="text-lg">简单四步，获得专业品牌价值评估</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {/* Vertical Line */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border" />
                
                <div className="space-y-8">
                  {steps.map((step, index) => (
                    <div key={index} className="flex gap-6 items-start">
                      <div className="relative flex-shrink-0 w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold shadow-lg">
                        <div className="absolute -inset-1 bg-primary/20 rounded-full animate-pulse" />
                        <span className="relative">{index + 1}</span>
                      </div>
                      <div className="flex-1 pt-4">
                        <p className="text-lg">{step}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Benefits Section - Highlight Important Items */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card className="border-2 shadow-xl">
            <CardHeader className="text-center bg-primary/5 rounded-t-lg">
              <CardTitle className="text-3xl">您将获得</CardTitle>
              <CardDescription className="text-lg">全方位品牌价值分析报告</CardDescription>
            </CardHeader>
            <CardContent className="pt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {benefits.map((benefit, index) => (
                  <div 
                    key={index} 
                    className={`flex gap-3 items-start p-4 rounded-lg transition-all ${
                      benefit.important ? 'bg-primary/5 border border-primary/20' : ''
                    }`}
                  >
                    <CheckCircle className={`w-6 h-6 flex-shrink-0 mt-0.5 ${
                      benefit.important ? 'text-primary' : 'text-green-600'
                    }`} />
                    <span className={`${benefit.important ? 'font-medium' : ''}`}>
                      {benefit.text}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-gradient-to-t from-primary/5 to-transparent">
        <div className="container mx-auto px-4 text-center">
          <div className="space-y-6">
            <h3 className="text-3xl font-bold">准备好评估您的品牌价值了吗？</h3>
            <p className="text-xl text-muted-foreground">
              整个评估过程只需 5-10 分钟
            </p>
            <Link href="/evaluation">
              <Button size="lg" className="gap-2 px-8 h-14 text-lg shadow-xl hover:shadow-2xl transition-all">
                立即开始评估
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}