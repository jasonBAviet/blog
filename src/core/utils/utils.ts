export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function estimateReadingTime(content: string): number {
  const text = content.replace(/<[^>]*>/g, "");
  const wordsPerMinute = 200;
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 80);
}

export function cleanHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function extractConclusion(content: string, summary?: string): string {
  if (summary) {
    return summary;
  }
  
  const text = cleanHtml(content);
  if (!text) return "";

  const startKeywords = [
    { regex: /diễn đạt lại bằng ai/i },
    { regex: /diễn đạt lại/i },
    { regex: /nói túm lại/i },
    { regex: /tóm lại là/i },
    { regex: /tóm lại/i },
    { regex: /kết luận/i },
    { regex: /vài suy nghĩ sau/i },
    { regex: /vai suy nghĩ sau/i },
    { regex: /trên đây là/i }
  ];

  const boundaryKeywords = [
    /p\/s:/i,
    /ps:/i,
    /p\.s:/i,
    /p\/s\./i,
    /ps\./i,
    /p\.s\./i,
    /hình ảnh:/i,
    /ảnh:/i,
    /dẫn chứng:/i,
    /nguồn:/i,
    /tài liệu tham khảo:/i,
    /update:/i,
    /hết/i
  ];

  let bestIdx = -1;

  for (const item of startKeywords) {
    const match = text.match(item.regex);
    if (match) {
      const idx = text.lastIndexOf(match[0]);
      if (idx > text.length * 0.4 && idx > bestIdx) {
        bestIdx = idx;
      }
    }
  }

  if (bestIdx !== -1) {
    const rawConclusion = text.substring(bestIdx).trim();
    let endIdx = rawConclusion.length;

    for (const boundaryRegex of boundaryKeywords) {
      const match = rawConclusion.match(boundaryRegex);
      if (match) {
        const idx = rawConclusion.indexOf(match[0]);
        if (idx > 20 && idx < endIdx) {
          endIdx = idx;
        }
      }
    }

    return rawConclusion.substring(0, endIdx).replace(/^[-\s\*_]+|[-\s\*_]+$/g, "").trim();
  }

  const psKeywords = [
    /p\/s:/i,
    /ps:/i,
    /p\.s:/i,
    /p\/s\./i,
    /ps\./i,
    /p\.s\./i,
    /update:/i
  ];

  let psIdx = -1;
  for (const regex of psKeywords) {
    const match = text.match(regex);
    if (match) {
      const idx = text.lastIndexOf(match[0]);
      if (idx > text.length * 0.5 && idx > psIdx) {
        psIdx = idx;
      }
    }
  }

  if (psIdx !== -1) {
    const rawConclusion = text.substring(psIdx).trim();
    let endIdx = rawConclusion.length;
    for (const boundaryRegex of [/hình ảnh:/i, /ảnh:/i, /nguồn:/i, /dẫn chứng:/i]) {
      const match = rawConclusion.match(boundaryRegex);
      if (match) {
        const idx = rawConclusion.indexOf(match[0]);
        if (idx > 20 && idx < endIdx) {
          endIdx = idx;
        }
      }
    }
    return rawConclusion.substring(0, endIdx).replace(/^[-\s\*_]+|[-\s\*_]+$/g, "").trim();
  }

  return "";
}

