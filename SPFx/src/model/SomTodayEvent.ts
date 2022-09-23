import { Event } from "react-big-calendar";

export interface SomTodayEvent extends Event {
    onderwerp?: string | undefined;
    omschrijving?: string | undefined;
    notitie?: string | undefined;
}

export type SomTodayEvents = SomTodayEvent[];
