"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Send, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EvaluationProgress } from "@/components/ui/evaluation-progress";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function EvaluationPage() {
  const router = useRouter();
  const [partial, setPartial] = useState<any>({});
  const [isReady, setIsReady] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "你好！我是你的品牌评估助手。\n\n请先告诉我您的品牌名称，以及用一句话描述您的品牌是做什么的？",
    },
  ]);

  async function proceedToResults() {
    try {
      // 创建品牌评估任务
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "brand_evaluation",
          input: {
            partial: {
              ...partial,
              brand_name:
                partial.brand_name ||
                messages.find((m) => m.role === "user")?.content ||
                "Brand",
            },
            messages,
            isReady,
          },
        }),
      });

      if (response.ok) {
        const { taskId } = await response.json();
        setCurrentTaskId(taskId);

        // 开始生成和评估流程
        startEvaluationProcess(taskId);
        // 保存数据并跳转到结果页面
        sessionStorage.setItem(
          "evaluationData",
          JSON.stringify({
            partial: {
              ...partial,
              brand_name:
                partial.brand_name ||
                messages.find((m) => m.role === "user")?.content ||
                "Brand",
            },
            messages,
            isReady,
            taskId,
          })
        );

        router.push(`/task/${taskId}`);
      } else {
        throw new Error("Failed to create task");
      }
    } catch (error) {
      console.error("Error in evaluation process:", error);
      alert("评估过程中出现错误，请重试");
    }
  }

  async function startEvaluationProcess(taskId: string) {
    try {
      // 1. 生成品牌资产
      const brandContent = messages
        .filter((m) => m.role === "user")
        .map((m) => m.content)
        .join("\n");

      if (!brandContent.trim()) {
        throw new Error("缺少品牌描述内容");
      }

      const genResponse = await fetch("/api/brand/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: brandContent,
          taskId: taskId,
        }),
      });

      if (!genResponse.ok) {
        throw new Error("品牌资产生成失败");
      }

      const genResult = await genResponse.json();

      // 2. 开始评估
      const evalResponse = await fetch("/api/brand/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...genResult.data,
          stream: true,
          taskId: taskId,
        }),
      });

      if (!evalResponse.ok) {
        throw new Error("品牌评估失败");
      }
    } catch (error: any) {
      console.error("Evaluation process error:", error);
      throw error;
    }
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // 尝试从用户输入中提取品牌名称
    const userInput = input.trim();
    if (!partial.brand_name && messages.length <= 2) {
      const brandNameMatch = userInput.match(
        /(?:我的品牌|品牌名称|名字是|叫做?)[：:]*\s*(.+?)(?:[,，。]|$)/
      );
      if (brandNameMatch) {
        setPartial((prev: any) => ({
          ...prev,
          brand_name: brandNameMatch[1].trim(),
        }));
      } else if (messages.length === 1 && userInput.length < 20) {
        // 如果是第一次回复且输入较短，可能就是品牌名
        setPartial((prev: any) => ({ ...prev, brand_name: userInput }));
      }
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userInput,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Call the chat API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          partial,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      // Read the SSE stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = "";

      // Create a temporary message for streaming
      const tempMessageId = (Date.now() + 1).toString();
      setMessages((prev) => [
        ...prev,
        {
          id: tempMessageId,
          role: "assistant",
          content: "",
        },
      ]);

      if (reader) {
        let buffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine === "" || trimmedLine === "data: [DONE]") continue;

            if (trimmedLine.startsWith("data: ")) {
              try {
                const data = JSON.parse(trimmedLine.slice(6));
                if (data.content) {
                  accumulatedContent += data.content;
                  // Update the streaming message
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === tempMessageId
                        ? { ...msg, content: accumulatedContent }
                        : msg
                    )
                  );
                }
              } catch (e) {
                console.error("Error parsing SSE data:", e);
              }
            }
          }
        }
      }

      // Check if ready for evaluation
      if (accumulatedContent.includes("[READY_FOR_EVALUATION]")) {
        setIsReady(true);
        // 从消息中提取品牌信息
        const brandNameMatch = accumulatedContent.match(/品牌名称[：:]\s*(.+)/);
        if (brandNameMatch) {
          setPartial((prev: any) => ({
            ...prev,
            brand_name: brandNameMatch[1],
          }));
        }
      }
    } catch (error) {
      console.error("Error:", error);
      // Remove the temporary message on error
      setMessages((prev) => prev.filter((msg) => msg.content !== ""));
    } finally {
      setIsLoading(false);
    }
  };

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


        {/* Chat Interface */}
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>品牌咨询</CardTitle>
            <CardDescription>
              请告诉我关于您品牌的信息，我会引导您完成评估所需的资料收集
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[500px] flex flex-col">
              <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 bg-muted/10 rounded-lg">
                {messages.map((message) => {
                  const content = message.content
                    .replace("[READY_FOR_EVALUATION]", "")
                    .trim();
                  return (
                    <div
                      key={message.id}
                      className={cn(
                        "flex",
                        message.role === "assistant"
                          ? "justify-start"
                          : "justify-end"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[80%] rounded-lg px-4 py-3",
                          message.role === "assistant"
                            ? "bg-muted"
                            : "bg-primary text-primary-foreground"
                        )}
                      >
                        <p className="text-sm whitespace-pre-wrap">{content}</p>
                      </div>
                    </div>
                  );
                })}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg px-4 py-3">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                  </div>
                )}
              </div>

              <form onSubmit={handleFormSubmit} className="flex gap-2">
                <Input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={isLoading ? "AI思考中..." : "输入您的回答..."}
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button type="submit" disabled={isLoading || !input.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>

            {isReady && (
              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  太好了！我已经收集到足够的信息。现在可以为您生成评估报告了。
                </p>
                {currentTaskId && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-medium text-blue-800 mb-1">
                      任务已创建
                    </p>
                    <p className="text-xs text-blue-600 font-mono break-all">
                      任务ID: {currentTaskId}
                    </p>
                    <p className="text-xs text-blue-500 mt-1">
                      请保存此任务ID，稍后可在首页查询评估状态
                    </p>
                  </div>
                )}
                <Button onClick={proceedToResults} size="lg">
                  查看评估结果
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
