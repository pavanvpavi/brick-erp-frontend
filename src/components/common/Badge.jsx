export default function Badge({ label, type = "gray" }) {
  const types = {
    green: "badge-green",
    yellow: "badge-yellow",
    red: "badge-red",
    blue: "badge-blue",
    gray: "badge-gray",
  };
  return <span className={types[type] || "badge-gray"}>{label}</span>;
}
