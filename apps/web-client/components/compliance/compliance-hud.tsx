"use client";

import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { checkCompliance } from "@/lib/compliance/forbidden-words";

interface ComplianceHUDProps {
  text: string;
  className?: string;
}

export function ComplianceHUD({ text, className = "" }: ComplianceHUDProps) {
  if (!text) {
    return null;
  }

  const { score, violations } = checkCompliance(text);

  const getStatusColor = () => {
    if (score >= 80) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getStatusIcon = () => {
    if (score >= 80) return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    if (score >= 50)
      return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    return <XCircle className="h-5 w-5 text-red-600" />;
  };

  const getStatusLabel = () => {
    if (score >= 80) return "Aprovado";
    if (score >= 50) return "Atenção";
    return "Bloqueado";
  };

  return (
    <Card
      className={`border-l-4 ${score >= 80 ? "border-l-green-500" : score >= 50 ? "border-l-yellow-500" : "border-l-red-500"} ${className}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            {getStatusIcon()}
            Compliance OAB
          </CardTitle>
          <Badge
            variant={
              score >= 80
                ? "default"
                : score >= 50
                  ? "secondary"
                  : "destructive"
            }
            className="text-xs"
          >
            {getStatusLabel()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-600">Score de Risco</span>
            <span className={`text-lg font-bold ${getStatusColor()}`}>
              {score}/100
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                score >= 80
                  ? "bg-green-500"
                  : score >= 50
                    ? "bg-yellow-500"
                    : "bg-red-500"
              }`}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>

        {violations.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-700">
              Violações Detectadas ({violations.length}):
            </p>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {violations.map((violation, index) => (
                <div
                  key={index}
                  className="text-xs bg-red-50 border border-red-200 rounded p-2"
                >
                  <div className="font-medium text-red-800">
                    "{violation.match}"
                  </div>
                  <div className="text-red-600 mt-1">
                    💡 Sugestão: "{violation.suggestion}"
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {score >= 80 && violations.length === 0 && (
          <div className="text-xs text-green-700 bg-green-50 border border-green-200 rounded p-2">
            ✅ Texto em conformidade com as regras da OAB
          </div>
        )}
      </CardContent>
    </Card>
  );
}
