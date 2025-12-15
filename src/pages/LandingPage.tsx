import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, Ambulance, Building2, Sun, Moon } from "lucide-react";
import { fetchAllHospitals } from "../services/api";
import type { Hospital } from "../types";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<string>("");

  // REPLACE the existing isDarkMode state logic with this:
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // 1. Check local storage
    const stored = localStorage.getItem("theme");
    if (stored === "light") return false;
    if (stored === "dark") return true;

    // 2. Fallback to system preference
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
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

  // --- LOAD DATA ---
  useEffect(() => {
    const loadHospitals = async () => {
      try {
        const data = await fetchAllHospitals();
        setHospitals(data);
      } catch (error) {
        console.error("Failed to load hospitals", error);
      }
    };
    loadHospitals();
  }, []);

  const handleERLogin = () => {
    if (!selectedHospital) {
      alert("Please select your hospital facility first.");
      return;
    }
    const hosp = hospitals.find((h) => h.id.toString() === selectedHospital);
    if (hosp) {
      localStorage.setItem("hospitalId", hosp.id.toString());
      localStorage.setItem("hospitalName", hosp.name);
      navigate("/er");
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-black transition-colors duration-300 flex items-center justify-center p-6 relative font-sans">
      {/* DARK MODE TOGGLE */}
      <button
        onClick={() => setIsDarkMode(!isDarkMode)}
        className="absolute top-6 right-6 p-3 rounded-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 shadow-lg hover:bg-gray-50 dark:hover:bg-neutral-800 transition-all z-50 text-yellow-500"
      >
        {isDarkMode ? (
          <Sun size={24} />
        ) : (
          <Moon size={24} className="text-slate-600" />
        )}
      </button>

      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* LEFT CARD: ER COMMAND */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 md:p-12 shadow-2xl border border-gray-100 dark:border-neutral-800 flex flex-col justify-between group hover:border-blue-500 transition-all duration-300">
          <div>
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
              <Activity
                size={32}
                className="text-blue-600 dark:text-blue-500"
              />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
              ER Command
            </h2>
            <p className="text-gray-500 dark:text-neutral-400 text-lg mb-8">
              Triage management, patient tracking, and live resource allocation
              for hospital staff.
            </p>

            <div className="space-y-4">
              <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider">
                Select Facility
              </label>
              <div className="relative">
                <Building2
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <select
                  className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-800 rounded-xl py-4 pl-12 pr-4 text-gray-900 dark:text-white font-medium outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                  value={selectedHospital}
                  onChange={(e) => setSelectedHospital(e.target.value)}
                >
                  <option value="">Choose Hospital...</option>
                  {hospitals.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <button
            onClick={handleERLogin}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg mt-8 transition-transform active:scale-[0.98] shadow-lg shadow-blue-500/30"
          >
            Enter Dashboard
          </button>
        </div>

        {/* RIGHT CARD: PARAMEDIC (Cleaned up) */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 md:p-12 shadow-2xl border border-gray-100 dark:border-neutral-800 flex flex-col justify-between group hover:border-emerald-500 transition-all duration-300">
          <div>
            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
              <Ambulance
                size={32}
                className="text-emerald-600 dark:text-emerald-500"
              />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
              Paramedic Unit
            </h2>
            <p className="text-gray-500 dark:text-neutral-400 text-lg mb-8">
              Field reporting, bed availability check, and rapid admission
              protocols for ambulance crews.
            </p>
          </div>

          <div className="mt-auto">
            {/* Authorization Text REMOVED here */}
            <button
              onClick={() => navigate("/paramedic")}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl font-bold text-lg transition-transform active:scale-[0.98] shadow-lg shadow-emerald-500/30"
            >
              Launch Mobile Interface
            </button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 text-center text-gray-400 text-sm">
        ATLAS Emergency Response System v3.0 • Secure Connection
      </div>
    </div>
  );
};

export default LandingPage;
