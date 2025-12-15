import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchTriageFeed,
  getBillPreview,
  processDischarge,
} from "../services/api";
import type { TriageTag, Bill } from "../types";
import {
  Printer,
  CheckCircle,
  ArrowLeft,
  FileText,
  LayoutDashboard,
  CreditCard,
} from "lucide-react";

const BillingDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<TriageTag[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(
    null
  );
  const [bill, setBill] = useState<Bill | null>(null);
  const [success, setSuccess] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const id = localStorage.getItem("hospitalId");
    if (id) fetchTriageFeed(parseInt(id)).then(setPatients);
  }, []);

  useEffect(() => {
    if (selectedPatientId) {
      getBillPreview(selectedPatientId).then(setBill);
    } else {
      setBill(null);
    }
  }, [selectedPatientId]);

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
        if (id) fetchTriageFeed(parseInt(id)).then(setPatients);
      }, 3000);
    } catch (err) {
      alert("Error processing discharge.");
    } finally {
      setProcessing(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-emerald-600 flex flex-col items-center justify-center text-white animate-in zoom-in duration-300">
        <CheckCircle size={80} className="mb-4" />
        <h1 className="text-4xl font-bold">Discharge Successful</h1>
        <p className="mt-2 text-xl opacity-90">Bed released & Bill archived.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white p-6 font-sans">
      {/* --- AGGRESSIVE PRINT STYLES --- */}
      <style>{`
        @media print {
          /* 1. Hide everything by default */
          body * {
            visibility: hidden;
          }
          /* 2. Un-hide the invoice and its children */
          #invoice-printable, #invoice-printable * {
            visibility: visible;
          }
          /* 3. Position the invoice to fill the page */
          #invoice-printable {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
            background: white !important;
            color: black !important;
            border: none !important;
            box-shadow: none !important;
            z-index: 9999;
          }
          /* 4. Kill Dark Mode Colors */
          .dark {
            background: white !important;
            color: black !important;
          }
          /* 5. Hide Buttons explicitly to be safe */
          button { display: none !important; }
        }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
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
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 h-[80vh] overflow-y-auto">
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
        <div className="lg:col-span-2">
          {bill ? (
            // Added ID="invoice-printable" here for the CSS hook
            <div
              id="invoice-printable"
              className="bg-white dark:bg-neutral-900 p-8 md:p-12 rounded-2xl border border-gray-200 dark:border-neutral-800 shadow-xl h-full flex flex-col"
            >
              {/* Invoice Header */}
              <div className="flex justify-between items-start mb-8 border-b border-gray-100 dark:border-neutral-800 pb-8">
                <div>
                  <h1 className="text-4xl font-black tracking-tighter mb-2">
                    INVOICE
                  </h1>
                  <p className="text-gray-400 text-sm font-mono">
                    INV-#{Date.now().toString().slice(-6)}
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-bold text-xl flex items-center justify-end gap-2">
                    <LayoutDashboard className="text-blue-600" size={20} />{" "}
                    ATLAS Hospital
                  </div>
                  <div className="text-sm text-gray-500">
                    Metroville Medical Center
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date().toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Patient & Insurance */}
              <div className="bg-gray-50 dark:bg-neutral-800/50 p-6 rounded-xl mb-8 flex justify-between print:bg-gray-100">
                <div>
                  <div className="text-xs text-gray-400 font-bold uppercase mb-1">
                    Billed To
                  </div>
                  <div className="font-bold text-lg">
                    {bill.patient.firstName} {bill.patient.lastName}
                  </div>
                  <div className="text-sm text-gray-500">
                    {bill.patient.contactNumber}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400 font-bold uppercase mb-1">
                    Insurance
                  </div>
                  {bill.patient.insuranceProvider ? (
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

              {/* Line Items Table */}
              <table className="w-full mb-8 text-sm">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-gray-200 dark:border-neutral-700">
                    <th className="pb-3 font-bold uppercase text-xs">
                      Description
                    </th>
                    <th className="pb-3 text-right font-bold uppercase text-xs">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="font-medium">
                  <tr className="border-b border-gray-100 dark:border-neutral-800">
                    <td className="py-4">
                      Emergency Room Admission (Base Fee)
                    </td>
                    <td className="py-4 text-right font-mono">$500.00</td>
                  </tr>
                  <tr className="border-b border-gray-100 dark:border-neutral-800">
                    <td className="py-4">
                      Triage Services & Stabilization
                      <span className="ml-2 text-xs bg-gray-100 dark:bg-neutral-800 px-2 py-0.5 rounded text-gray-500 print:border print:border-gray-300">
                        {bill.totalAmount > 500
                          ? "CRITICAL CARE"
                          : "STANDARD CARE"}
                      </span>
                    </td>
                    <td className="py-4 text-right font-mono">
                      ${(bill.totalAmount - 500).toFixed(2)}
                    </td>
                  </tr>

                  {bill.insuranceCoverage > 0 && (
                    <tr className="text-emerald-600 dark:text-emerald-400 print:text-black font-bold bg-emerald-50/50 dark:bg-emerald-900/10 print:bg-gray-100">
                      <td className="py-4 pl-2">
                        Insurance Adjustment ({bill.patient.insuranceProvider})
                      </td>
                      <td className="py-4 text-right font-mono pr-2">
                        -${bill.insuranceCoverage.toFixed(2)}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Totals Section */}
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

              {/* Actions Footer */}
              <div className="flex gap-4 justify-end mt-12">
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
            <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 dark:border-neutral-800 rounded-2xl min-h-[400px]">
              <div className="w-20 h-20 bg-gray-50 dark:bg-neutral-900 rounded-full flex items-center justify-center mb-4">
                <FileText size={40} className="opacity-50" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                No Invoice Selected
              </h3>
              <p className="text-sm">Select a patient to generate bill.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BillingDashboard;
