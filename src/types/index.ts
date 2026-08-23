export interface Student {
  roll: number;
  name: string;
  p: boolean;
}

export interface SubjectInfo {
  name: string;
  faculty?: string;
}

export interface ScheduleSlot {
  t: string;
  s: string;
}

export interface AppConfig {
  semesterName: string;
  subjects: Record<string, SubjectInfo>;
  timetable: Record<string, ScheduleSlot[]>;
  minAttendanceReq?: number;
}

export interface BackupData {
  version: string;
  timestamp: string;
  students: Student[];
  config: AppConfig;
}