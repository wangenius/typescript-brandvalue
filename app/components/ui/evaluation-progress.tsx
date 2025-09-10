"use client";

import React from "react";
import { Check, MessageCircle, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface EvaluationProgressProps {
  currentStep: "consultation" | "result";
}

export function EvaluationProgress({ currentStep }: EvaluationProgressProps) {
  const steps = [
    {
      id: "consultation",
      label: "咨询",
      icon: MessageCircle,
    },
    {
      id: "result",
      label: "结果",
      icon: FileText,
    },
  ];

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-center">
        <div className="flex items-center">
          {steps.map((step, index) => {
            const isActive = step.id === currentStep;
            const isCompleted = currentStep === "result" && step.id === "consultation";
            const Icon = step.icon;

            return (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                      isActive && "bg-primary text-primary-foreground",
                      isCompleted && "bg-primary text-primary-foreground",
                      !isActive && !isCompleted && "bg-muted text-muted-foreground"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-sm mt-2",
                      isActive && "text-primary font-medium",
                      !isActive && "text-muted-foreground"
                    )}
                  >
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "w-24 h-0.5 mx-2 mb-6 transition-colors",
                      isCompleted ? "bg-primary" : "bg-muted"
                    )}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}