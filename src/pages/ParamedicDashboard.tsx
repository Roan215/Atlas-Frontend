import React, { useEffect, useState } from "react";
import {
  Ambulance,
  MapPin,
  Phone,
  HeartPulse,
  ChevronRight,
  CheckCircle2,
  LayoutDashboard,
  User,
  Sun,
  Moon,
} from "lucide-react";
import type { Hospital, TriageColor } from "../types";
import { fetchAllHospitals, admitPatient } from "../services/api";
import clsx from "clsx";

const ParamedicDashboard: React.FC = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(
    null
  );

  // --- DARK MODE PERSISTENCE FIX ---
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "light") return false;
    if (stored === "dark") return true;
    return true; // Default to dark
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

  // Incident Form State
  const [triageColor, setTriageColor] = useState<TriageColor>("GREEN");
  const [description, setDescription] = useState("");
  const [vitals, setVitals] = useState("");
  const [patientData, setPatientData] = useState({
    firstName: "",
    lastName: "",
    age: "",
    gender: "MALE",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadHospitals();
  }, []);

  const loadHospitals = async () => {
    try {
      const data = await fetchAllHospitals();
      setHospitals(data);
    } catch (error) {
      console.error("Failed to load hospitals", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReserve = async () => {
    if (!selectedHospital) return;
    setSubmitting(true);

    try {
      // LOGIC: If Red/Immediate, force 'UNKNOWN' gender if form is skipped
      // Otherwise use selected gender
      const isRapidTransport = triageColor === "RED";

      await admitPatient(
        selectedHospital.id,
        {
          firstName: patientData.firstName,
          lastName: patientData.lastName,
          age: patientData.age ? parseInt(patientData.age) : 0,
          // FORCE UNKNOWN FOR RAPID TRANSPORT
          gender: isRapidTransport ? "UNKNOWN" : patientData.gender,
          address: "Incoming from Ambulance",
          contactNumber: "N/A",
        },
        triageColor,
        description || "No description provided",
        vitals || "Vitals pending"
      );

      setSuccess(true);

      setTimeout(() => {
        setSuccess(false);
        setSelectedHospital(null);
        setTriageColor("GREEN");
        setDescription("");
        setVitals("");
        setPatientData({
          firstName: "",
          lastName: "",
          age: "",
          gender: "MALE",
        });
        loadHospitals();
      }, 3000);
    } catch (error) {
      console.error("Failed to process request", error);
      alert("Error: Could not reserve bed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center text-blue-600">
        Connecting to ATLAS Network...
      </div>
    );

  if (success) {
    return (
      <div className="min-h-screen bg-emerald-600 flex flex-col items-center justify-center text-white p-6 animate-in zoom-in duration-300">
        <div className="bg-white/20 p-8 rounded-full mb-6">
          <CheckCircle2 size={64} />
        </div>
        <h1 className="text-4xl font-bold mb-2 tracking-tight">
          Transport Confirmed
        </h1>
        <p className="text-xl opacity-90">
          Bed Reserved at {selectedHospital?.name}
        </p>
        <p className="mt-8 text-sm opacity-75">Redirecting to fleet view...</p>
      </div>
    );
  }

  if (selectedHospital) {
    // Only RED is "Rapid Transport".
    // BLACK (Deceased) shows the form normally.
    const isRapidTransport = triageColor === "RED";

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white p-4 md:p-8 font-sans transition-colors duration-300">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => setSelectedHospital(null)}
              className="text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center gap-2 transition-colors"
            >
              ← Back to Fleet View
            </button>

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-full bg-gray-200 dark:bg-neutral-800 hover:bg-gray-300 dark:hover:bg-neutral-700 transition-colors"
            >
              {isDarkMode ? (
                <Sun size={20} className="text-yellow-400" />
              ) : (
                <Moon size={20} className="text-neutral-500" />
              )}
            </button>
          </div>

          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-gray-200 dark:border-neutral-800 shadow-xl">
            <h2 className="text-2xl font-bold mb-1 flex items-center gap-3">
              <Ambulance className="text-blue-600 dark:text-blue-500" />
              Incoming Transport
            </h2>
            <p className="text-gray-500 dark:text-neutral-400 mb-6">
              Target Facility:{" "}
              <span className="text-gray-900 dark:text-white font-semibold">
                {selectedHospital.name}
              </span>
            </p>

            <div className="grid grid-cols-4 gap-3 mb-8">
              {[
                {
                  id: "RED",
                  label: "IMMEDIATE",
                  color:
                    "bg-rose-100 text-rose-700 border-rose-300 dark:bg-rose-900/30 dark:text-rose-200 dark:border-rose-800",
                },
                {
                  id: "YELLOW",
                  label: "DELAYED",
                  color:
                    "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-800",
                },
                {
                  id: "GREEN",
                  label: "STABLE",
                  color:
                    "bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-200 dark:border-emerald-800",
                },
                {
                  id: "BLACK",
                  label: "DECEASED",
                  color:
                    "bg-gray-100 text-gray-700 border-gray-300 dark:bg-neutral-800 dark:text-gray-400 dark:border-neutral-700",
                },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setTriageColor(item.id as TriageColor)}
                  className={clsx(
                    "py-3 rounded-xl text-xs font-bold transition-all border-2",
                    triageColor === item.id
                      ? item.color +
                          " ring-2 ring-offset-2 ring-offset-white dark:ring-offset-black ring-blue-500"
                      : "bg-gray-50 dark:bg-black border-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                    Incident / Condition
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Chest Pain, Conscious, Breathing..."
                    className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-800 rounded-xl p-4 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none h-24 resize-none transition-all"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                    Vitals (BP, HR, SpO2)
                  </label>
                  <input
                    type="text"
                    value={vitals}
                    onChange={(e) => setVitals(e.target.value)}
                    placeholder="e.g. 120/80, 88bpm, 98%"
                    className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-800 rounded-xl p-4 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              {isRapidTransport ? (
                <div className="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/50 rounded-xl flex items-start gap-3">
                  <HeartPulse className="text-rose-600 dark:text-rose-400 shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-rose-700 dark:text-rose-300">
                      Rapid Transport Mode
                    </h3>
                    <p className="text-xs text-rose-600/70 dark:text-rose-300/70">
                      Patient gender will default to <strong>UNKNOWN</strong>.
                      Full details can be added at ER Reception.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 dark:bg-black/50 p-6 rounded-xl border border-gray-200 dark:border-neutral-800 animate-in slide-in-from-top-4">
                  <h3 className="text-sm font-bold text-gray-400 uppercase mb-4 flex items-center gap-2">
                    <User size={16} /> Patient Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="First Name"
                      value={patientData.firstName}
                      onChange={(e) =>
                        setPatientData({
                          ...patientData,
                          firstName: e.target.value,
                        })
                      }
                      className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg p-3 outline-none focus:border-blue-500 dark:text-white"
                    />
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={patientData.lastName}
                      onChange={(e) =>
                        setPatientData({
                          ...patientData,
                          lastName: e.target.value,
                        })
                      }
                      className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg p-3 outline-none focus:border-blue-500 dark:text-white"
                    />
                    <input
                      type="number"
                      placeholder="Age"
                      value={patientData.age}
                      onChange={(e) =>
                        setPatientData({ ...patientData, age: e.target.value })
                      }
                      className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg p-3 outline-none focus:border-blue-500 dark:text-white"
                    />
                    <select
                      value={patientData.gender}
                      onChange={(e) =>
                        setPatientData({
                          ...patientData,
                          gender: e.target.value,
                        })
                      }
                      className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg p-3 outline-none focus:border-blue-500 dark:text-white"
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                      <option value="UNKNOWN">Unknown</option>
                    </select>
                  </div>
                </div>
              )}

              <button
                onClick={handleReserve}
                disabled={submitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? "Transmitting..." : "Confirm & Reserve Bed"}{" "}
                <ChevronRight />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // HOSPITAL SELECTION VIEW
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white p-4 md:p-8 font-sans transition-colors duration-300">
      {/* Navbar */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/30">
            <LayoutDashboard className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              ATLAS{" "}
              <span className="text-blue-600 dark:text-blue-500">
                Paramedic
              </span>
            </h1>
            <p className="text-xs text-gray-500 dark:text-neutral-500 font-medium">
              Field Unit
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:block text-right">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              {new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            <p className="text-xs text-gray-500 dark:text-neutral-500">
              {new Date().toLocaleDateString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>

          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-full bg-gray-200 dark:bg-neutral-800 hover:bg-gray-300 dark:hover:bg-neutral-700 transition-colors"
          >
            {isDarkMode ? (
              <Sun size={20} className="text-yellow-400" />
            ) : (
              <Moon size={20} className="text-neutral-500" />
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hospitals.map((hosp) => {
          const occupancy =
            ((hosp.totalBeds - hosp.availableBeds) / hosp.totalBeds) * 100;
          const isFull = hosp.availableBeds === 0;

          return (
            <button
              key={hosp.id}
              onClick={() => !isFull && setSelectedHospital(hosp)}
              disabled={isFull}
              className={clsx(
                "relative text-left p-6 rounded-2xl border transition-all duration-200 group bg-white dark:bg-neutral-900",
                isFull
                  ? "border-gray-100 dark:border-neutral-800 opacity-60 cursor-not-allowed"
                  : "border-gray-200 dark:border-neutral-800 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-xl hover:-translate-y-1"
              )}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {hosp.name}
                  </h3>
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mt-1">
                    <MapPin size={14} /> {hosp.address.split(",")[0]}
                  </div>
                </div>
                <div
                  className={clsx(
                    "px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider",
                    isFull
                      ? "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-500"
                      : "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-500"
                  )}
                >
                  {isFull ? "Diversion" : "Open"}
                </div>
              </div>

              <div className="mb-6 p-4 bg-gray-50 dark:bg-black rounded-xl border border-gray-100 dark:border-neutral-800 flex justify-between items-end">
                <div>
                  <span className="block text-xs text-gray-400 uppercase font-bold">
                    Capacity
                  </span>
                  <div className="w-24 h-1.5 bg-gray-200 dark:bg-neutral-800 rounded-full mt-2 overflow-hidden">
                    <div
                      className={clsx(
                        "h-full rounded-full",
                        isFull ? "bg-rose-500" : "bg-blue-500"
                      )}
                      style={{ width: `${occupancy}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={clsx(
                      "text-3xl font-bold block leading-none",
                      isFull ? "text-rose-500" : "text-gray-900 dark:text-white"
                    )}
                  >
                    {hosp.availableBeds}
                  </span>
                  <span className="text-xs text-gray-400">beds left</span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-neutral-800 pt-4">
                <span className="flex items-center gap-2">
                  <Phone size={14} /> {hosp.contactNumber}
                </span>
                <span className="flex items-center gap-2 ml-auto text-blue-600 dark:text-blue-500 font-bold group-hover:translate-x-1 transition-transform">
                  Select <ChevronRight size={14} />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ParamedicDashboard;
