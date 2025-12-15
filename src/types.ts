export type TriageColor = "RED" | "YELLOW" | "GREEN" | "BLACK";

export interface Patient {
  id?: number;
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
  contactNumber: string;
  address: string;

  // These fields are populated from the backend relationship
  insuranceProvider?: string;
  insuranceNumber?: string;
  insuranceCoverage?: number;
}

export interface Hospital {
  id: number;
  name: string;
  totalBeds: number;
  availableBeds: number;
  contactNumber: string;
  address: string;
}

export interface TriageTag {
  id: number;
  patient: Patient;
  tagColor: TriageColor;
  condition: string;
  vitalSigns: string;
  assignedAt: string;
}

export interface Bill {
  id: number;
  patient: Patient;
  totalAmount: number;
  insuranceCoverage: number;
  patientPayable: number;
  status: "PENDING" | "PAID" | "INSURANCE_PENDING";
}

// ... existing types ...

// 1. ADD THIS NEW INTERFACE
export interface BillItem {
  id: number;
  quantity: number;
  totalPrice: number;
  resource: {
    id: number;
    name: string;
    unitPrice: number;
  };
}

// 2. UPDATE THE BILL INTERFACE
export interface Bill {
  id: number;
  patient: Patient;
  totalAmount: number;
  insuranceCoverage: number;
  patientPayable: number;
  status: "PENDING" | "PAID" | "INSURANCE_PENDING";

  // --- ADD THIS MISSING ARRAY ---
  items: BillItem[];
}
