import React, { useState } from "react";
import { X, AlertCircle, Clock, User, Skull } from "lucide-react";
import type { TriageColor } from "../types";

interface TriageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (newColor: TriageColor) => void;
  currentName: string;
  currentColor: string;
}

const TriageModal: React.FC<TriageModalProps> = ({
  isOpen,
  onClose,
  onUpdate,
  currentName,
  currentColor,
}) => {
  if (!isOpen) return null;

  const [selected, setSelected] = useState<TriageColor>(
    currentColor as TriageColor
  );

  const options = [
    {
      color: "RED",
      label: "IMMEDIATE",
      icon: AlertCircle,
      style: "bg-red-100 text-red-700 border-red-500 hover:bg-red-200",
    },
    {
      color: "YELLOW",
      label: "DELAYED",
      icon: Clock,
      style:
        "bg-yellow-100 text-yellow-700 border-yellow-500 hover:bg-yellow-200",
    },
    {
      color: "GREEN",
      label: "STABLE",
      icon: User,
      style: "bg-green-100 text-green-700 border-green-500 hover:bg-green-200",
    },
    {
      color: "BLACK",
      label: "DECEASED",
      icon: Skull,
      style: "bg-gray-200 text-gray-700 border-gray-500 hover:bg-gray-300",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-md shadow-2xl border border-gray-200 dark:border-neutral-800 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-neutral-800 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Re-Assess Patient
            </h2>
            <p className="text-sm text-gray-500 dark:text-neutral-400">
              Update status for {currentName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Select New Severity Level:
          </p>
          <div className="grid grid-cols-1 gap-3">
            {options.map((opt) => (
              <button
                key={opt.color}
                onClick={() => setSelected(opt.color as TriageColor)}
                className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                  selected === opt.color
                    ? opt.style
                    : "border-transparent bg-gray-50 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-700"
                }`}
              >
                <opt.icon size={24} />
                <span className="font-bold tracking-wide">{opt.label}</span>
                {selected === opt.color && (
                  <div className="ml-auto w-3 h-3 rounded-full bg-current shadow-sm" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 dark:bg-black/50 border-t border-gray-100 dark:border-neutral-800 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onUpdate(selected)}
            className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg shadow-blue-500/20 transition-all"
          >
            Confirm Update
          </button>
        </div>
      </div>
    </div>
  );
};

export default TriageModal;
