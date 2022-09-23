import { CallVideoIcon, LightningIcon } from "@fluentui/react-icons-northstar";
import * as React from "react";
import { Messages } from "react-big-calendar";
import { SomTodayEvent } from "../model/SomTodayEvent";
import { AppointmentType, ZermeloEvent } from "../model/ZermeloEvent";

export const messages: Messages = {
    allDay: 'Hele dag',
    previous: 'Vorige',
    next: 'Volgende',
    today: 'Vandaag',
    month: 'Maand',
    week: 'Week',
    work_week: 'Werkweek',
    day: 'Dag',
    agenda: 'Agenda',
    date: 'Datum',
    time: 'Tijd',
    event: 'Afspraak', 
    yesterday: 'Gisteren',
    tomorrow: 'Morgen',
    showMore: (count: number) => `+ ${count} afspraken`, 
    noEventsInRange: 'Geen afspraken binnen range'
};

const Colors = {
    PURPLE: "linear-gradient(to right,rgb(98, 100, 167) 0,rgb(98, 100, 167) 4px,#E9EAF6 4px,#E9EAF6 100%)",
    GREEN: "linear-gradient(to right,#6BB700 0,#6BB700 4px,#BDDA9B 4px,#BDDA9B 100%)",
    RED: "linear-gradient(to right,#C4314B 0,#C4314B 4px,#F3D6D8 4px,#F3D6D8 100%)",
    GREY: "linear-gradient(to right,#605E5C 0,#605E5C 4px,#999 4px,#999 100%)",
    LIGHTGREY: "linear-gradient(to right,#999 0,#999 4px,#eaeeef 4px,#eaeeef 100%)",
    YELLOW: "linear-gradient(to right,#FFAA44 0,#FFAA44 4px,#F2E384 4px,#F2E384 100%)"
};

export const EventDay: React.FunctionComponent<{event: SomTodayEvent, title: string}> = eventComp => {
    const { 
        onderwerp,
        omschrijving,
        notitie
    } = eventComp.event;
    
    return (
        <span>
            <strong>{onderwerp} </strong><br/><br/>
            {omschrijving} <br/>
            {notitie}
        </span>
    );
};

export const EventWorkWeek: React.FunctionComponent<{event: SomTodayEvent, title: string}> = eventComp => {
    const { 
        onderwerp,
        omschrijving,
        notitie
    } = eventComp.event;
    
    return (
        <span>
            <strong>{onderwerp} </strong><br/><br/>
            {omschrijving} <br/>
            {notitie}
        </span>
    );
};
  
export const eventPropGetter = (event: ZermeloEvent, start: Date, end: Date, isSelected: boolean) => {
    
    let eventStyle = {
        background: Colors.PURPLE,
        color: "black",
        border: "1px solid white",
        borderRadius: "4px",
    };
    
    return {
        style: eventStyle
    };
 };

