"use client";

import React from "react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock } from "lucide-react";

interface StreamingProgressProps {
  step: number;
  totalSteps: number;
  status: string;
  progress: number;
  completed?: boolean;
  data?: any;
}

export function StreamingProgress({ 
  step, 
  totalSteps, 
  status, 
  progress, 
  completed = false,
  data 
}: StreamingProgressProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            {completed ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <Clock className="w-5 h-5 text-blue-600" />
            )}
            品牌处理进度
          </span>
          <Badge variant={completed ? "default" : "secondary"}>
            {step}/{totalSteps}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{status}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        
        {data && (
          <div className="mt-4">
            <h4 className="font-medium text-sm mb-2">当前阶段结果:</h4>
            <div className="bg-muted p-3 rounded text-xs overflow-auto max-h-32">
              <pre>{JSON.stringify(data, null, 2)}</pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}