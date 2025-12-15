import React, { useState, useEffect } from "react";
import { X, Save, ShieldCheck, Search, Loader2 } from "lucide-react";
import type { TriageTag } from "../types";
import { updatePatientDetails, searchInsuranceByName } from "../services/api";

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
  // Form State
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

  // Search State
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const [verifying, setVerifying] = useState(false);
  const [saving, setSaving] = useState(false);

  // --- INITIALIZATION FIX ---
  useEffect(() => {
    if (triageData && triageData.patient) {
      // 1. Check if the backend sent a linked Insurance Record
      // The backend structure is: patient.insuranceRecord.plan...
      const record = (triageData.patient as any).insuranceRecord;

      setFormData({
        firstName: triageData.patient.firstName || "",
        lastName: triageData.patient.lastName || "",
        age: triageData.patient.age || 0,
        gender: triageData.patient.gender || "UNKNOWN",
        contactNumber: triageData.patient.contactNumber || "",

        // FIX: Check nested object first, fallback to flat strings (if any)
        insuranceProvider:
          record?.plan?.providerName ||
          triageData.patient.insuranceProvider ||
          "",
        insuranceNumber:
          record?.policyNumber || triageData.patient.insuranceNumber || "",
        insuranceCoverage: record?.plan?.coveragePercentage
          ? record.plan.coveragePercentage * 100
          : triageData.patient.insuranceCoverage || 0,
      });

      // Pre-fill search term
      if (
        triageData.patient.firstName &&
        triageData.patient.firstName !== "Unknown"
      ) {
        setSearchTerm(triageData.patient.firstName);
      }
    }
  }, [triageData]);

  if (!isOpen || !triageData) return null;

  // --- SEARCH LOGIC ---
  const handleSearch = async () => {
    if (!searchTerm) return;
    setVerifying(true);
    setShowDropdown(false);
    try {
      const results = await searchInsuranceByName(searchTerm);
      setSearchResults(results);
      setShowDropdown(true);
      if (results.length === 0) alert("No records found with that name.");
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setVerifying(false);
    }
  };

  // --- SELECTION LOGIC ---
  const handleSelectRecord = (record: any) => {
    setFormData((prev) => ({
      ...prev,
      firstName: record.subscriberFirstName,
      lastName: record.subscriberLastName,
      age: record.subscriberAge,
      insuranceProvider: record.plan.providerName,
      insuranceNumber: record.policyNumber,
      insuranceCoverage: record.plan.coveragePercentage * 100,
    }));
    setShowDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (triageData.patient?.id) {
        // Send the updated data, including the policy number to re-link if needed
        await updatePatientDetails(triageData.patient.id, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          age: Number(formData.age),
          gender: formData.gender,
          contactNumber: formData.contactNumber,
          // We pass these for UI consistency, but the 'insuranceNumber' is what the backend uses to link
          insuranceProvider: formData.insuranceProvider,
          insuranceNumber: formData.insuranceNumber,
        });

        onSave();
        onClose();
      }
    } catch (error) {
      alert("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-2xl shadow-2xl border border-gray-200 dark:border-neutral-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-neutral-800 flex justify-between items-center bg-gray-50 dark:bg-black">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Complete Patient Record
            </h2>
            <p className="text-sm text-gray-500 dark:text-neutral-400">
              ID: #{triageData.patient?.id} • Status: {triageData.tagColor}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 dark:hover:bg-neutral-800 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="overflow-y-auto p-6">
          {/* SEARCH SECTION */}
          <div className="mb-8 bg-blue-50 dark:bg-blue-900/10 p-5 rounded-xl border border-blue-100 dark:border-blue-900/30">
            <h3 className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-2 mb-3">
              <ShieldCheck size={16} /> Insurance Lookup
            </h3>
            <div className="flex gap-2 relative">
              <input
                type="text"
                placeholder="Search Subscriber Name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <button
                type="button"
                onClick={handleSearch}
                disabled={verifying}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-lg font-bold text-sm transition-colors flex items-center gap-2"
              >
                {verifying ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Search size={16} />
                )}
                Search
              </button>

              {/* DROPDOWN RESULTS */}
              {showDropdown && searchResults.length > 0 && (
                <div className="absolute top-12 left-0 w-full bg-white dark:bg-neutral-800 rounded-xl shadow-xl border border-gray-200 dark:border-neutral-700 z-50 max-h-48 overflow-y-auto">
                  {searchResults.map((rec) => (
                    <button
                      key={rec.id}
                      type="button"
                      onClick={() => handleSelectRecord(rec)}
                      className="w-full text-left p-3 hover:bg-blue-50 dark:hover:bg-neutral-700 border-b border-gray-100 dark:border-neutral-700 last:border-0 transition-colors group"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-blue-600">
                            {rec.subscriberFirstName} {rec.subscriberLastName}
                          </div>
                          <div className="text-xs text-gray-500">
                            Age: {rec.subscriberAge} • Policy:{" "}
                            {rec.policyNumber}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold text-gray-400 uppercase">
                            Provider
                          </div>
                          <div className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                            {rec.plan.providerName}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
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
                    className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg p-2.5 text-sm dark:text-white outline-none"
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
                    className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg p-2.5 text-sm dark:text-white outline-none"
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
                      setFormData({
                        ...formData,
                        age: parseInt(e.target.value),
                      })
                    }
                    className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg p-2.5 text-sm dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) =>
                      setFormData({ ...formData, gender: e.target.value })
                    }
                    className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg p-2.5 text-sm dark:text-white outline-none"
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
                  value={formData.contactNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, contactNumber: e.target.value })
                  }
                  className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg p-2.5 text-sm dark:text-white outline-none"
                />
              </div>
            </div>

            {/* Read-Only Insurance Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                Policy Details
              </h3>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Provider
                </label>
                <input
                  type="text"
                  readOnly
                  value={formData.insuranceProvider}
                  placeholder="Search above to fill..."
                  className="w-full bg-gray-100 dark:bg-neutral-800/50 border border-gray-200 dark:border-neutral-700 rounded-lg p-2.5 text-sm text-gray-900 dark:text-white outline-none cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Policy Number
                </label>
                <input
                  type="text"
                  readOnly
                  value={formData.insuranceNumber}
                  placeholder="Search above to fill..."
                  className="w-full bg-gray-100 dark:bg-neutral-800/50 border border-gray-200 dark:border-neutral-700 rounded-lg p-2.5 text-sm text-gray-900 dark:text-white outline-none cursor-not-allowed font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Coverage Amount
                </label>
                <div className="flex items-center gap-2">
                  <div className="w-full bg-gray-200 dark:bg-neutral-700 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all duration-500"
                      style={{ width: `${formData.insuranceCoverage}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-bold">
                    {formData.insuranceCoverage}%
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
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
    </div>
  );
};

export default PatientDetailsModal;
