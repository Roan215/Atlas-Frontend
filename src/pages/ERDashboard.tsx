import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TriageModal from "../components/TriageModel";
import PatientDetailsModal from "../components/PatientDetailsModel";
import { fetchTriageFeed, fetchHospitalById } from "../services/api";
import type { Hospital, TriageTag, TriageColor } from "../types";
import { updateTriageStatus } from "../services/api";
import {
  Activity,
  Phone,
  MapPin,
  Clock,
  HeartPulse,
  User,
  Skull,
  Pencil,
  Sun,
  Moon,
} from "lucide-react";
import clsx from "clsx";

const ERDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Real Data State
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [triageList, setTriageList] = useState<TriageTag[]>([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<TriageTag | null>(
    null
  );

  // --- FIXED: Dark Mode Persistence ---
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "light") return false;
    if (stored === "dark") return true;
    return true; // Default to dark preference
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  // --- INITIALIZATION ---
  useEffect(() => {
    const storedId = localStorage.getItem("hospitalId");
    if (!storedId) {
      navigate("/");
      return;
    }
    const hospId = parseInt(storedId);

    refreshAllData(hospId);

    const interval = setInterval(() => refreshAllData(hospId), 5000);
    return () => clearInterval(interval);
  }, [navigate]);

  const refreshAllData = async (id: number) => {
    try {
      const [tags, hospData] = await Promise.all([
        fetchTriageFeed(id),
        fetchHospitalById(id),
      ]);

      // --- FIX: SORT BY NEWEST FIRST (LIFO) ---
      // We compare IDs (assuming higher ID = newer) to put the latest at the top.
      const sortedTags = tags.sort((a, b) => b.id - a.id);

      setTriageList(sortedTags);
      setHospital(hospData);
      setLoading(false);
    } catch (error) {
      console.error("Failed to sync dashboard:", error);
    }
  };

  // --- HANDLERS ---
  const handleLaneClick = (triage: TriageTag) => {
    setSelectedPatient(triage);
    setIsModalOpen(true);
  };

  const handleEditDetails = (e: React.MouseEvent, triage: TriageTag) => {
    e.stopPropagation();
    setSelectedPatient(triage);
    setIsDetailsModalOpen(true);
  };

  const handleStatusUpdate = async (newColor: TriageColor) => {
    if (!selectedPatient) return;

    // 1. Optimistic Update (Update UI instantly so it feels fast)
    setTriageList((prev) =>
      prev.map((item) =>
        item.id === selectedPatient.id ? { ...item, tagColor: newColor } : item
      )
    );
    setIsModalOpen(false);

    // 2. REAL DATABASE UPDATE
    try {
      await updateTriageStatus(selectedPatient.id, newColor);
      // Optional: Refresh data to ensure sync
      // const storedId = localStorage.getItem('hospitalId');
      // if (storedId) refreshAllData(parseInt(storedId));
    } catch (error) {
      console.error("Failed to update status in DB", error);
      alert("Connection Error: Status update might not have saved.");
    }
  };

  const handlePatientSave = () => {
    const storedId = localStorage.getItem("hospitalId");
    if (storedId) refreshAllData(parseInt(storedId));
  };

  // --- STYLES ---
  const getLaneStyles = (color: string) => {
    switch (color) {
      case "RED":
        return "bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:border-rose-900 hover:border-rose-400 dark:hover:border-rose-700";
      case "YELLOW":
        return "bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-900 hover:border-amber-400 dark:hover:border-amber-700";
      case "GREEN":
        return "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-900 hover:border-emerald-400 dark:hover:border-emerald-700";
      case "BLACK":
        return "bg-gray-100 border-gray-200 dark:bg-neutral-900 dark:border-neutral-800 hover:border-gray-400 dark:hover:border-neutral-700 grayscale";
      default:
        return "bg-white";
    }
  };

  const getBadgeStyles = (color: string) => {
    switch (color) {
      case "RED":
        return "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-200 border border-rose-200 dark:border-rose-900";
      case "YELLOW":
        return "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200 border border-amber-200 dark:border-amber-900";
      case "GREEN":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-900";
      case "BLACK":
        return "bg-gray-200 text-gray-700 dark:bg-neutral-800 dark:text-gray-400 border border-gray-300 dark:border-neutral-700";
      default:
        return "";
    }
  };

  const getStatusLabel = (color: string) => {
    switch (color) {
      case "RED":
        return "IMMEDIATE";
      case "YELLOW":
        return "DELAYED";
      case "GREEN":
        return "STABLE";
      case "BLACK":
        return "DECEASED";
      default:
        return color;
    }
  };

  const getIcon = (color: string) => {
    switch (color) {
      case "RED":
        return (
          <HeartPulse className="text-rose-600 dark:text-rose-400" size={20} />
        );
      case "YELLOW":
        return (
          <Activity className="text-amber-600 dark:text-amber-400" size={20} />
        );
      case "GREEN":
        return (
          <User className="text-emerald-600 dark:text-emerald-400" size={20} />
        );
      case "BLACK":
        return <Skull className="text-gray-500 dark:text-gray-400" size={20} />;
    }
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center text-blue-600 bg-gray-50 dark:bg-black">
        Loading Feed...
      </div>
    );

  return (
    <div
      className={clsx(
        "min-h-screen font-sans transition-colors duration-300",
        isDarkMode ? "dark bg-black" : "bg-gray-50"
      )}
    >
      {/* NAVBAR: FIXED BORDER COLOR */}
      <nav className="border-b border-gray-200 dark:border-neutral-800 bg-white dark:bg-black sticky top-0 z-20 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Activity className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold dark:text-white tracking-tight">
              ATLAS <span className="text-blue-600">Triage</span>
            </h1>
            <p className="text-xs text-gray-500 font-medium">
              Emergency Response System
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => navigate("/billing")}
            className="px-4 py-2 text-sm font-bold text-gray-400 hover:text-white border border-transparent hover:border-neutral-800 rounded-lg transition-all"
          >
            Billing & RCM
          </button>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-full hover:bg-neutral-800 text-yellow-500"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-full items-start max-w-[1600px] mx-auto p-6 lg:p-10">
        {/* FEED */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                <Activity className="text-blue-500" /> Live Triage Feed
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Real-time emergency cases
              </p>
            </div>
            <div className="text-xs text-gray-500">
              Tap card to update status
            </div>
          </div>

          <div className="space-y-3">
            {triageList.length === 0 ? (
              <div className="text-center py-20 text-gray-500 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
                No active patients. System is waiting for incoming transport.
              </div>
            ) : (
              triageList.map((triage) => (
                <div
                  key={triage.id}
                  onClick={() => handleLaneClick(triage)}
                  className={clsx(
                    "group relative rounded-xl p-5 border-l-[6px] transition-all duration-200 ease-out hover:translate-x-1 cursor-pointer shadow-sm border-y border-r dark:bg-neutral-900/50",
                    getLaneStyles(triage.tagColor)
                  )}
                >
                  <div className="flex justify-between items-center relative z-10">
                    <div className="flex items-center gap-5">
                      <div className="p-3 bg-white dark:bg-black/20 rounded-xl shadow-sm ring-1 ring-black/5 dark:ring-white/10">
                        {getIcon(triage.tagColor)}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
                          {triage.patient
                            ? `${triage.patient.firstName} ${triage.patient.lastName}`
                            : "Unknown Patient"}
                          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/60 dark:bg-white/10 text-gray-500 dark:text-gray-400 ring-1 ring-black/5 dark:ring-white/5">
                            {triage.patient?.age || "?"}yo{" "}
                            {triage.patient?.gender || "?"}
                          </span>
                          <button
                            onClick={(e) => handleEditDetails(e, triage)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-gray-400 hover:text-blue-500"
                          >
                            <Pencil size={14} />
                          </button>
                        </h3>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mt-0.5">
                          {triage.condition}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-xs font-mono text-gray-400 dark:text-gray-500 bg-black/5 dark:bg-white/5 px-1.5 py-0.5 rounded">
                            Vital Signs: {triage.vitalSigns || "Pending"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div
                        className={clsx(
                          "inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold tracking-wide mb-1.5",
                          getBadgeStyles(triage.tagColor)
                        )}
                      >
                        {getStatusLabel(triage.tagColor)}
                      </div>
                      <div className="flex items-center justify-end gap-1.5 text-xs font-medium text-gray-400 dark:text-neutral-500">
                        <Clock size={12} />
                        {new Date(triage.assignedAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* FACILITY PANEL */}
        <div className="sticky top-24">
          <div className="bg-white dark:bg-[#0A0A0A] rounded-2xl shadow-xl shadow-black/5 border border-gray-100 dark:border-neutral-800 p-6 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -z-10" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <div className="w-1 h-5 bg-blue-500 rounded-full" />
              Facility Status
            </h3>

            <div className="space-y-6">
              <div className="text-center p-6 bg-gray-50 dark:bg-neutral-900/50 rounded-xl border border-dashed border-gray-200 dark:border-neutral-800">
                <h1 className="text-5xl font-bold tracking-tighter text-gray-900 dark:text-white mb-1">
                  {hospital?.availableBeds ?? 0}
                </h1>
                <p className="text-xs font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-widest">
                  Beds Available
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-1">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Total Capacity
                  </span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded">
                    {hospital?.totalBeds ?? 0} Units
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    ER Status
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    Active
                  </span>
                </div>
                <div className="h-px bg-gray-100 dark:bg-neutral-800 my-2" />
                <div className="space-y-3">
                  <div className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <Phone size={14} className="mt-1 shrink-0 opacity-50" />
                    <span>{hospital?.contactNumber}</span>
                  </div>
                  <div className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <MapPin size={14} className="mt-1 shrink-0 opacity-50" />
                    <span className="leading-snug">{hospital?.address}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      {selectedPatient && (
        <TriageModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onUpdate={handleStatusUpdate}
          currentName={selectedPatient.patient?.firstName || "Unknown"}
          currentColor={selectedPatient.tagColor}
        />
      )}

      <PatientDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        triageData={selectedPatient}
        onSave={handlePatientSave}
      />
    </div>
  );
};

export default ERDashboard;
