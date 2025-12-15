import React, { useState, useEffect } from "react";
import { X, Save, ShieldCheck, Search, Loader2 } from "lucide-react";
import type { TriageTag } from "../types";
import { updatePatientDetails, verifyInsurancePolicy } from "../services/api";

interface PatientDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  triageData: TriageTag | null;
  onSave: () => void;
}

const PatientDetailsModal: React.FC<PatientDetailsModalProps> = ({
  isOpen,
  onClose,
  triageData,
  onSave,
}) => {
  // Initial Empty State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    age: 0,
    gender: "UNKNOWN",
    contactNumber: "",
    insuranceProvider: "",
    insuranceNumber: "",
    insuranceCoverage: 0,
  });

  const [verifying, setVerifying] = useState(false);
  const [saving, setSaving] = useState(false);

  // --- THE FIX: Update form when patient data changes ---
  useEffect(() => {
    if (triageData && triageData.patient) {
      setFormData({
        firstName: triageData.patient.firstName || "",
        lastName: triageData.patient.lastName || "",
        age: triageData.patient.age || 0,
        gender: triageData.patient.gender || "UNKNOWN",
        contactNumber: triageData.patient.contactNumber || "",
        insuranceProvider: triageData.patient.insuranceProvider || "",
        insuranceNumber: triageData.patient.insuranceNumber || "",
        insuranceCoverage: triageData.patient.insuranceCoverage || 0,
      });
    }
  }, [triageData]); // Dependency array ensures this runs when triageData updates

  if (!isOpen || !triageData) return null;

  const handleVerifyInsurance = async () => {
    if (!formData.insuranceNumber) return;
    setVerifying(true);
    try {
      const coverage = await verifyInsurancePolicy(
        formData.insuranceProvider,
        formData.insuranceNumber
      );
      setFormData((prev) => ({ ...prev, insuranceCoverage: coverage }));
    } catch (error) {
      console.error("Verification failed", error);
      alert("Could not verify policy. Please check the number.");
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (triageData.patient?.id) {
        await updatePatientDetails(triageData.patient.id, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          age: Number(formData.age),
          gender: formData.gender, // Now correctly sends the selected value
          contactNumber: formData.contactNumber,
          insuranceProvider: formData.insuranceProvider,
          insuranceNumber: formData.insuranceNumber,
          insuranceCoverage: Number(formData.insuranceCoverage),
        } as any);

        onSave();
        onClose();
      }
    } catch (error) {
      console.error("Failed to save patient details", error);
      alert("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-2xl shadow-2xl border border-gray-200 dark:border-neutral-800 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-neutral-800 flex justify-between items-center bg-gray-50 dark:bg-black">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Complete Patient Record
            </h2>
            <p className="text-sm text-gray-500 dark:text-neutral-400">
              ID: #{triageData.patient?.id} • Admitted:{" "}
              {new Date(triageData.assignedAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 dark:hover:bg-neutral-800 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Personal Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
              Personal Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg p-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg p-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Age
                </label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) =>
                    setFormData({ ...formData, age: parseInt(e.target.value) })
                  }
                  className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg p-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* GENDER SELECTOR */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Gender
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) =>
                    setFormData({ ...formData, gender: e.target.value })
                  }
                  className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg p-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                  <option value="UNKNOWN">Unknown</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Contact
              </label>
              <input
                type="tel"
                placeholder="+1..."
                value={formData.contactNumber}
                onChange={(e) =>
                  setFormData({ ...formData, contactNumber: e.target.value })
                }
                className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg p-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Insurance Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-blue-500 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck size={16} /> Insurance Gateway
            </h3>

            <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Provider Name
                </label>
                <select
                  value={formData.insuranceProvider}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      insuranceProvider: e.target.value,
                    })
                  }
                  className="w-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg p-2.5 text-sm text-gray-900 dark:text-white outline-none"
                >
                  <option value="">Select Provider...</option>
                  <option value="BlueCross">BlueCross</option>
                  <option value="Aetna">Aetna</option>
                  <option value="Medicare">Medicare</option>
                  <option value="UnitedHealth">UnitedHealth</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Policy Number
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="POLICY-XXXX"
                    value={formData.insuranceNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        insuranceNumber: e.target.value,
                      })
                    }
                    className="flex-1 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg p-2.5 text-sm text-gray-900 dark:text-white outline-none uppercase font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyInsurance}
                    disabled={verifying || !formData.insuranceNumber}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-3 rounded-lg flex items-center justify-center transition-colors"
                  >
                    {verifying ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <Search size={18} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="md:col-span-2 flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-lg shadow-green-500/20 transition-all disabled:opacity-70"
            >
              {saving ? (
                "Saving..."
              ) : (
                <>
                  <Save size={18} /> Update Record
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientDetailsModal;
