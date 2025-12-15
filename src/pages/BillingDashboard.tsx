import React, { useEffect, useState } from "react";
// Remove Layout import if you don't have it, or keep if you do.
// Assuming we are just rendering the dashboard directly for now based on previous context.
import {
  CreditCard,
  Printer,
  Search,
  Activity,
  ShieldCheck,
  Building2,
} from "lucide-react";
import clsx from "clsx";
import type { Bill, Patient } from "../types"; // Import updated types
// Import updated types

// Define missing type locally for the UI (since backend doesn't send line items yet)
interface InvoiceLineItem {
  id: number;
  resourceName: string;
  category: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  dateUsed: string;
}

const BillingDashboard: React.FC = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([]);
  const [loading, setLoading] = useState(true);

  // --- MOCK DATA COMPLIANT WITH NEW TYPES ---
  useEffect(() => {
    setTimeout(() => {
      // Create a reusable mock patient that matches the new Patient interface
      const mockPatient: Patient = {
        id: 55,
        firstName: "John",
        lastName: "Doe",
        age: 45,
        gender: "Male",
        contactNumber: "555-0123",
        address: "123 Main St",
        insuranceProvider: "BlueCross",
        insuranceNumber: "BC-998877",
      };

      const mockBills: Bill[] = [
        {
          id: 201,
          // 'billNumber' is not in the java entity we made earlier,
          // but if you added it to types.ts, keep it.
          // If TS errors here, remove 'billNumber' from this object.
          // For this example, I assume your types.ts has it or allows it.
          patient: mockPatient,
          totalAmount: 2500.0,
          insuranceCoverage: 2000.0,
          patientPayable: 500.0,
          status: "INSURANCE_PENDING", // Matches literal type
          generatedAt: new Date().toISOString(),
          dueDate: new Date(Date.now() + 86400000 * 30).toISOString(),
        } as any, // Casting to 'any' briefly to bypass strictly missing 'billNumber' if backend didn't send it
        {
          id: 202,
          patient: {
            ...mockPatient,
            id: 56,
            firstName: "Jane",
            lastName: "Smith",
          },
          totalAmount: 1250.0,
          insuranceCoverage: 0,
          patientPayable: 1250.0,
          status: "PENDING",
          generatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          dueDate: new Date(Date.now() + 86400000 * 28).toISOString(),
        } as any,
        {
          id: 203,
          patient: {
            ...mockPatient,
            id: 57,
            firstName: "Bob",
            lastName: "Wilson",
          },
          totalAmount: 450.0,
          insuranceCoverage: 0,
          patientPayable: 450.0,
          status: "PAID",
          generatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
          dueDate: new Date(Date.now() - 86400000).toISOString(),
        } as any,
      ];

      setBills(mockBills);
      setSelectedBill(mockBills[0]);

      // Mock Line Items
      setLineItems([
        {
          id: 1,
          resourceName: "ALS Ambulance Transport",
          category: "AMBULANCE",
          quantity: 1,
          unitCost: 800.0,
          totalCost: 800.0,
          dateUsed: new Date().toISOString(),
        },
        {
          id: 2,
          resourceName: "Emergency Room Visit (Lvl 3)",
          category: "ER",
          quantity: 1,
          unitCost: 1200.0,
          totalCost: 1200.0,
          dateUsed: new Date().toISOString(),
        },
      ]);
      setLoading(false);
    }, 800);
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "PENDING":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "INSURANCE_PENDING":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        Loading Billing...
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white p-4 font-sans">
      {/* Navbar Placeholder */}
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-blue-600 p-2 rounded-lg">
          <Activity className="text-white" size={24} />
        </div>
        <h1 className="text-xl font-bold">
          ATLAS <span className="text-blue-600">Billing</span>
        </h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto h-[calc(100vh-140px)]">
        {/* --- LEFT LIST --- */}
        <div className="w-full lg:w-1/3 flex flex-col gap-4">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-2xl font-bold">Invoices</h2>
            <button className="p-2 bg-white dark:bg-neutral-800 rounded-lg border dark:border-neutral-700">
              <Search size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {bills.map((bill) => (
              <div
                key={bill.id}
                onClick={() => setSelectedBill(bill)}
                className={clsx(
                  "p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden",
                  selectedBill?.id === bill.id
                    ? "bg-white dark:bg-neutral-900 border-blue-500 shadow-lg ring-1 ring-blue-500/20"
                    : "bg-white dark:bg-neutral-900/40 border-slate-200 dark:border-neutral-800 hover:border-blue-300"
                )}
              >
                {selectedBill?.id === bill.id && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
                )}

                <div className="flex justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-neutral-800 flex items-center justify-center font-bold text-slate-600 dark:text-slate-400">
                      {bill.patient.firstName[0]}
                      {bill.patient.lastName[0]}
                    </div>
                    <div>
                      <h4 className="font-bold">
                        {bill.patient.firstName} {bill.patient.lastName}
                      </h4>
                      <p className="text-xs text-slate-400">ID: #{bill.id}</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span
                    className={clsx(
                      "px-2 py-1 rounded text-[10px] font-bold border",
                      getStatusBadge(bill.status)
                    )}
                  >
                    {bill.status.replace("_", " ")}
                  </span>
                  <div className="text-right">
                    <span className="block text-sm font-bold">
                      ${bill.patientPayable.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Due {new Date(bill.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- RIGHT INVOICE --- */}
        <div className="w-full lg:w-2/3 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-slate-200 dark:border-neutral-800 flex flex-col overflow-hidden">
          {selectedBill ? (
            <>
              {/* Toolbar */}
              <div className="p-4 border-b dark:border-neutral-800 flex justify-between bg-slate-50 dark:bg-neutral-800/50">
                <button className="flex items-center gap-2 text-xs font-bold bg-white dark:bg-neutral-800 border p-2 rounded hover:bg-slate-50">
                  <Printer size={14} /> Print
                </button>
                <div className="text-xs text-slate-400 font-mono">
                  Generated:{" "}
                  {new Date(selectedBill.generatedAt).toLocaleDateString()}
                </div>
              </div>

              {/* Invoice Content */}
              <div className="flex-1 overflow-y-auto p-8 lg:p-12">
                <div className="flex justify-between items-start mb-12">
                  <div>
                    <h1 className="text-xl font-bold">
                      ATLAS{" "}
                      <span className="font-normal text-slate-400">System</span>
                    </h1>
                    <p className="text-xs text-slate-500">
                      Revenue Cycle Management
                    </p>
                  </div>
                  <div className="text-right">
                    <h2 className="text-4xl font-bold text-slate-200 dark:text-neutral-700">
                      INVOICE
                    </h2>
                    <p className="font-mono text-slate-400">
                      #{selectedBill.id}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-12 mb-12">
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                      Bill To
                    </h3>
                    <div className="font-bold">
                      {selectedBill.patient.firstName}{" "}
                      {selectedBill.patient.lastName}
                    </div>
                    <div className="text-sm text-slate-500">
                      {selectedBill.patient.address}
                      <br />
                      {selectedBill.patient.contactNumber}
                    </div>
                  </div>
                  <div className="text-right">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                      Payment
                    </h3>
                    <div className="text-2xl font-bold text-blue-600">
                      ${selectedBill.patientPayable.toFixed(2)}
                    </div>
                    <div className="text-sm text-slate-500">
                      Status: {selectedBill.status}
                    </div>
                  </div>
                </div>

                {/* Line Items */}
                <table className="w-full text-sm mb-8">
                  <thead>
                    <tr className="border-b dark:border-neutral-800 text-left text-slate-400">
                      <th className="pb-2">Description</th>
                      <th className="pb-2 text-right">Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-neutral-800">
                    {lineItems.map((item) => (
                      <tr key={item.id}>
                        <td className="py-4">
                          <span className="block font-bold">
                            {item.resourceName}
                          </span>
                          <span className="text-xs text-slate-500">
                            {item.category} •{" "}
                            {new Date(item.dateUsed).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="py-4 text-right font-mono">
                          ${item.totalCost.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Totals */}
                <div className="border-t dark:border-neutral-800 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>${selectedBill.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-blue-600">
                    <span className="flex items-center gap-1">
                      <ShieldCheck size={14} /> Insurance
                    </span>
                    <span>-${selectedBill.insuranceCoverage.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t dark:border-neutral-800 pt-2 mt-2">
                    <span>Patient Due</span>
                    <span>${selectedBill.patientPayable.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="p-4 bg-slate-50 dark:bg-neutral-900 border-t dark:border-neutral-800 flex justify-end">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2">
                  <CreditCard size={18} /> Process Payment
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <Building2 size={48} className="mx-auto mb-2 opacity-20" />
                <p>Select an invoice</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BillingDashboard;
