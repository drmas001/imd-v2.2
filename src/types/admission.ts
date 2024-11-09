export interface Admission {
  id: number;
  patient_id: number;
  admission_date: string;
  discharge_date: string | null;
  department: string;
  admitting_doctor_id: number;
  diagnosis: string;
  status: 'active' | 'discharged' | 'transferred';
  safety_type?: 'emergency' | 'observation' | 'short-stay';
  visit_number: number;
  doctor_name?: string;
}