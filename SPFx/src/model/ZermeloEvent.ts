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
}

export type ZermeloEvents = ZermeloEvent[];