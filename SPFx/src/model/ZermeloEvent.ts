import { Event } from "react-big-calendar";
import { ActionsEntity } from "./ZermeloRestLIveRosterResp";

export interface ZermeloEvent extends Event {
    id?: number | undefined;
    subjects?: string[] | undefined;
    teachers?: string[] | undefined;
    locations?: string[] | undefined;
    groups?: string[] | undefined;
    choices?: ActionsEntity[] | undefined;
    type?: string | undefined;
    schedulerRemark?: string;
    online?: boolean;
    onlineLocationUrl?: string;
}

export type ZermeloEvents = ZermeloEvent[];

export type zermeloUrlParams = {
    clientUrl: string;
    token: string; 
    student: string; 
    week: string;
    spInitPath: string;
}; 

export const AppointmentType =  {
    INTERLUDE: "interlude",
    CONFLICT: "conflict",
    CHOICE: "choice",
    LESSON: "lesson"
};
