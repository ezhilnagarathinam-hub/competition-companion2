import { create } from 'zustand';

interface AdminAuth {
  isAdmin: boolean;
  adminId: string | null;
  adminName: string | null;
  login: (id: string, name: string) => void;
  logout: () => void;
}

interface StudentAuth {
  isStudent: boolean;
  studentId: string | null;
  studentName: string | null;
  login: (id: string, name: string) => void;
  logout: () => void;
}

export const useAdminAuth = create<AdminAuth>((set) => ({
  isAdmin: false,
  adminId: null,
  adminName: null,
  login: (id, name) => set({ isAdmin: true, adminId: id, adminName: name }),
  logout: () => set({ isAdmin: false, adminId: null, adminName: null }),
}));

export const useStudentAuth = create<StudentAuth>((set) => ({
  isStudent: false,
  studentId: null,
  studentName: null,
  login: (id, name) => set({ isStudent: true, studentId: id, studentName: name }),
  logout: () => set({ isStudent: false, studentId: null, studentName: null }),
}));
