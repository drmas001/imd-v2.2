import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Patient } from '../types/patient';
import type { Admission } from '../types/admission';

interface PatientStore {
  patients: Patient[];
  selectedPatient: Patient | null;
  loading: boolean;
  error: string | null;
  fetchPatients: () => Promise<void>;
  addPatient: (patientData: any) => Promise<void>;
  updatePatient: (id: number, updates: Partial<Patient>) => Promise<void>;
  deletePatient: (id: number) => Promise<void>;
  setSelectedPatient: (patient: Patient | null) => void;
  subscribe: (callback: () => void) => () => void;
}

export const usePatientStore = create<PatientStore>((set, get) => ({
  // Store implementation remains the same, but with proper typing for admissions sorting
  patients: [],
  selectedPatient: null,
  loading: false,
  error: null,

  subscribe: (callback: () => void) => {
    const subscribers = new Set<() => void>();
    subscribers.add(callback);
    return () => subscribers.delete(callback);
  },

  setSelectedPatient: (patient) => {
    set({ selectedPatient: patient });
  },

  fetchPatients: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('patients')
        .select(`
          *,
          admissions (
            id,
            admission_date,
            discharge_date,
            department,
            diagnosis,
            status,
            visit_number,
            safety_type,
            users (
              name
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const patientsWithDetails = data?.map(patient => ({
        ...patient,
        doctor_name: patient.admissions?.[0]?.users?.name,
        department: patient.admissions?.[0]?.department,
        diagnosis: patient.admissions?.[0]?.diagnosis,
        admission_date: patient.admissions?.[0]?.admission_date,
        admissions: patient.admissions?.sort((a: Admission, b: Admission) => 
          new Date(b.admission_date).getTime() - new Date(a.admission_date).getTime()
        )
      })) || [];

      set({ patients: patientsWithDetails as Patient[], loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  // Rest of the store implementation remains the same...
}));