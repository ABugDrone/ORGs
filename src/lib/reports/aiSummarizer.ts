import type { Report, AISummary } from "@/types/reports";

function stripHtml(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}

function extractKeyPhrases(text: string, min: number, max: number): string[] {
  // Split into sentences and filter out short ones
  const sentences = text
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 20);
  
  if (sentences.length === 0) return [];
  
  // Take first few sentences as key phrases
  const count = Math.min(Math.max(min, Math.floor(sentences.length / 3)), max);
  return sentences.slice(0, count);
}

export async function generateMockSummary(report: Report): Promise<AISummary> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Handle short content
  if (report.content.length < 100) {
    return {
      reportId: report.id,
      summary: "<p>Report content is too short to summarize</p>",
      bulletPoints: [],
      generatedAt: new Date().toISOString(),
    };
  }

  // Extract text from HTML
  const text = stripHtml(report.content);
  
  // Generate bullet points (mock logic)
  const bulletPoints = extractKeyPhrases(text, 3, 5);
  
  // Format as HTML
  const summary = `
    <div class="space-y-4">
      <h3 class="font-heading font-semibold text-lg">Summary</h3>
      <ul class="list-disc list-inside space-y-2">
        ${bulletPoints.map(point => `<li>${point}</li>`).join('')}
      </ul>
      <p class="text-sm text-muted-foreground italic">
        This is a mock AI-generated summary for demonstration purposes
      </p>
    </div>
  `;

  return {
    reportId: report.id,
    summary,
    bulletPoints,
    generatedAt: new Date().toISOString(),
  };
}
