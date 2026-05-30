export function downloadPdf(blobData, filename) {
  const url = window.URL.createObjectURL(
    new Blob([blobData], { type: "application/pdf" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
