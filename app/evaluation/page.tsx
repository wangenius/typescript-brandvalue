"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Send, Loader2, ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  
  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Auto-resize
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
  };
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
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" className="hover:bg-gray-200 bg-gray-100">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回
            </Button>
          </Link>
          <h1 className="text-lg font-medium text-gray-900">品牌咨询</h1>
          <div className="w-12"></div>
        </div>
      </header>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-6">
          {messages.map((message) => {
            const content = message.content
              .replace("[READY_FOR_EVALUATION]", "")
              .trim();
            return (
              <div key={message.id} className="mb-8">
                <div className={cn(
                  "flex items-start gap-3",
                  message.role === "user" ? "justify-end" : ""
                )}>
                  {/* AI Avatar - left side */}
                  {message.role === "assistant" && (
                    <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center text-white text-xs font-medium flex-shrink-0 mt-1">
                      AI
                    </div>
                  )}
                  
                  {/* Message Content */}
                  <div className={cn(
                    "max-w-[80%]",
                    message.role === "user" ? "order-first" : ""
                  )}>
                    <div className={cn(
                      "rounded-2xl px-4 py-3",
                      message.role === "assistant" 
                        ? "bg-accent text-gray-900" 
                        : "bg-gray-700 text-white"
                    )}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {content}
                      </p>
                    </div>
                  </div>

                  {/* User Avatar - right side */}
                  {message.role === "user" && (
                    <div className="w-7 h-7 rounded-full bg-gray-600 flex items-center justify-center text-white text-xs font-medium flex-shrink-0 mt-1">
                      U
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          
          {/* Loading Indicator */}
          {isLoading && (
            <div className="mb-8">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center text-white text-xs font-medium flex-shrink-0 mt-1">
                  AI
                </div>
                <div className="bg-white rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
                    <span className="text-sm text-gray-600">思考中...</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Ready for Evaluation */}
          {isReady && (
            <div className="mb-8">
              <div className="bg-green-100 rounded-2xl p-6">
                <div className="text-center">
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    信息收集完成！
                  </h3>
                  <p className="text-gray-700 mb-4">
                    我已经收集到足够的品牌信息，现在可以为您生成专业的评估报告了。
                  </p>
                  {currentTaskId && (
                    <div className="mb-4 p-3 bg-white rounded-xl">
                      <p className="font-medium text-gray-900 mb-1 text-sm">任务已创建</p>
                      <p className="text-gray-600 font-mono text-xs break-all">
                        {currentTaskId}
                      </p>
                    </div>
                  )}
                  <Button 
                    onClick={proceedToResults}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    查看评估结果
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleFormSubmit} className="flex items-end gap-3">
            <div className="flex-1">
              <textarea
                value={input}
                onChange={handleInputChange}
                placeholder={isLoading ? "AI正在思考..." : "输入您的回答..."}
                disabled={isLoading}
                className="w-full resize-none bg-gray-100 focus:bg-gray-50 border-0 focus:ring-2 focus:ring-gray-300 focus:outline-none rounded-2xl min-h-[72px] max-h-[120px] px-4 py-3 text-sm placeholder-gray-500"
                rows={3}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleFormSubmit(e);
                  }
                }}
              />
            </div>
            <Button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-2xl px-4 py-2 h-fit"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
