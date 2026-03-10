import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

const A4_W = 794;  // px
const A4_H = 1123; // px

export async function downloadPdfFromHtml(
  htmlContent: string,
  filename: string
): Promise<void> {
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.left = "-10000px";
  iframe.style.top = "0";
  iframe.style.width = `${A4_W}px`;
  iframe.style.height = `${A4_H}px`;
  iframe.style.border = "none";
  iframe.style.opacity = "0";
  document.body.appendChild(iframe);

  try {
    const iframeDoc = iframe.contentDocument!;
    iframeDoc.open();
    iframeDoc.write(htmlContent);
    iframeDoc.close();
    await new Promise((r) => setTimeout(r, 500));

    const scrollH = iframeDoc.body.scrollHeight;

    // A4 1.3배 이하면 1페이지, 초과면 멀티페이지
    const isMultiPage = scrollH > A4_H * 1.3;

    // 캡처할 높이만큼 iframe 리사이즈
    const captureH = isMultiPage ? scrollH : Math.max(scrollH, A4_H);
    iframe.style.height = `${captureH + 50}px`;
    await new Promise((r) => setTimeout(r, 300));

    const canvas = await html2canvas(iframeDoc.body, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });

    const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });

    if (!isMultiPage) {
      // === 1페이지: 비율 유지하면서 A4에 맞춤 ===
      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const imgW = 210;
      const imgH = (canvas.height * 210) / canvas.width;

      if (imgH <= 297) {
        // A4 안에 들어감 - 그대로
        pdf.addImage(imgData, "JPEG", 0, 0, imgW, imgH);
      } else {
        // 약간 넘침 - 비율 유지하며 축소
        const scale = 297 / imgH;
        const scaledW = imgW * scale;
        const xOffset = (210 - scaledW) / 2;
        pdf.addImage(imgData, "JPEG", xOffset, 0, scaledW, 297);
      }
    } else {
      // === 멀티페이지 ===
      const pageH = A4_H * 2; // scale=2
      const totalPages = Math.ceil(canvas.height / pageH);

      for (let i = 0; i < totalPages; i++) {
        if (i > 0) pdf.addPage();

        const srcY = i * pageH;
        const sliceH = Math.min(pageH, canvas.height - srcY);

        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = canvas.width;
        pageCanvas.height = pageH;

        const ctx = pageCanvas.getContext("2d")!;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, pageCanvas.width, pageH);
        ctx.drawImage(canvas, 0, srcY, canvas.width, sliceH, 0, 0, canvas.width, sliceH);

        const imgData = pageCanvas.toDataURL("image/jpeg", 0.95);
        pdf.addImage(imgData, "JPEG", 0, 0, 210, 297);
      }
    }

    pdf.save(`${filename || "document"}.pdf`);
  } catch (err) {
    console.error("PDF 생성 실패:", err);
    alert("PDF 생성에 실패했습니다: " + String(err));
  } finally {
    document.body.removeChild(iframe);
  }
}
