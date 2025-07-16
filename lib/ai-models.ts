// lib/ai-models.ts

export function getGeminiModelForPlan(plan: string): string {
  switch (plan?.toLowerCase()) {
    case "advanced":
      return "gemini-2.5-pro";
    case "pro":
      return "gemini-2.5-flash";
    case "free":
    default:
      return "gemini-2.5-pro";
  }
} 