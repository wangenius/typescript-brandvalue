"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Clock, CheckCircle, XCircle, Loader2, Copy, Sparkles, Target, TrendingUp, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface Task {
  id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  type: 'brand_evaluation' | 'brand_generation';
  createdAt: string;
  updatedAt: string;
  input?: any;
  progress?: {
    step: number;
    totalSteps: number;
    message?: string;
  };
  result?: any;
  error?: string;
}

export default function TaskPage() {
  const { id } = useParams();
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchTask = async () => {
      try {
        const response = await fetch(`/api/tasks/${id}`);
        const data = await response.json();
        console.log(data);
        

        if (response.ok) {
          setTask(data.task);
        } else {
          setError(data.error || '任务未找到');
        }
      } catch (err) {
        setError('获取任务信息失败');
      } finally {
        setLoading(false);
      }
    };

    fetchTask();

    // 如果任务进行中，每5秒轮询更新状态
    const interval = setInterval(() => {
      if (task?.status === 'in_progress') {
        fetchTask();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [id, task?.status]);

  const copyTaskId = () => {
    if (id) {
      navigator.clipboard.writeText(id as string);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'in_progress':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return '等待中';
      case 'in_progress':
        return '进行中';
      case 'completed':
        return '已完成';
      case 'failed':
        return '失败';
      default:
        return '未知';
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'pending':
        return 'outline';
      case 'in_progress':
        return 'default';
      case 'completed':
        return 'secondary';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'brand_evaluation':
        return '品牌评测';
      case 'brand_generation':
        return '品牌生成';
      default:
        return type;
    }
  };

  // 评测结果显示组件
  function EvaluationResultDisplay({ result }: { result: any }) {
    const brandz = result?.brandz_evaluation;
    const consistency = result?.consistency_evaluation;
    const swot = consistency?.details?.swot_analysis;
    const analysisReports = result?.analysis_reports;
    const evaluationSummary = result?.evaluation_summary;

    console.log('EvaluationResult full result:', result);
    console.log('brandz:', brandz);
    console.log('consistency:', consistency);
    console.log('swot:', swot);
    

    return (
      <div className="space-y-6">
        {/* BrandZ Score Overview */}
        {brandz && (
          <Card>
            <CardHeader>
              <CardTitle>品牌价值评测 (BrandZ)</CardTitle>
              <CardDescription>{result?.brand_name || "您的品牌"}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {Math.round(brandz.brandz_value * 10) / 10}
                  </div>
                  <div className="text-sm text-muted-foreground">BrandZ 总分</div>
                  <Badge
                    variant={
                      brandz.brand_grade === "A级" ? "default" :
                      brandz.brand_grade === "B级" ? "secondary" : "outline"
                    }
                    className="mt-2"
                  >
                    {brandz.brand_grade}
                  </Badge>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {Math.round(brandz.financial_value_score * 10) / 10}
                  </div>
                  <div className="text-sm text-muted-foreground">财务价值分数</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {Math.round(brandz.brand_contribution_score * 10) / 10}
                  </div>
                  <div className="text-sm text-muted-foreground">品牌贡献分数</div>
                </div>
              </div>

              {/* 详细分数 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">财务价值构成</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">收益表现</span>
                      <span className="font-medium">{brandz.revenue_performance}/100</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">资产效率</span>
                      <span className="font-medium">{brandz.asset_efficiency}/100</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">品牌倍数</span>
                      <span className="font-medium">{brandz.brand_multiple}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-3">品牌贡献构成 (MDS)</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">有意义度</span>
                      <span className="font-medium">{brandz.meaningful_score}/100</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">差异化度</span>
                      <span className="font-medium">{brandz.different_score}/100</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">显著度</span>
                      <span className="font-medium">{brandz.salient_score}/100</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">一致性</span>
                      <span className="font-medium">{Math.round(brandz.consistency_score * 10) / 10}/100</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 改进建议 */}
              {brandz.improvement_suggestions && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">改进建议</h4>
                  <p className="text-sm text-blue-700">{brandz.improvement_suggestions}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 品牌一致性评测 */}
        {consistency && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                品牌一致性评测
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">总体一致性得分</span>
                  <div className="flex items-center gap-2">
                    <Progress value={consistency.total_score} className="w-32" />
                    <span className="font-bold text-lg">{consistency.total_score}/100</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="font-medium">一致性等级</span>
                  <Badge variant={consistency.grade === 'A+' || consistency.grade === 'A' ? 'default' : consistency.grade === 'B+' || consistency.grade === 'B' ? 'secondary' : 'outline'}>
                    {consistency.grade}
                  </Badge>
                </div>

                {/* 显示部分关键指标 */}
                {consistency.details?.metrics && (
                  <div>
                    <h4 className="font-medium mb-3">关键一致性指标</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(consistency.details.metrics)
                        .filter(([key]) => ['mission_clarity', 'values_clarity', 'style_consistency', 'promise_clarity'].includes(key))
                        .map(([key, value]: [string, any]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-sm text-muted-foreground capitalize">
                            {key.replace(/_/g, ' ')}
                          </span>
                          <span className="font-medium">{value}/10</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* SWOT 分析 */}
        {swot && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                SWOT 战略分析
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-green-700 mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    优势 (Strengths)
                  </h4>
                  <ul className="text-sm space-y-1">
                    {swot.strengths?.map((item: string, idx: number) => (
                      <li key={idx} className="text-muted-foreground">• {item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-red-700 mb-2 flex items-center gap-2">
                    <XCircle className="w-4 h-4" />
                    劣势 (Weaknesses)
                  </h4>
                  <ul className="text-sm space-y-1">
                    {swot.weaknesses?.map((item: string, idx: number) => (
                      <li key={idx} className="text-muted-foreground">• {item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-blue-700 mb-2 flex items-center gap-2">
                    <Trophy className="w-4 h-4" />
                    机会 (Opportunities)
                  </h4>
                  <ul className="text-sm space-y-1">
                    {swot.opportunities?.map((item: string, idx: number) => (
                      <li key={idx} className="text-muted-foreground">• {item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-orange-700 mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    威胁 (Threats)
                  </h4>
                  <ul className="text-sm space-y-1">
                    {swot.threats?.map((item: string, idx: number) => (
                      <li key={idx} className="text-muted-foreground">• {item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 分析报告 */}
        {analysisReports && (
          <div className="space-y-4">
            {/* 一致性分析报告 */}
            {consistency?.analysis_report && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-600" />
                    一致性分析报告
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <pre className="whitespace-pre-wrap text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg overflow-auto max-h-96">
                      {consistency.analysis_report}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 财务报告 */}
            {analysisReports.financial_report && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    财务价值分析报告
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="whitespace-pre-wrap text-sm text-muted-foreground">
                    {analysisReports.financial_report}
                  </pre>
                </CardContent>
              </Card>
            )}

            {/* MDS报告 */}
            {analysisReports.mds_report && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    品牌贡献分析报告 (MDS)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="whitespace-pre-wrap text-sm text-muted-foreground">
                    {analysisReports.mds_report}
                  </pre>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* 综合评测总结 */}
        {evaluationSummary?.overall_performance_summary && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-orange-600" />
                综合评测总结
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">一致性等级</div>
                  <Badge variant="secondary" className="mt-1">
                    {evaluationSummary.consistency_grade}
                  </Badge>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">BrandZ等级</div>
                  <Badge variant="secondary" className="mt-1">
                    {evaluationSummary.brandz_grade}
                  </Badge>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">评测方法</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {result?.methodology?.split(' ')[0] || "BrandZ"}
                  </div>
                </div>
              </div>
              <pre className="whitespace-pre-wrap text-sm text-muted-foreground">
                {evaluationSummary.overall_performance_summary}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>加载中...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Simple Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => router.push('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回首页
          </Button>
          <div className={"flex items-center gap-2 justify-between w-full flex-1"}>
            <h1 className="text-2xl font-bold">评测详情</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-muted-foreground">ID:</span>
              <code className="text-xs bg-muted px-2 py-1 rounded">{id}</code>
              <Button variant="ghost" size="sm" className="h-auto p-1" onClick={copyTaskId}>
                <Copy className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>

        {error ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">任务未找到</h2>
                <p className="text-muted-foreground mb-4">{error}</p>
                <p className="text-sm text-muted-foreground mb-4">
                  请检查任务ID是否正确，或者任务可能已被删除。
                </p>
                <Button onClick={() => router.push('/evaluation')}>
                  开始新评测
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : task ? (
          <div className="space-y-6">
            {/* Task Status - Only show if not completed or has error */}
            {(task.status !== 'completed' || task.error) && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      {getStatusIcon(task.status)}
                      任务状态
                    </CardTitle>
                    <Badge variant={getStatusVariant(task.status)}>
                      {getStatusText(task.status)}
                    </Badge>
                  </div>
                  <CardDescription>
                    类型: {getTypeText(task.type)} | 
                    创建: {new Date(task.createdAt).toLocaleString('zh-CN')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {task.progress && (
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span>进度</span>
                        <span>{task.progress.step}/{task.progress.totalSteps}</span>
                      </div>
                      <Progress value={(task.progress.step / task.progress.totalSteps) * 100} />
                      {task.progress.message && (
                        <p className="text-sm text-muted-foreground">{task.progress.message}</p>
                      )}
                    </div>
                  )}
                  {task.error && (
                    <div className="bg-red-50 border border-red-200 rounded p-3">
                      <h4 className="font-medium text-red-800 mb-1">错误信息</h4>
                      <p className="text-sm text-red-700">{task.error}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Evaluation Results */}
            {task.status === 'completed' && task.result && task.type === 'brand_evaluation' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">评测结果</h2>
                <EvaluationResultDisplay result={task.result} />
              </div>
            )}

            {/* Actions */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <Button onClick={() => router.push('/evaluation')}>
                    开始新评测
                  </Button>
                  <Button variant="outline" onClick={() => router.push('/')}>
                    返回首页
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </div>
  );
}