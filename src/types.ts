export type TriageColor = "RED" | "YELLOW" | "GREEN" | "BLACK";

export interface Patient {
  id?: number;
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
  contactNumber: string;
  address: string;
  insuranceProvider?: string;
  insuranceNumber?: string;

  // ADD THIS LINE:
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
  generatedAt: string;
  dueDate: string;
}
