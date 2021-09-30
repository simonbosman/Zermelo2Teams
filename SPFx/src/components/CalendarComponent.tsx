import * as React from "react";
import { Messages, Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import * as moment from 'moment';
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { Events } from "../model/Events";

const localizer = momentLocalizer(moment);

const messages: Messages = {
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

export type CalendarProps = {
    events: Events
    context: WebPartContext
};

export default class CalendarComponent extends React.Component<CalendarProps> {

    public render(){
        const events: Events = this.props.events;
        return (
            <div>
           <Calendar
                messages={messages}
                localizer={localizer}
                defaultDate={new Date()}
                events={events}
                step={15}
                defaultView={'work_week'}
                views={['day', 'work_week']}
                min={new Date(0, 0, 0, 8, 0, 0)}
                max={new Date(0, 0, 0, 22, 0, 0)}
              />
            </div>
          );
    }
}