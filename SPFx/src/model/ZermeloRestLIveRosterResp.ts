export interface ZermeloRestLiveRosterResp {
    response: Response;
  }
  export interface Response {
    status: number;
    message: string;
    details: string;
    eventId: number;
    startRow: number;
    endRow: number;
    totalRows: number;
    data?: (DataEntity)[] | null;
  }
  export interface DataEntity {
    week: string;
    user: string;
    appointments?: (AppointmentsEntity)[] | null;
    status?: (StatusEntity)[] | null;
    replacements?: (null)[] | null;
  }
  export interface AppointmentsEntity {
    status?: (StatusEntity1 | null)[] | null;
    actions?: (ActionsEntity | null)[] | null;
    start: number;
    end: number;
    cancelled: boolean;
    appointmentType: string;
    online: boolean;
    onlineLocationUrl?: string;
    optional: boolean;
    appointmentInstance?: number | null;
    startTimeSlotName?: string | null;
    endTimeSlotName?: string | null;
    subjects?: (string | null)[] | null;
    groups?: (string | null)[] | null;
    locations?: (string | null)[] | null;
    teachers?: (string | null)[] | null;
    onlineTeachers?: (null)[] | null;
    capacity?: null;
    expectedStudentCount?: null;
    expectedStudentCountOnline?: null;
    changeDescription?: string | null;
    schedulerRemark?: string | null;
    content?: null;
    id?: number | null;
  }
  export interface StatusEntity1 {
    code: number;
    nl: string;
    en: string;
  }
  export interface ActionsEntity {
    appointment: Appointment;
    status?: (StatusEntity)[] | null;
    allowed: boolean;
    post: string;
  }
  export interface Student {
    email: string;
    code: string;
  }
  
  export interface Appointment {
    start: number;
    end: number;
    cancelled: boolean;
    plannedAttendance: boolean;
    studentEnrolled: boolean;
    allowedActions: string;
    optional: boolean;
    attendanceOverruled: boolean;
    appointmentType: string;
    online: boolean;
    appointmentInstance: number;
    startTimeSlotName: string;
    endTimeSlotName: string;
    subjects?: (string)[] | null;
    groups?: (string | null)[] | null;
    locations?: (string | null)[] | null;
    teachers?: (string)[] | null;
    onlineTeachers?: (null)[] | null;
    capacity?: null;
    expectedStudentCount?: null;
    expectedStudentCountOnline?: null;
    changeDescription: string;
    schedulerRemark: string;
    content?: null;
    availableSpace?: number | null;
    id: number;
  }
  export interface StatusEntity {
    code: number;
    nl: string;
    en: string;
  }
  