# Data Models & Database Schema — TRACE

TRACE does not use a relational SQL or document-based NoSQL database server. Instead, it defines strict TypeScript entity models that map directly to JSON-serialized objects stored in `localStorage`.

---

## 1. Entity-Relationship Diagram (Logical Schema)

```text
+-----------------------+              +-------------------------------------+
|        Student        |              |              AppConfig              |
+-----------------------+              +-------------------------------------+
| roll: number (PK)     |              | semesterName: string                |
| name: string          |              | minAttendanceReq?: number           |
| p: boolean            |              | subjects: Record<Code, SubjectInfo> |
| totalClasses?: number |              | timetable: Record<Day, Slot[]>      |
| attendedClasses?: num |              +-------------------------------------+
| absentDates: LogItem[]|                                |
+-----------------------+                                | 1:N
            | 1:N                                        v
            v                                  +-------------------+
+-----------------------+                      |   ScheduleSlot    |
|    AbsenceLogItem     |                      +-------------------+
+-----------------------+                      | t: string ("Time")|
| id: string (PK)       |                      | s: string ("Code")|
| dateStr: string       |                      +-------------------+
| dayStr: string        |                                | N:1
| lecStr: string        |                                v
+-----------------------+                      +-------------------+
                                               |    SubjectInfo    |
+-----------------------+                      +-------------------+
|   AttendanceRecord    |                      | name: string      |
|  (Historical Sessions)|                      | faculty?: string  |
+-----------------------+                      +-------------------+
| id: string (PK)       |
| subject: string       |
| dateStr: string       |
| lecStr: string        |
| presentCount: number  |
| totalCount: number    |
| absentRolls?: number[]|
+-----------------------+
```

---

## 2. TypeScript Data Model Contracts (`src/types/index.ts`)

### 1. `Student` Entity
```typescript
export interface AbsenceLogItem {
  id: string;        // Unique log identifier (e.g. "log-1" or "log-1723456789")
  dateStr: string;   // Date string (e.g. "18/07/2026")
  dayStr: string;    // Day of week (e.g. "Friday")
  lecStr: string;    // Lecture slot (e.g. "1" or "2-3")
}

export interface Student {
  roll: number;                   // Primary Key: Integer 1..N
  name: string;                   // Title-cased student name
  p: boolean;                     // Current session attendance flag (true = Present, false = Absent)
  totalClasses?: number;          // Total classes conducted in semester (default: 25)
  attendedClasses?: number;       // Number of classes attended (default: 20)
  absentDates?: AbsenceLogItem[]; // Historical log of specific dates absent
}
```

### 2. `AppConfig` Entity
```typescript
export interface SubjectInfo {
  name: string;      // Full course name (e.g. "Database Management System")
  faculty?: string;  // Assigned professor (e.g. "Prof. Abhishek Dewangan")
}

export interface ScheduleSlot {
  t: string;         // Time range (e.g. "10:00-10:50")
  s: string;         // Subject code key (e.g. "DBMS" or "Python Lab / DBMS Lab")
}

export interface AppConfig {
  semesterName: string;                     // e.g. "4th Semester"
  subjects: Record<string, SubjectInfo>;    // Dictionary keyed by subject code
  timetable: Record<string, ScheduleSlot[]>; // Dictionary keyed by weekday ("Monday".."Saturday")
  minAttendanceReq?: number;                // Threshold percentage (default: 75)
}
```

### 3. `BackupData` Entity
```typescript
export interface BackupData {
  version: string;     // Schema version identifier (e.g. "v4-resilient", "v4-backup")
  timestamp: string;   // ISO 8601 creation timestamp
  students: Student[]; // Complete snapshot of student records
  config: AppConfig;   // Complete snapshot of application configuration
}
```

### 4. `AttendanceRecord` Entity (Dormant Model)
```typescript
export interface AttendanceRecord {
  id: string;             // UUID or timestamped ID
  subject: string;        // Subject code
  dateStr: string;        // Date of recorded session
  lecStr: string;         // Lecture period
  presentCount: number;   // Number of attendees
  totalCount: number;     // Total strength of class
  absentRolls?: number[]; // Array of absent student roll numbers
}
```

---

## 3. Storage Keys & Lifecycle

| Key Name | Storage Engine | Write Trigger | Read Trigger |
| :--- | :--- | :--- | :--- |
| `trace_students_v4` | Browser `localStorage` | Every checkmark toggle, add/edit/delete student, import roster. | App initialization (`useAttendance` mount). |
| `trace_config_v4` | Browser `localStorage` | Timetable import, faculty import, raw JSON config save. | App initialization (`useAttendance` mount). |
| `trace_backup_snapshot` | Browser `localStorage` | Concurrently written on any student or config mutation. | Fallback when primary key fails JSON parsing. |
| `trace_last_copied_session` | Browser `localStorage` | When user clicks "Copy Report". | When user clicks "Restore Last Session". |

---

## 4. Default Seed Data

If `localStorage` is empty, `useAttendance.ts` initializes with:
- **54 Students:** Default roster containing names formatted from string: `1,Anshu Raj|2,Aakarshan Mishra|...|54,Rishabh Kumar Singh`.
- **9 Core Subjects:**
  - `CSA`: Computer System Architecture (Prof. Ashish Rangade)
  - `DBMS`: Database Management System (Prof. Abhishek Dewangan)
  - `ADA`: Analysis & Design of Algorithm (Prof. Teena Aggarwal)
  - `JAVA`: Java Programming (Prof. Abhishek Dewangan)
  - `D.S.`: Discrete Mathematics (Prof. Savita Nam)
  - `Python Lab / DBMS Lab`: Dr. Choubey / Prof. Tripathi
  - `M P / Java Lab`: Prof. Smita / Prof. Dewangan
  - `PD`: Personality Development
  - `LIB`: Library
- **6-Day Timetable:** Monday through Saturday hourly schedule slots.
