import React, { useState } from "react";
import { X, AlertTriangle, HelpCircle } from "lucide-react";
import type { TriageColor } from "../types";
import clsx from "clsx";

interface TriageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (color: TriageColor) => void;
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
  const [confirmStep, setConfirmStep] = useState(0);
  const [pendingColor, setPendingColor] = useState<TriageColor | null>(null);

  if (!isOpen) return null;

  const handleColorClick = (newColor: TriageColor) => {
    if (currentColor === "BLACK" && newColor !== "BLACK") {
      setPendingColor(newColor);
      setConfirmStep(1);
    } else {
      onUpdate(newColor);
    }
  };

  const handleConfirmNext = () => {
    if (confirmStep === 1) {
      setConfirmStep(2);
    } else if (confirmStep === 2 && pendingColor) {
      onUpdate(pendingColor);
      setConfirmStep(0);
    }
  };

  const handleCancel = () => {
    setConfirmStep(0);
    setPendingColor(null);
  };

  const renderContent = () => {
    // STEP 1: "Are you sure?"
    if (confirmStep === 1) {
      return (
        <div className="text-center py-6 animate-in slide-in-from-bottom-2">
          <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-600 dark:text-amber-500">
            <HelpCircle size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Are you sure about that?
          </h3>
          <p className="text-gray-500 mb-8">
            Changing status from <strong>DECEASED</strong> is highly unusual.
          </p>

          <div className="flex gap-3 justify-center">
            <button
              onClick={handleCancel}
              // FIX: Added 'text-gray-700 dark:text-white' below
              className="px-6 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 font-bold text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
            >
              No, Cancel
            </button>
            <button
              onClick={handleConfirmNext}
              className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-lg shadow-amber-500/20 transition-colors"
            >
              Yes, I'm Sure
            </button>
          </div>
        </div>
      );
    }

    // STEP 2: "Really really sure?"
    if (confirmStep === 2) {
      return (
        <div className="text-center py-6 animate-in zoom-in duration-300">
          <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-600 dark:text-rose-500 animate-pulse">
            <AlertTriangle size={32} />
          </div>
          <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">
            Are you really, really sure?
          </h3>
          <p className="text-gray-500 mb-8">
            This action will reactivate the patient record and affect
            billing/census.
          </p>

          <div className="flex gap-3 justify-center">
            <button
              onClick={handleCancel}
              // FIX: Added 'text-gray-700 dark:text-white' below
              className="px-6 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 font-bold text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
            >
              Wait, Go Back
            </button>
            <button
              onClick={handleConfirmNext}
              className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-lg shadow-rose-600/30 transition-colors"
            >
              Yes, Confirm Update
            </button>
          </div>
        </div>
      );
    }

    // STEP 0: Normal Selection
    return (
      <div className="grid grid-cols-2 gap-4">
        {[
          {
            id: "RED",
            label: "IMMEDIATE",
            desc: "Life-threatening",
            color:
              "bg-rose-100 text-rose-800 border-rose-200 hover:border-rose-500 dark:bg-rose-900/20 dark:text-rose-200 dark:border-rose-900",
          },
          {
            id: "YELLOW",
            label: "DELAYED",
            desc: "Serious, not critical",
            color:
              "bg-amber-100 text-amber-800 border-amber-200 hover:border-amber-500 dark:bg-amber-900/20 dark:text-amber-200 dark:border-amber-900",
          },
          {
            id: "GREEN",
            label: "STABLE",
            desc: "Minor injuries",
            color:
              "bg-emerald-100 text-emerald-800 border-emerald-200 hover:border-emerald-500 dark:bg-emerald-900/20 dark:text-emerald-200 dark:border-emerald-900",
          },
          {
            id: "BLACK",
            label: "DECEASED",
            desc: "No signs of life",
            color:
              "bg-gray-100 text-gray-800 border-gray-200 hover:border-gray-500 dark:bg-neutral-800 dark:text-gray-300 dark:border-neutral-700",
          },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => handleColorClick(item.id as TriageColor)}
            className={clsx(
              "p-4 rounded-xl border-2 text-left transition-all active:scale-95 flex flex-col justify-between h-24",
              item.color,
              currentColor === item.id
                ? "ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-black"
                : "opacity-80 hover:opacity-100"
            )}
          >
            <span className="font-black text-lg tracking-tight">
              {item.label}
            </span>
            <span className="text-xs opacity-75 font-medium">{item.desc}</span>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-neutral-900 rounded-3xl w-full max-w-lg shadow-2xl border border-gray-200 dark:border-neutral-800 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-neutral-800 flex justify-between items-center bg-gray-50 dark:bg-black">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Update Status
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Patient: {currentName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 dark:hover:bg-neutral-800 rounded-full transition-colors"
          >
            <X className="text-gray-500" />
          </button>
        </div>

        <div className="p-6">{renderContent()}</div>
      </div>
    </div>
  );
};

export default TriageModal;
