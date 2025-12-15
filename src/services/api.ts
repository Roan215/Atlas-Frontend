import axios from "axios";
import type { Hospital, TriageTag, Patient, Bill } from "../types";

const API_URL = "http://localhost:8080/api";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// --- CORE SERVICES ---

// 1. Get All Hospitals (For Paramedic & Landing Page)
export const fetchAllHospitals = async (): Promise<Hospital[]> => {
  const response = await api.get<Hospital[]>("/hospitals");
  return response.data;
};

// 2. Get Single Hospital Details
export const fetchHospitalById = async (id: number): Promise<Hospital> => {
  const response = await api.get<Hospital>(`/hospitals/${id}`);
  return response.data;
};

// --- PARAMEDIC SERVICES ---

// 3. The "Golden Hour" Admission
export const admitPatient = async (
  hospitalId: number,
  patientData: Partial<Patient>,
  severity: string,
  condition: string,
  vitals: string
) => {
  const response = await api.post("/paramedic/admit", patientData, {
    params: {
      hospitalId,
      severity,
      condition,
      vitals,
    },
  });
  return response.data;
};

// --- ER DASHBOARD SERVICES ---

// 4. Get Live Triage Feed
export const fetchTriageFeed = async (
  hospitalId: number
): Promise<TriageTag[]> => {
  const response = await api.get<TriageTag[]>(`/triage/hospital/${hospitalId}`);
  return response.data;
};

// 5. Update Patient Details (Used by the Modal)
export const updatePatientDetails = async (
  patientId: number,
  data: Partial<Patient>
) => {
  // Ensure the ID is part of the URL, not just the body
  const response = await api.put(`/patients/${patientId}`, data);
  return response.data;
};

// --- BILLING SERVICES ---

// 6. Generate Bill
export const generateBill = async (patientId: number): Promise<Bill> => {
  const response = await api.post<Bill>(`/billing/generate/${patientId}`);
  return response.data;
};

// 7. Verify Insurance (Mocked for now)
export const verifyInsurancePolicy = async (
  provider: string,
  policyNumber: string
): Promise<number> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Mock Logic:
  if (policyNumber.includes("FAIL")) throw new Error("Invalid Policy");
  if (provider === "Medicare") return 90; // 90% coverage
  return 80; // Default 80% coverage
};

// ... existing imports

// NEW: Function to update criticality
export const updateTriageStatus = async (tagId: number, newColor: string) => {
  // PATCH /api/triage/{id}/status?color=RED
  const response = await api.patch(`/triage/${tagId}/status`, null, {
    params: { color: newColor },
  });
  return response.data;
};

// ... existing functions
