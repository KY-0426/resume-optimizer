// 简历导出工具

// 将Markdown转换为HTML（简化版）
function markdownToHtml(markdown: string): string {
  let html = markdown
    // 标题
    .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold mt-6 mb-3 border-b pb-2">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold text-center mb-4">$1</h1>')
    // 粗体
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // 列表
    .replace(/^- (.*$)/gm, '<li class="ml-4 mb-1">$1</li>')
    // 换行
    .replace(/\n\n/g, '</p><p class="mb-2">')
    .replace(/\n/g, '<br>');

  return `<div class="prose">${html}</div>`;
}

// 导出为PDF（通过打印）
export function exportToPdf(content: string, filename: string = "简历") {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('请允许弹出窗口以导出PDF');
    return;
  }

  const html = markdownToHtml(content);

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${filename}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          padding: 40px;
          max-width: 800px;
          margin: 0 auto;
        }
        h1 { font-size: 24px; margin-bottom: 16px; }
        h2 { font-size: 18px; margin-top: 24px; margin-bottom: 12px; border-bottom: 1px solid #eee; padding-bottom: 8px; }
        h3 { font-size: 16px; margin-top: 16px; margin-bottom: 8px; }
        p { margin-bottom: 8px; }
        li { margin-left: 20px; margin-bottom: 4px; }
        strong { font-weight: 600; }
        .header { text-align: center; margin-bottom: 24px; }
        @media print {
          body { padding: 20px; }
          @page { margin: 1cm; }
        }
      </style>
    </head>
    <body>
      ${html}
    </body>
    </html>
  `);

  printWindow.document.close();

  // 等待内容加载后打印
  setTimeout(() => {
    printWindow.print();
  }, 500);
}

// 导出为Word（.doc格式）
export function exportToWord(content: string, filename: string = "简历") {
  const html = markdownToHtml(content);

  const htmlContent = `
    <!DOCTYPE html>
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:w="urn:schemas-microsoft-com:office:word"
          xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="UTF-8">
      <title>${filename}</title>
      <style>
        body { font-family: "微软雅黑", sans-serif; line-height: 1.6; }
        h1 { font-size: 24px; margin-bottom: 16px; }
        h2 { font-size: 18px; margin-top: 24px; border-bottom: 1px solid #ccc; }
        h3 { font-size: 16px; margin-top: 16px; }
        li { margin-left: 20px; margin-bottom: 4px; }
      </style>
    </head>
    <body>
      ${html}
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff' + htmlContent], {
    type: 'application/msword'
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// 导出为纯文本
export function exportToTxt(content: string, filename: string = "简历") {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// 复制到剪贴板
export async function copyToClipboard(content: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(content);
    return true;
  } catch {
    // 降级方案
    const textarea = document.createElement('textarea');
    textarea.value = content;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  }
}