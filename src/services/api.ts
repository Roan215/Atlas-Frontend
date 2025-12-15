import axios from "axios";
import type { Hospital, TriageTag, Patient, Bill } from "../types";

const API_URL = "/api";

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

// Find the updatePatientDetails function and replace it with this:

export const updatePatientDetails = async (id: number, data: any) => {
  // We extract the insuranceNumber from the data object
  const policyNum = data.insuranceNumber || "";

  // We send it as a Query Parameter (?policyNumber=...)
  const response = await api.put(`/patients/${id}`, data, {
    params: { policyNumber: policyNum },
  });

  return response.data;
};

// --- BILLING SERVICES ---

// 6. Generate Bill
export const generateBill = async (patientId: number): Promise<Bill> => {
  const response = await api.post<Bill>(`/billing/generate/${patientId}`);
  return response.data;
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

// --- INSURANCE & BILLING ---

// 1. Verify Insurance Policy
export const verifyInsurancePolicy = async (policyNumber: string) => {
  const response = await api.get(`/insurance/${policyNumber}`);
  return response.data;
};

// 2. Get Bill Preview
export const getBillPreview = async (patientId: number) => {
  const response = await api.get(`/billing/preview/${patientId}`);
  return response.data;
};

// 3. Process Discharge
export const processDischarge = async (patientId: number) => {
  const response = await api.post(`/billing/discharge/${patientId}`);
  return response.data;
};

// ... existing imports

// NEW: Search Insurance By Name
export const searchInsuranceByName = async (name: string) => {
  const response = await api.get(`/insurance/search?name=${name}`);
  return response.data;
};

// ... existing functions
