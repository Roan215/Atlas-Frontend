import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// FIX: Added fetchHospitalById to imports
import {
  fetchTriageFeed,
  getBillPreview,
  processDischarge,
  fetchResources,
  addItemToBill,
  removeItemFromBill,
  fetchHospitalById,
} from "../services/api";
import type { TriageTag, Bill } from "../types";
import {
  Printer,
  CheckCircle,
  ArrowLeft,
  FileText,
  CreditCard,
  Plus,
  Package,
  Trash2,
  Building2,
} from "lucide-react";

const BillingDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<TriageTag[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(
    null
  );
  const [bill, setBill] = useState<Bill | null>(null);

  // Hospital & Resource State
  const [hospitalName, setHospitalName] = useState("General Medical Center"); // Default
  const [resources, setResources] = useState<any[]>([]);
  const [selectedResource, setSelectedResource] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [addingItem, setAddingItem] = useState(false);

  const [success, setSuccess] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const id = localStorage.getItem("hospitalId");
    if (id) {
      const hospId = parseInt(id);

      // 1. Fetch Patients
      fetchTriageFeed(hospId).then((data) => {
        setPatients(data.sort((a: TriageTag, b: TriageTag) => b.id - a.id));
      });

      // 2. Fetch Real Hospital Name for Invoice
      fetchHospitalById(hospId).then((data) => {
        if (data && data.name) setHospitalName(data.name);
      });
    }
    fetchResources().then(setResources);
  }, []);

  useEffect(() => {
    if (selectedPatientId) {
      getBillPreview(selectedPatientId).then(setBill);
    } else {
      setBill(null);
    }
  }, [selectedPatientId]);

  const handleAddItem = async () => {
    if (!selectedPatientId || !selectedResource) return;
    setAddingItem(true);
    try {
      const updatedBill = await addItemToBill(
        selectedPatientId,
        parseInt(selectedResource),
        quantity
      );
      setBill(updatedBill);
      setQuantity(1);
      setSelectedResource("");
    } catch (error) {
      alert("Failed to add item");
    } finally {
      setAddingItem(false);
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    if (!confirm("Remove this item from the bill?")) return;
    try {
      const updatedBill = await removeItemFromBill(itemId);
      setBill(updatedBill);
    } catch (error) {
      alert("Failed to delete item");
    }
  };

  const handleDischarge = async () => {
    if (!selectedPatientId) return;
    setProcessing(true);
    try {
      await processDischarge(selectedPatientId);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setSelectedPatientId(null);
        setBill(null);
        const id = localStorage.getItem("hospitalId");
        if (id)
          fetchTriageFeed(parseInt(id)).then((data) =>
            setPatients(data.sort((a: TriageTag, b: TriageTag) => b.id - a.id))
          );
      }, 3000);
    } catch (err) {
      alert("Error processing discharge.");
    } finally {
      setProcessing(false);
    }
  };

  const calculateBaseFee = (currentBill: Bill) => {
    const resourcesTotal = currentBill.items
      ? currentBill.items.reduce((sum, item) => sum + item.totalPrice, 0)
      : 0;
    return currentBill.totalAmount - 100 - resourcesTotal;
  };

  if (success) {
    return (
      <div className="min-h-screen bg-emerald-600 flex flex-col items-center justify-center text-white animate-in zoom-in duration-300">
        <div className="bg-white/20 p-8 rounded-full mb-6">
          <CheckCircle size={80} />
        </div>
        <h1 className="text-4xl font-bold">Discharge Successful</h1>
        <p className="mt-2 text-xl opacity-90">Bed released & Bill archived.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white p-6 font-sans">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #invoice-printable, #invoice-printable * { visibility: visible; }
          #invoice-printable {
            position: absolute; left: 0; top: 0; width: 100%;
            margin: 0; padding: 20px; background: white !important; color: black !important;
            border: none !important; box-shadow: none !important; z-index: 9999;
          }
          .dark { background: white !important; color: black !important; }
          button, .no-print, select, input { display: none !important; }
          .delete-col { display: none !important; }
        }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between mb-8 no-print">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/er")}
            className="p-2 hover:bg-gray-200 dark:hover:bg-neutral-800 rounded-full"
          >
            <ArrowLeft />
          </button>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CreditCard className="text-blue-600" /> Billing & Discharge
          </h1>
        </div>
        <div className="text-sm text-gray-500">ATLAS RCM System</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT: Patient List */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 h-[80vh] overflow-y-auto no-print">
          <div className="p-4 border-b border-gray-100 dark:border-neutral-800 font-bold text-xs uppercase text-gray-500 tracking-wider">
            Pending Discharge ({patients.length})
          </div>
          {patients.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPatientId(p.patient.id || null)}
              className={`w-full p-4 text-left border-b border-gray-100 dark:border-neutral-800 hover:bg-blue-50 dark:hover:bg-blue-900/10 flex items-center gap-4 transition-colors ${
                selectedPatientId === p.patient.id
                  ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-600"
                  : ""
              }`}
            >
              <div
                className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-xs font-bold ${
                  p.tagColor === "RED"
                    ? "bg-rose-100 text-rose-600"
                    : p.tagColor === "YELLOW"
                    ? "bg-amber-100 text-amber-600"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {p.tagColor[0]}
              </div>
              <div className="overflow-hidden">
                <div className="font-bold text-sm truncate">
                  {p.patient.firstName} {p.patient.lastName}
                </div>
                <div className="text-xs text-gray-500">ID: #{p.patient.id}</div>
              </div>
            </button>
          ))}
        </div>

        {/* RIGHT: Invoice Preview */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* RESOURCE SELECTOR */}
          {bill && (
            <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-gray-200 dark:border-neutral-800 flex gap-4 items-center no-print shadow-sm">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl">
                <Package size={20} />
              </div>
              <select
                value={selectedResource}
                onChange={(e) => setSelectedResource(e.target.value)}
                className="flex-1 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Medical Resource...</option>
                {resources.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} (${r.unitPrice})
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                className="w-20 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleAddItem}
                disabled={!selectedResource || addingItem}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                <Plus size={16} /> Add
              </button>
            </div>
          )}

          {bill ? (
            <div
              id="invoice-printable"
              className="bg-white dark:bg-neutral-900 p-8 md:p-12 rounded-2xl border border-gray-200 dark:border-neutral-800 shadow-xl h-full flex flex-col"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-8 border-b border-gray-100 dark:border-neutral-800 pb-8">
                <div>
                  <h1 className="text-4xl font-black tracking-tighter mb-2">
                    INVOICE
                  </h1>
                  <p className="text-gray-400 text-sm font-mono">
                    INV-#
                    {bill.id ? bill.id.toString().padStart(6, "0") : "PENDING"}
                  </p>
                </div>
                <div className="text-right">
                  {/* FIX: Use Real Hospital Name */}
                  <div className="font-bold text-xl flex items-center justify-end gap-2 text-gray-900 dark:text-white">
                    <Building2
                      className="text-blue-600 print:hidden"
                      size={20}
                    />{" "}
                    {hospitalName}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Emergency Department
                  </div>
                  <div className="text-[10px] uppercase font-bold text-gray-400 mt-2">
                    Powered by ATLAS System
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {new Date().toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Patient Info */}
              <div className="bg-gray-50 dark:bg-neutral-800/50 p-6 rounded-xl mb-8 flex justify-between print:bg-gray-100 print:text-black">
                <div>
                  <div className="text-xs text-gray-400 font-bold uppercase mb-1">
                    Billed To
                  </div>
                  <div className="font-bold text-lg">
                    {bill.patient?.firstName} {bill.patient?.lastName}
                  </div>
                  <div className="text-sm text-gray-500">
                    {bill.patient?.contactNumber || "No Contact Info"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400 font-bold uppercase mb-1">
                    Insurance
                  </div>
                  {bill.patient?.insuranceProvider ? (
                    <>
                      <div className="font-bold text-lg text-blue-600 dark:text-blue-400 print:text-black">
                        {bill.patient.insuranceProvider}
                      </div>
                      <div className="text-sm text-gray-500">
                        Policy: {bill.patient.insuranceNumber}
                      </div>
                    </>
                  ) : (
                    <div className="font-bold text-lg text-gray-400">
                      Self Pay
                    </div>
                  )}
                </div>
              </div>

              {/* Line Items */}
              <table className="w-full mb-8 text-sm">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-gray-200 dark:border-neutral-700">
                    <th className="pb-3 font-bold uppercase text-xs">
                      Description
                    </th>
                    <th className="pb-3 text-right font-bold uppercase text-xs">
                      Qty
                    </th>
                    <th className="pb-3 text-right font-bold uppercase text-xs">
                      Total
                    </th>
                    <th className="pb-3 w-10 delete-col"></th>
                  </tr>
                </thead>
                <tbody className="font-medium">
                  {/* Fixed Items */}
                  <tr className="border-b border-gray-100 dark:border-neutral-800">
                    <td className="py-4">ER Admission & Clinical Services</td>
                    <td className="py-4 text-right">1</td>
                    <td className="py-4 text-right font-mono">
                      ${calculateBaseFee(bill).toFixed(2)}
                    </td>
                    <td className="delete-col"></td>
                  </tr>
                  <tr className="border-b border-gray-100 dark:border-neutral-800">
                    <td className="py-4">Ambulance Transport</td>
                    <td className="py-4 text-right">1</td>
                    <td className="py-4 text-right font-mono">$100.00</td>
                    <td className="delete-col"></td>
                  </tr>

                  {/* Dynamic Items */}
                  {bill.items &&
                    bill.items.map((item: any) => (
                      <tr
                        key={item.id}
                        className="border-b border-gray-100 dark:border-neutral-800 group"
                      >
                        <td className="py-4 text-blue-600 dark:text-blue-400 print:text-black">
                          {item.resource?.name || "Medical Item"}
                        </td>
                        <td className="py-4 text-right">{item.quantity}</td>
                        <td className="py-4 text-right font-mono">
                          ${(item.totalPrice || 0).toFixed(2)}
                        </td>
                        <td className="py-4 text-right delete-col">
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                            title="Remove Item"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}

                  {/* Insurance Adjustment */}
                  {bill.insuranceCoverage > 0 && (
                    <tr className="text-emerald-600 dark:text-emerald-400 print:text-black font-bold bg-emerald-50/50 dark:bg-emerald-900/10 print:bg-gray-100">
                      <td className="py-4 pl-2" colSpan={2}>
                        Insurance Adjustment ({bill.patient?.insuranceProvider})
                      </td>
                      <td className="py-4 text-right font-mono pr-2">
                        -${bill.insuranceCoverage.toFixed(2)}
                      </td>
                      <td className="delete-col"></td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Totals */}
              <div className="flex justify-end mt-auto pt-4 border-t-2 border-gray-100 dark:border-neutral-800">
                <div className="w-64">
                  <div className="flex justify-between mb-2 text-gray-500 text-sm">
                    <span>Subtotal</span>
                    <span>${bill.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-4 text-emerald-600 print:text-black text-sm font-bold">
                    <span>Total Savings</span>
                    <span>-${bill.insuranceCoverage.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-neutral-700">
                    <span className="text-xl font-black">TOTAL DUE</span>
                    <span className="text-2xl font-black text-blue-600 dark:text-blue-500 print:text-black">
                      ${bill.patientPayable.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex gap-4 justify-end mt-12 no-print">
                <button
                  onClick={() => window.print()}
                  className="px-6 py-3 border border-gray-200 dark:border-neutral-700 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
                >
                  <Printer size={18} /> Print Invoice
                </button>
                <button
                  onClick={handleDischarge}
                  disabled={processing}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {processing ? (
                    "Processing..."
                  ) : (
                    <>
                      <CheckCircle size={18} /> Process Discharge
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 dark:border-neutral-800 rounded-2xl min-h-[400px] no-print">
              <FileText size={40} className="opacity-50 mb-4" />
              <p>Select a patient to view or edit bill</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BillingDashboard;
