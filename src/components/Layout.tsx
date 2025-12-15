import React, { useState, useEffect } from "react";
import { Moon, Sun, LayoutDashboard, Stethoscope, Receipt } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
}

// Inside src/components/Layout.tsx

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // 1. Check Local Storage first
    const storedTheme = localStorage.getItem("theme");

    // 2. Explicitly handle BOTH 'dark' and 'light'
    if (storedTheme === "dark") return true;
    if (storedTheme === "light") return false;

    // 3. Only fall back to System Preference if nothing is stored
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // ... rest of the component remains the same ...

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const isActive = (path: string) => location.pathname === path;

  return (
    // CHANGED: dark:bg-slate-900 -> dark:bg-black
    <div className="min-h-screen transition-colors duration-300 bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 flex flex-col font-sans">
      {/* Navbar: CHANGED dark:bg-slate-900/80 -> dark:bg-black/80 and dark:border-slate-800 -> dark:border-neutral-800 */}
      <nav className="w-full px-6 py-4 flex justify-between items-center backdrop-blur-md bg-white/70 dark:bg-black/80 sticky top-0 z-50 border-b border-gray-200 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/30">
            <LayoutDashboard className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              ATLAS{" "}
              <span className="text-blue-600 dark:text-blue-500">Triage</span>
            </h1>
            <p className="text-xs text-gray-500 dark:text-neutral-500 font-medium">
              Emergency Response System
            </p>
          </div>
        </div>

        <div className="hidden md:flex gap-1 bg-gray-100 dark:bg-neutral-900 p-1 rounded-xl">
          <button
            onClick={() => navigate("/")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
              isActive("/")
                ? "bg-white dark:bg-neutral-800 shadow-sm text-blue-600 dark:text-blue-400"
                : "text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            <Stethoscope size={18} />
            ER Dashboard
          </button>
          <button
            onClick={() => navigate("/billing")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
              isActive("/billing")
                ? "bg-white dark:bg-neutral-800 shadow-sm text-blue-600 dark:text-blue-400"
                : "text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            <Receipt size={18} />
            Billing & RCM
          </button>
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
            className="p-2 rounded-full bg-gray-200 dark:bg-neutral-900 hover:bg-gray-300 dark:hover:bg-neutral-800 transition-colors"
          >
            {isDarkMode ? (
              <Sun size={20} className="text-yellow-400" />
            ) : (
              <Moon size={20} className="text-neutral-500" />
            )}
          </button>
        </div>
      </nav>

      <main className="flex-1 container mx-auto p-4 md:p-6 lg:p-8 animate-in fade-in duration-500">
        {children}
      </main>
    </div>
  );
};

export default Layout;
