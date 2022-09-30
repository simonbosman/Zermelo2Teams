import { Event } from "react-big-calendar";

export interface ExternMateriaal {
    uuid: string;
    omschrijving: string;
    uri: string;
    contentType: string;
}

export interface SomTodayEvent extends Event {
    onderwerp?: string | undefined;
    omschrijving?: string | undefined;
    notitie?: string | undefined;
    huiswerktype?: string | undefined;
    leerdoelen?: string | undefined;
    vaknaam?: string | undefined;
    externMateriaal?: ExternMateriaal[] | undefined;
}

export type SomTodayEvents = SomTodayEvent[];
