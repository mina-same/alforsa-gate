import { useState } from "react";

export function useUrlDetection() {
  const [detectedUrl, setDetectedUrl] = useState<string | null>(null);

  const detectUrl = (text: string) => {
    const match = text.match(/(https?:\/\/[^\s]+)/);
    setDetectedUrl(match ? match[0] : null);
  };

  return { detectedUrl, setDetectedUrl, detectUrl };
}
