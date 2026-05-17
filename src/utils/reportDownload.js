export function downloadCSV(data, filename) {
  const csv = data
    .map((row) =>
      row
        .map((cell) =>
          typeof cell === "string" && cell.includes(",") ? `"${cell}"` : cell,
        )
        .join(","),
    )
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
