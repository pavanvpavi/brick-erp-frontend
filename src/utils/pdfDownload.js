export function downloadPdf(blobData, filename) {
  try {
    const blob =
      blobData instanceof Blob
        ? blobData
        : new Blob([blobData], { type: "application/pdf" });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => window.URL.revokeObjectURL(url), 1000);
  } catch (err) {
    console.error("PDF download error:", err);
  }
}

export function openPdfInNewTab(blobData) {
  try {
    const blob =
      blobData instanceof Blob
        ? blobData
        : new Blob([blobData], { type: "application/pdf" });

    const url = window.URL.createObjectURL(blob);
    window.open(url, "_blank");
    setTimeout(() => window.URL.revokeObjectURL(url), 5000);
  } catch (err) {
    console.error("PDF open error:", err);
  }
}
