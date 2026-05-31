import type { Question } from "../types";

const PAGE_SIZE = 1000;

export async function fetchAllQuestions(): Promise<Question[]> {
  const api = (await import("../api/questions")).getQuestions;
  const { data } = await api({ page: 1, pageSize: PAGE_SIZE });
  return data.data;
}

const categoryLabels: Record<string, string> = {
  FUNDAMENTAL: "基础八股",
  PROJECT: "项目深挖",
  SCENARIO: "场景题",
  COMPREHENSIVE: "综合题",
};

function buildMd(questions: Question[]): string {
  const lines: string[] = [];

  lines.push("# 面试题复习文档");
  lines.push("");
  lines.push(
    `> 共 ${questions.length} 题 · 导出时间 ${new Date().toLocaleString("zh-CN", { hour12: false })}`,
  );
  lines.push("");
  lines.push("---");
  lines.push("");

  questions.forEach((q, i) => {
    const answer = q.answers?.[0];

    lines.push(`## #${i + 1} ${q.title}`);
    lines.push("");
    lines.push(`**分类**: ${categoryLabels[q.category] || q.category}`);
    lines.push("");

    if (answer?.answer) {
      lines.push("### AI 推荐回答");
      lines.push("");
      lines.push(answer.answer);
      lines.push("");
    }

    if (answer?.structure?.length) {
      lines.push("### 回答结构");
      lines.push("");
      (answer.structure as Array<{ step: number; content: string }>).forEach(
        (s) => {
          lines.push(`${s.step}. ${s.content}`);
        },
      );
      lines.push("");
    }

    if (answer?.followUps?.length) {
      lines.push("### 高频追问");
      lines.push("");
      answer.followUps.forEach((f: string) => {
        lines.push(`- ${f}`);

        // Inline thread answer if available
        const threads = (answer as any)?.followUpThreads as
          | Array<{ question: string; answer: string }>
          | undefined;
        const thread = threads?.find((t) => t.question === f);
        if (thread?.answer) {
          lines.push(`  - **回答**: ${thread.answer}`);
        }
      });
      lines.push("");
    }

    if (answer?.insight) {
      lines.push("### 考察点");
      lines.push("");
      lines.push(answer.insight);
      lines.push("");
    }

    // Remaining threads not linked to follow-ups
    const threads = (answer as any)?.followUpThreads as
      | Array<{ question: string; answer: string }>
      | undefined;
    const followUpQuestions = new Set(answer?.followUps || []);
    const remainingThreads =
      threads?.filter((t) => !followUpQuestions.has(t.question)) || [];
    if (remainingThreads.length) {
      lines.push("### 追问记录");
      lines.push("");
      remainingThreads.forEach((t) => {
        lines.push(`**Q:** ${t.question}`);
        lines.push("");
        lines.push(t.answer);
        lines.push("");
      });
    }

    lines.push("---");
    lines.push("");
  });

  return lines.join("\n");
}

export function downloadMd(questions: Question[]) {
  const md = buildMd(questions);
  const blob = new Blob([md], { type: "text/markdown;charset=UTF-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "面试题复习文档.md";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
