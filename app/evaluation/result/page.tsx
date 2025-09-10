"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EvaluationProgress } from "@/components/ui/evaluation-progress";
import { Progress } from "@/components/ui/progress";
import {
  AlertCircle,
  ArrowLeft,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ResultPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [evalResult, setEvalResult] = useState<any | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");
  const [generationTaskId, setGenerationTaskId] = useState<string | null>(null);
  const [evaluationTaskId, setEvaluationTaskId] = useState<string | null>(null);

  useEffect(() => {
    // 检查URL参数中是否有任务ID（用于恢复）
    const urlParams = new URLSearchParams(window.location.search);
    const genTaskId = urlParams.get('genTaskId');
    const evalTaskId = urlParams.get('evalTaskId');
    
    if (genTaskId && evalTaskId) {
      // 恢复现有任务
      setGenerationTaskId(genTaskId);
      setEvaluationTaskId(evalTaskId);
      resumeTasks(genTaskId, evalTaskId);
      return;
    }

    // 获取存储的数据
    const dataStr = sessionStorage.getItem("evaluationData");
    if (!dataStr) {
      router.push("/evaluation");
      return;
    }

    const data = JSON.parse(dataStr);
    if (!data.partial?.brand_name) {
      router.push("/evaluation");
      return;
    }

    // 生成和评估
    generateAndEvaluate(data);
  }, []);

  async function resumeTasks(genTaskId: string, evalTaskId: string) {
    setLoading(true);
    try {
      // 检查生成任务状态
      const genTaskResponse = await fetch(`/api/tasks/${genTaskId}`);
      const genTask = await genTaskResponse.json();
      
      if (!genTask.success) {
        throw new Error('生成任务不存在');
      }

      if (genTask.task.status === 'completed' && genTask.task.result) {
        // 生成已完成，检查评估任务
        const evalTaskResponse = await fetch(`/api/tasks/${evalTaskId}`);
        const evalTask = await evalTaskResponse.json();
        
        if (evalTask.success && evalTask.task.status === 'completed' && evalTask.task.result) {
          // 两个任务都完成了
          setEvalResult(evalTask.task.result);
          setProgress(100);
          setCurrentStep('评估完成！');
          setLoading(false);
          return;
        } else if (evalTask.task.status === 'in_progress') {
          // 评估正在进行中，继续监听
          await monitorEvaluationTask(evalTaskId, genTask.task.result);
          return;
        } else {
          // 评估任务失败或未开始，重新开始评估
          await startEvaluation(genTask.task.result, evalTaskId);
          return;
        }
      } else if (genTask.task.status === 'in_progress') {
        // 生成正在进行中，继续监听
        await monitorGenerationTask(genTaskId, evalTaskId);
        return;
      } else {
        throw new Error('生成任务失败');
      }
    } catch (e: any) {
      setError(e?.message || '任务恢复失败');
      setLoading(false);
    }
  }

  async function generateAndEvaluate(data: any) {
    setLoading(true);
    try {
      setCurrentStep("正在分析品牌信息...");
      setProgress(10);

      // 创建生成任务
      const createGenTaskResponse = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'brand_generation' })
      });
      const genTaskResult = await createGenTaskResponse.json();
      
      if (!genTaskResult.success) {
        throw new Error('创建生成任务失败');
      }
      
      const genTaskId = genTaskResult.taskId;
      setGenerationTaskId(genTaskId);

      // 创建评估任务
      const createEvalTaskResponse = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'brand_evaluation' })
      });
      const evalTaskResult = await createEvalTaskResponse.json();
      
      if (!evalTaskResult.success) {
        throw new Error('创建评估任务失败');
      }
      
      const evalTaskId = evalTaskResult.taskId;
      setEvaluationTaskId(evalTaskId);
      
      // 更新URL以支持刷新恢复
      const newUrl = `${window.location.pathname}?genTaskId=${genTaskId}&evalTaskId=${evalTaskId}`;
      window.history.replaceState({}, '', newUrl);

      // 从对话历史中提取所有信息来生成品牌资产
      const messages = data.messages || [];
      let conversationContent = "";

      // 构建对话内容
      for (const msg of messages) {
        if (msg.role === "user") {
          conversationContent += `用户：${msg.content}\n`;
        } else if (
          msg.role === "assistant" &&
          !msg.content.includes("[READY_FOR_EVALUATION]")
        ) {
          conversationContent += `助手：${msg.content}\n`;
        }
      }

      // 如果有品牌名称，确保包含在内容中
      if (
        data.partial.brand_name &&
        !conversationContent.includes(data.partial.brand_name)
      ) {
        conversationContent =
          `品牌名称：${data.partial.brand_name}\n` + conversationContent;
      }

      // 使用流式API生成品牌资产
      setCurrentStep("正在生成品牌资产...");
      setProgress(20);

      const generateResponse = await fetch("/api/brand/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: conversationContent, stream: true, taskId: genTaskId }),
      });

      if (!generateResponse.ok) {
        throw new Error("生成品牌资产失败");
      }

      let brandAsset = null;
      const reader = generateResponse.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const streamData = JSON.parse(line.slice(6));
                
                if (streamData.error) {
                  throw new Error(streamData.error);
                }
                
                if (streamData.status) {
                  setCurrentStep(streamData.status);
                }
                
                if (streamData.progress) {
                  setProgress(20 + (streamData.progress * 0.4)); // 20-60%
                }
                
                if (streamData.completed && streamData.data) {
                  brandAsset = streamData.data;
                }
              } catch (e) {
                // 忽略JSON解析错误
              }
            }
          }
        }
      }

      if (!brandAsset) {
        throw new Error("品牌资产生成失败");
      }

      // 使用流式API进行评估
      setCurrentStep("正在评估品牌价值...");
      setProgress(60);

      const evaluateResponse = await fetch("/api/brand/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...brandAsset, stream: true, taskId: evalTaskId }),
      });

      if (!evaluateResponse.ok) {
        throw new Error("品牌评估失败");
      }

      let evaluationResult = null;
      const evalReader = evaluateResponse.body?.getReader();

      if (evalReader) {
        while (true) {
          const { done, value } = await evalReader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const streamData = JSON.parse(line.slice(6));
                
                if (streamData.error) {
                  throw new Error(streamData.error);
                }
                
                if (streamData.status) {
                  setCurrentStep(streamData.status);
                }
                
                if (streamData.progress) {
                  setProgress(60 + (streamData.progress * 0.4)); // 60-100%
                }
                
                if (streamData.completed && streamData.data) {
                  evaluationResult = streamData.data;
                }
              } catch (e) {
                // 忽略JSON解析错误
              }
            }
          }
        }
      }

      if (!evaluationResult) {
        throw new Error("品牌评估失败");
      }

      setProgress(100);
      setCurrentStep("评估完成！");
      setEvalResult(evaluationResult);
    } catch (e: any) {
      setError(e?.message || "生成或评估失败");
    } finally {
      setLoading(false);
    }
  }

  async function monitorGenerationTask(genTaskId: string, evalTaskId: string) {
    const pollInterval = 2000; // 2秒
    const maxAttempts = 150; // 最多5分钟
    let attempts = 0;

    const poll = async () => {
      try {
        const response = await fetch(`/api/tasks/${genTaskId}`);
        const result = await response.json();
        
        if (!result.success) {
          throw new Error('任务查询失败');
        }

        const task = result.task;
        
        if (task.progress) {
          setProgress(20 + (task.progress.step / task.progress.totalSteps) * 40);
          setCurrentStep(task.progress.message || task.progress.status || '正在处理...');
        }

        if (task.status === 'completed' && task.result) {
          // 生成完成，开始评估
          await startEvaluation(task.result, evalTaskId);
        } else if (task.status === 'failed') {
          throw new Error(task.error || '生成任务失败');
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(poll, pollInterval);
        } else {
          throw new Error('生成任务超时');
        }
      } catch (error: any) {
        setError(error.message || '监控生成任务失败');
        setLoading(false);
      }
    };

    poll();
  }

  async function startEvaluation(brandAsset: any, evalTaskId: string) {
    try {
      setCurrentStep('正在评估品牌价值...');
      setProgress(60);

      const evaluateResponse = await fetch("/api/brand/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...brandAsset, stream: true, taskId: evalTaskId }),
      });

      if (!evaluateResponse.ok) {
        throw new Error("品牌评估失败");
      }

      // 开始监控评估任务
      await monitorEvaluationTask(evalTaskId, brandAsset);
    } catch (error: any) {
      setError(error.message || '开始评估失败');
      setLoading(false);
    }
  }

  async function monitorEvaluationTask(evalTaskId: string, brandAsset: any) {
    const pollInterval = 2000; // 2秒
    const maxAttempts = 150; // 最多5分钟
    let attempts = 0;

    const poll = async () => {
      try {
        const response = await fetch(`/api/tasks/${evalTaskId}`);
        const result = await response.json();
        
        if (!result.success) {
          throw new Error('评估任务查询失败');
        }

        const task = result.task;
        
        if (task.progress) {
          setProgress(60 + (task.progress.step / task.progress.totalSteps) * 40);
          setCurrentStep(task.progress.message || task.progress.status || '正在评估...');
        }

        if (task.status === 'completed' && task.result) {
          // 评估完成
          setEvalResult(task.result);
          setProgress(100);
          setCurrentStep('评估完成！');
          setLoading(false);
        } else if (task.status === 'failed') {
          throw new Error(task.error || '评估任务失败');
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(poll, pollInterval);
        } else {
          throw new Error('评估任务超时');
        }
      } catch (error: any) {
        setError(error.message || '监控评估任务失败');
        setLoading(false);
      }
    };

    poll();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-4 max-w-4xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回首页
              </Button>
            </Link>
          </div>

          {/* Progress */}
          <EvaluationProgress currentStep="result" />

          {/* Loading Animation */}
          <Card className="max-w-2xl mx-auto mt-16">
            <CardContent className="py-16">
              <div className="space-y-8">
                <div className="text-center space-y-4">
                  <div className="relative inline-flex">
                    <Sparkles className="w-16 h-16 text-primary animate-pulse" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-20 h-20 rounded-full bg-primary/20 animate-ping" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-semibold">正在生成评估报告</h2>
                  <p className="text-muted-foreground">{currentStep}</p>
                </div>

                <div className="space-y-2 max-w-md mx-auto">
                  <Progress value={progress} className="h-2" />
                  <p className="text-center text-sm text-muted-foreground">
                    {progress}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">评估失败</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => router.push("/evaluation")}>返回重试</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const brandz = evalResult?.brandz_evaluation;
  const consistency = evalResult?.consistency_evaluation;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回首页
            </Button>
          </Link>
        </div>

        {/* Progress */}
        <EvaluationProgress currentStep="result" />

        {/* Results */}
        <div className="space-y-8">
          {/* BrandZ Score Overview */}
          {brandz && (
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-3xl mb-2">
                  品牌价值评估报告
                </CardTitle>
                <CardDescription className="text-lg">
                  {evalResult?.brand_name || "您的品牌"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {/* Total Score */}
                  <Card className="text-center">
                    <CardHeader className="pb-2">
                      <Trophy className="w-8 h-8 mx-auto mb-2 text-primary" />
                      <CardTitle>BrandZ 总分</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-5xl font-bold mb-2">
                        {brandz.brandz_value?.toFixed(1) || 0}
                      </div>
                      <Badge
                        variant={
                          brandz.brandz_value >= 70 ? "default" : "secondary"
                        }
                        className="text-lg"
                      >
                        {brandz.brand_grade || "N/A"}
                      </Badge>
                    </CardContent>
                  </Card>

                  {/* Financial Value */}
                  <Card>
                    <CardHeader className="pb-2">
                      <TrendingUp className="w-6 h-6 text-green-600 mb-1" />
                      <CardTitle className="text-lg">财务价值</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold mb-2">
                        {brandz.financial_value_score?.toFixed(1) || 0}
                      </div>
                      <Progress
                        value={brandz.financial_value_score || 0}
                        className="h-2"
                      />
                    </CardContent>
                  </Card>

                  {/* Brand Contribution */}
                  <Card>
                    <CardHeader className="pb-2">
                      <Target className="w-6 h-6 text-blue-600 mb-1" />
                      <CardTitle className="text-lg">品牌贡献</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold mb-2">
                        {brandz.brand_contribution_score?.toFixed(1) || 0}
                      </div>
                      <Progress
                        value={brandz.brand_contribution_score || 0}
                        className="h-2"
                      />
                    </CardContent>
                  </Card>
                </div>

                {/* MDS Scores */}
                <div className="grid grid-cols-3 gap-4 p-6 bg-muted/20 rounded-lg">
                  <div className="text-center">
                    <p className="text-3xl font-bold">
                      {brandz.meaningful_score || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">有意义度</p>
                    <p className="text-xs text-muted-foreground">Meaningful</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">
                      {brandz.different_score || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">差异化度</p>
                    <p className="text-xs text-muted-foreground">Different</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">
                      {brandz.salient_score || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">显著度</p>
                    <p className="text-xs text-muted-foreground">Salient</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Consistency Analysis */}
          {consistency && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>品牌一致性分析</CardTitle>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">
                      {consistency.total_score?.toFixed(1) || 0}
                    </span>
                    <Badge>{consistency.grade || "N/A"}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {consistency.details?.swot_analysis && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Strengths */}
                    <Card className="border-green-200 bg-green-50/50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base text-green-700">
                          优势 Strengths
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-1 text-sm">
                          {consistency.details.swot_analysis.strengths?.map(
                            (item: string, idx: number) => (
                              <li key={idx} className="text-green-700">
                                • {item}
                              </li>
                            )
                          )}
                        </ul>
                      </CardContent>
                    </Card>

                    {/* Weaknesses */}
                    <Card className="border-red-200 bg-red-50/50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base text-red-700">
                          劣势 Weaknesses
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-1 text-sm">
                          {consistency.details.swot_analysis.weaknesses?.map(
                            (item: string, idx: number) => (
                              <li key={idx} className="text-red-700">
                                • {item}
                              </li>
                            )
                          )}
                        </ul>
                      </CardContent>
                    </Card>

                    {/* Opportunities */}
                    <Card className="border-blue-200 bg-blue-50/50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base text-blue-700">
                          机会 Opportunities
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-1 text-sm">
                          {consistency.details.swot_analysis.opportunities?.map(
                            (item: string, idx: number) => (
                              <li key={idx} className="text-blue-700">
                                • {item}
                              </li>
                            )
                          )}
                        </ul>
                      </CardContent>
                    </Card>

                    {/* Threats */}
                    <Card className="border-orange-200 bg-orange-50/50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base text-orange-700">
                          威胁 Threats
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-1 text-sm">
                          {consistency.details.swot_analysis.threats?.map(
                            (item: string, idx: number) => (
                              <li key={idx} className="text-orange-700">
                                • {item}
                              </li>
                            )
                          )}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Improvement Suggestions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-primary" />
                改进建议
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {brandz?.improvement_suggestions && (
                <div>
                  <h4 className="font-semibold mb-3">品牌价值提升建议</h4>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                      {brandz.improvement_suggestions}
                    </p>
                  </div>
                </div>
              )}
              {consistency?.final_summary && (
                <div>
                  <h4 className="font-semibold mb-3">品牌一致性改进</h4>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                      {consistency.final_summary}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 py-8">
            <Button
              onClick={() => router.push("/evaluation")}
              variant="outline"
            >
              重新评估
            </Button>
            <Button onClick={() => window.print()}>打印报告</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
