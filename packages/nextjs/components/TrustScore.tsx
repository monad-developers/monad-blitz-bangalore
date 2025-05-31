import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrustScoreProps {
  score: number;
  className?: string;
}

export function TrustScore({ score, className }: TrustScoreProps) {
  // Ensure score is between 0 and 100
  const normalizedScore = Math.max(0, Math.min(100, score));

  // Calculate color based on score
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500 bg-green-500/10";
    if (score >= 60) return "text-yellow-500 bg-yellow-500/10";
    if (score >= 40) return "text-orange-500 bg-orange-500/10";
    return "text-red-500 bg-red-500/10";
  };

  const scoreColor = getScoreColor(normalizedScore);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "px-3 py-1.5 rounded-lg flex items-center gap-2",
          scoreColor
        )}
      >
        <Shield className="w-4 h-4" />
        <span className="font-medium">AI Score: {normalizedScore}</span>
      </div>
    </div>
  );
}
