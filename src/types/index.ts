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

export interface TemplateConfig {
  includeHeader: boolean;
  customHeader: string;
  includeDate: boolean;
  dateFormat: 'dayFirst' | 'dateFirst';
  includeSubject: boolean;
  includeFaculty: boolean;
  includeLecture: boolean;
  includeStats: boolean;
  useBoldTags: boolean;
  useEmojis: boolean;
  rollDelimiter: 'comma' | 'space' | 'newline';
  customFooter: string;
}

export const DEFAULT_TEMPLATE_CONFIG: TemplateConfig = {
  includeHeader: false,
  customHeader: '',
  includeDate: true,
  dateFormat: 'dayFirst',
  includeSubject: true,
  includeFaculty: false,
  includeLecture: true,
  includeStats: false,
  useBoldTags: true,
  useEmojis: false,
  rollDelimiter: 'comma',
  customFooter: ''
};

export interface AppConfig {
  semesterName: string;
  subjects: Record<string, SubjectInfo>;
  timetable: Record<string, ScheduleSlot[]>;
  minAttendanceReq?: number;
  templateConfig?: TemplateConfig;
}

export interface BackupData {
  version: string;
  timestamp: string;
  students: Student[];
  config: AppConfig;
}