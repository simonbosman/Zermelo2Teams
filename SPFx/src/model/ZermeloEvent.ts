import { Event } from "react-big-calendar";

export interface ZermeloEvent extends Event {
    id?: number | undefined;
    choices?: string | undefined;
}

export type ZermeloEvents = ZermeloEvent[];