import MarkdownIt from "markdown-it";
import hljs from "highlight.js/lib/common";
import xml from "highlight.js/lib/languages/xml";

hljs.registerLanguage("vue", xml);

const escapeHtml = (str: string): string =>
  str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const md = new MarkdownIt({
  breaks: true,
  linkify: true,
});

// Custom fence renderer with copy button
const defaultFence = md.renderer.rules.fence!;
md.renderer.rules.fence = (tokens, idx, options, env, self) => {
  const token = tokens[idx];
  const lang = token.info.trim();
  const code = token.content;

  let highlighted: string;
  if (lang && hljs.getLanguage(lang)) {
    try {
      highlighted = hljs.highlight(code, {
        language: lang,
        ignoreIllegals: true,
      }).value;
    } catch {
      highlighted = escapeHtml(code);
    }
  } else {
    highlighted = escapeHtml(code);
  }

  const langLabel = lang ? `<span class="code-lang">${lang}</span>` : "";
  return (
    `<div class="code-block-wrapper">` +
    `<div class="code-block-header">${langLabel}<button class="code-copy-btn">复制代码</button></div>` +
    `<pre class="hljs"><code>${highlighted}</code></pre>` +
    `</div>`
  );
};

// Attach global click handler for copy buttons (delegation)
if (typeof document !== "undefined") {
  document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    if (!target.classList.contains("code-copy-btn")) return;
    const wrapper = target.closest(".code-block-wrapper");
    if (!wrapper) return;
    const code = wrapper.querySelector("code")?.textContent || "";
    navigator.clipboard.writeText(code).then(() => {
      target.textContent = "已复制";
      target.classList.add("copied");
      setTimeout(() => {
        target.textContent = "复制代码";
        target.classList.remove("copied");
      }, 2000);
    });
  });
}

export { md };
