import { Event } from "react-big-calendar";

interface ZermeloEvent extends Event {
    id?: number | undefined;
    choices?: string | undefined;
}

export type Events = ZermeloEvent[];