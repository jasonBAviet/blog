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
    /diễn đạt lại bằng ai/i,
    /diễn đạt lại/i,
    /nói túm lại/i,
    /tóm lại là/i,
    /tóm lại/i,
    /kết luận/i,
    /vài suy nghĩ sau/i,
    /vai suy nghĩ sau/i,
    /trên đây là/i,
    /bởi vậy/i
  ];

  const boundaryKeywords = [
    /luận điểm chính/i,
    /luận điểm phụ/i,
    /dẫn chứng:/i,
    /dẫn chứng/i,
    /p\/s:/i,
    /ps:/i,
    /p\.s:/i,
    /p\/s\./i,
    /ps\./i,
    /p\.s\./i,
    /hình ảnh:/i,
    /ảnh:/i,
    /nguồn:/i,
    /tài liệu tham khảo:/i,
    /update:/i
  ];

  let firstIdx = -1;
  let matchedKeyword = null;

  for (const regex of startKeywords) {
    const match = text.match(regex);
    if (match) {
      const idx = text.indexOf(match[0]);
      if (idx !== -1 && (firstIdx === -1 || idx < firstIdx)) {
        firstIdx = idx;
        matchedKeyword = match[0];
      }
    }
  }

  if (firstIdx !== -1 && matchedKeyword) {
    const rawConclusion = text.substring(firstIdx).trim();
    let endIdx = rawConclusion.length;

    for (const boundaryRegex of boundaryKeywords) {
      const match = rawConclusion.match(boundaryRegex);
      if (match) {
        const idx = rawConclusion.indexOf(match[0]);
        if (idx > matchedKeyword.length + 5 && idx < endIdx) {
          endIdx = idx;
        }
      }
    }

    return rawConclusion.substring(0, endIdx).replace(/^[-\s\*_#:]+|[-\s\*_#:]+$/g, "").trim();
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
  let matchedPs = null;
  for (const regex of psKeywords) {
    const match = text.match(regex);
    if (match) {
      const idx = text.lastIndexOf(match[0]);
      if (idx > text.length * 0.4 && idx > psIdx) {
        psIdx = idx;
        matchedPs = match[0];
      }
    }
  }

  if (psIdx !== -1 && matchedPs) {
    const rawConclusion = text.substring(psIdx).trim();
    let endIdx = rawConclusion.length;
    for (const boundaryRegex of [/hình ảnh:/i, /ảnh:/i, /nguồn:/i, /dẫn chứng:/i]) {
      const match = rawConclusion.match(boundaryRegex);
      if (match) {
        const idx = rawConclusion.indexOf(match[0]);
        if (idx > matchedPs.length + 5 && idx < endIdx) {
          endIdx = idx;
        }
      }
    }
    return rawConclusion.substring(0, endIdx).replace(/^[-\s\*_#:]+|[-\s\*_#:]+$/g, "").trim();
  }

  return "";
}

