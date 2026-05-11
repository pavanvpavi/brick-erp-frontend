import { useEffect, useState } from "react";
import { qualityApi, productApi, manufacturingApi } from "../../api/endpoints";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Modal from "../../components/common/Modal";
import Pagination from "../../components/common/Pagination";
import usePagination from "../../hooks/usePagination";
import toast from "react-hot-toast";
import { Plus, Eye } from "lucide-react";

const RESULT_COLORS = {
  PASS: "badge-green",
  FAIL: "badge-red",
  PARTIAL: "badge-yellow",
};

export default function QualityPage() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [productionOrders, setProductionOrders] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [viewTest, setViewTest] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    productId: "",
    productionOrderId: "",
    testDate: new Date().toISOString().split("T")[0],
    batchSize: "",
    passedQuantity: "",
    rejectedQuantity: "",
    rejectionReason: "",
    compressiveStrength: "",
    waterAbsorptionPercentage: "",
    efflorescence: "NIL",
    testedBy: "",
    notes: "",
  });

  const pagination = usePagination(tests, 10);

  const fetchTests = async () => {
    try {
      const res = await qualityApi.getAll();
      setTests(res.data.data);
    } catch {
      toast.error("Failed to load quality tests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
    productApi.getAll().then((r) => setProducts(r.data.data));
    manufacturingApi
      .getProductionOrders()
      .then((r) =>
        setProductionOrders(
          r.data.data.filter((o) => o.status === "COMPLETED"),
        ),
      );
  }, []);

  const handleChange = (field) => (e) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await qualityApi.create({
        productId: parseInt(form.productId),
        productionOrderId: form.productionOrderId
          ? parseInt(form.productionOrderId)
          : null,
        testDate: form.testDate,
        batchSize: parseInt(form.batchSize),
        passedQuantity: parseInt(form.passedQuantity),
        rejectedQuantity: parseInt(form.rejectedQuantity),
        rejectionReason: form.rejectionReason || null,
        compressiveStrength: form.compressiveStrength
          ? parseFloat(form.compressiveStrength)
          : null,
        waterAbsorptionPercentage: form.waterAbsorptionPercentage
          ? parseFloat(form.waterAbsorptionPercentage)
          : null,
        efflorescence: form.efflorescence,
        testedBy: form.testedBy,
        notes: form.notes,
      });
      toast.success("Quality test recorded");
      setShowForm(false);
      fetchTests();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setSaving(false);
    }
  };

  // Auto calculate rejected when passed is entered
  const handlePassedChange = (e) => {
    const passed = parseInt(e.target.value) || 0;
    const batch = parseInt(form.batchSize) || 0;
    setForm((p) => ({
      ...p,
      passedQuantity: e.target.value,
      rejectedQuantity:
        batch > 0 ? Math.max(0, batch - passed).toString() : p.rejectedQuantity,
    }));
  };

  if (loading) return <LoadingSpinner />;

  const avgPassRate =
    tests.length > 0
      ? (
          tests.reduce((sum, t) => sum + (t.passRate || 0), 0) / tests.length
        ).toFixed(1)
      : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title mb-0">Quality Control</h1>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} /> New Test
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          ["Total Tests", tests.length, "text-blue-600"],
          [
            "Passed",
            tests.filter((t) => t.result === "PASS").length,
            "text-green-600",
          ],
          [
            "Failed",
            tests.filter((t) => t.result === "FAIL").length,
            "text-red-600",
          ],
          ["Avg Pass Rate", `${avgPassRate}%`, "text-amber-600"],
        ].map(([label, value, color]) => (
          <div key={label} className="card text-center">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="table-header">Test #</th>
                <th className="table-header">Product</th>
                <th className="table-header">Date</th>
                <th className="table-header">Batch Size</th>
                <th className="table-header">Passed</th>
                <th className="table-header">Rejected</th>
                <th className="table-header">Pass Rate</th>
                <th className="table-header">Result</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagination.paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-gray-400">
                    No tests recorded
                  </td>
                </tr>
              ) : (
                pagination.paginatedData.map((t) => (
                  <tr key={t.id} className="border-b hover:bg-gray-50">
                    <td className="table-cell font-mono text-xs font-semibold">
                      {t.testNumber}
                    </td>
                    <td className="table-cell font-medium">{t.productName}</td>
                    <td className="table-cell">{t.testDate}</td>
                    <td className="table-cell">{t.batchSize}</td>
                    <td className="table-cell text-green-600">
                      {t.passedQuantity}
                    </td>
                    <td className="table-cell text-red-600">
                      {t.rejectedQuantity}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-green-500 h-1.5 rounded-full"
                            style={{ width: `${t.passRate}%` }}
                          />
                        </div>
                        <span className="text-xs">
                          {t.passRate?.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className={RESULT_COLORS[t.result] || "badge-gray"}>
                        {t.result}
                      </span>
                    </td>
                    <td className="table-cell">
                      <button
                        onClick={() => setViewTest(t)}
                        className="text-gray-400 hover:text-blue-600"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          pageSize={pagination.pageSize}
          onPageChange={pagination.goToPage}
          hasNext={pagination.hasNext}
          hasPrev={pagination.hasPrev}
        />
      </div>

      {/* New Test Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title="Record Quality Test"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product *
              </label>
              <select
                className="input-field"
                value={form.productId}
                onChange={handleChange("productId")}
                required
              >
                <option value="">Select product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Production Order
              </label>
              <select
                className="input-field"
                value={form.productionOrderId}
                onChange={handleChange("productionOrderId")}
              >
                <option value="">None</option>
                {productionOrders.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.productionNumber}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Test Date *
              </label>
              <input
                type="date"
                className="input-field"
                required
                value={form.testDate}
                onChange={handleChange("testDate")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Batch Size *
              </label>
              <input
                type="number"
                className="input-field"
                min="1"
                required
                value={form.batchSize}
                onChange={handleChange("batchSize")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Passed Quantity *
              </label>
              <input
                type="number"
                className="input-field"
                min="0"
                required
                value={form.passedQuantity}
                onChange={handlePassedChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rejected Quantity *
              </label>
              <input
                type="number"
                className="input-field"
                min="0"
                required
                value={form.rejectedQuantity}
                onChange={handleChange("rejectedQuantity")}
              />
            </div>
          </div>

          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Brick Specific Tests
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Compressive Strength (N/mm²)
              </label>
              <input
                type="number"
                className="input-field"
                step="0.01"
                value={form.compressiveStrength}
                onChange={handleChange("compressiveStrength")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Water Absorption %
              </label>
              <input
                type="number"
                className="input-field"
                step="0.01"
                value={form.waterAbsorptionPercentage}
                onChange={handleChange("waterAbsorptionPercentage")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Efflorescence
              </label>
              <select
                className="input-field"
                value={form.efflorescence}
                onChange={handleChange("efflorescence")}
              >
                {["NIL", "SLIGHT", "MODERATE", "HEAVY"].map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tested By
              </label>
              <input
                type="text"
                className="input-field"
                value={form.testedBy}
                onChange={handleChange("testedBy")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rejection Reason
              </label>
              <input
                type="text"
                className="input-field"
                value={form.rejectionReason}
                onChange={handleChange("rejectionReason")}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                className="input-field"
                rows={2}
                value={form.notes}
                onChange={handleChange("notes")}
              />
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? "Saving..." : "Record Test"}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Test Modal */}
      <Modal
        isOpen={!!viewTest}
        onClose={() => setViewTest(null)}
        title={`Test ${viewTest?.testNumber}`}
        size="lg"
      >
        {viewTest && (
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              ["Product", viewTest.productName],
              ["Production Order", viewTest.productionNumber || "—"],
              ["Test Date", viewTest.testDate],
              ["Result", viewTest.result],
              ["Batch Size", viewTest.batchSize],
              ["Passed", viewTest.passedQuantity],
              ["Rejected", viewTest.rejectedQuantity],
              ["Pass Rate", `${viewTest.passRate?.toFixed(1)}%`],
              [
                "Compressive Strength",
                viewTest.compressiveStrength
                  ? `${viewTest.compressiveStrength} N/mm²`
                  : "—",
              ],
              [
                "Water Absorption",
                viewTest.waterAbsorptionPercentage
                  ? `${viewTest.waterAbsorptionPercentage}%`
                  : "—",
              ],
              ["Efflorescence", viewTest.efflorescence || "—"],
              ["Tested By", viewTest.testedBy || "—"],
            ].map(([label, value]) => (
              <div key={label} className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-500 text-xs mb-1">{label}</p>
                <p className="font-medium">{value}</p>
              </div>
            ))}
            {viewTest.rejectionReason && (
              <div className="col-span-2 bg-red-50 rounded-lg p-3">
                <p className="text-red-500 text-xs mb-1">Rejection Reason</p>
                <p className="font-medium text-red-700">
                  {viewTest.rejectionReason}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
