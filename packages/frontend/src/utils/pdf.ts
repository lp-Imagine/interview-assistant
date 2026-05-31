import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export async function downloadPdf(filename: string, htmlContent: string) {
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.top = "0";
  container.style.width = "750px";
  container.style.padding = "40px";
  container.style.fontFamily =
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  container.style.fontSize = "15px";
  container.style.lineHeight = "1.8";
  container.style.color = "#334155";
  container.style.background = "white";

  container.innerHTML = htmlContent;

  const style = document.createElement("style");
  style.textContent = `
    h2 { font-size: 20px; font-weight: 700; margin: 20px 0 10px; color: #0f172a; }
    h3 { font-size: 17px; font-weight: 600; margin: 16px 0 8px; color: #1e293b; }
    p { margin: 8px 0; }
    ul, ol { margin: 8px 0; padding-left: 24px; }
    li { margin: 4px 0; }
    code { background: #e2e8f0; padding: 2px 8px; border-radius: 6px; font-size: 13px; font-family: 'SF Mono', 'Fira Code', monospace; color: #c7254e; }
    pre { background: #f6f8fa; border-radius: 12px; padding: 18px 20px; overflow-x: auto; }
    pre code { background: transparent; color: #1f2328; padding: 0; font-size: 13px; line-height: 1.7; }
    strong { font-weight: 700; color: #0f172a; }
    blockquote { border-left: 4px solid #2563eb; padding: 8px 16px; margin: 12px 0; background: #eff6ff; border-radius: 0 10px 10px 0; color: #475569; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0; }
    th, td { border: 1px solid #e2e8f0; padding: 10px 14px; text-align: left; }
    th { background: #f1f5f9; font-weight: 600; }
    hr { border: none; border-top: 1px solid #e2e8f0; margin: 24px 0; }
  `;
  container.appendChild(style);
  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth - 40;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 20;

    pdf.addImage(imgData, "PNG", 20, position, imgWidth, imgHeight);
    heightLeft -= pageHeight - 40;

    while (heightLeft > 0) {
      position = 20 - (imgHeight - heightLeft);
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 20, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - 40;
    }

    pdf.save(filename);
  } finally {
    document.body.removeChild(container);
  }
}
