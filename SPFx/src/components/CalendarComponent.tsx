import * as React from "react";
import { Messages, Calendar, momentLocalizer, Components, Views } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import * as moment from 'moment';
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { ZermeloEvent, ZermeloEvents } from "../model/ZermeloEvent";
import { Dialog, DialogType } from "@fluentui/react";

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
    events: ZermeloEvents
    context: WebPartContext
};

const Event: React.FunctionComponent<ZermeloEvent> = event => {
    return (
        <span>
             <h3>{event.title}</h3>
        </span>
    );
}


const EventWorkWeek: React.FunctionComponent<ZermeloEvent> = event => {
    return (
      <span>
          <strong>{event.title}</strong>
      </span>
    )
  }
  
 export default class CalendarComponent extends React.Component<CalendarProps> {

    private handleEventSelected(event: ZermeloEvent) {
        let tmp = event;
    }

    public render(){
        const { events } = this.props;
        const dialogContentProps = {
            type: DialogType.normal,
            title: 'Missing Subject',
            closeButtonAriaLabel: 'Close',
            subText: 'Do you want to send this message without a subject?',
          };
          return (
            <div>
                <Calendar
                messages={messages}
                localizer={localizer}
                defaultDate={new Date()}
                events={events}
                step={10}
                defaultView={Views.WORK_WEEK}
                views={[Views.DAY, Views.WORK_WEEK]}
                min={new Date(0, 0, 0, 8, 0, 0)}
                max={new Date(0, 0, 0, 17, 0, 0)}
                onSelectEvent={((evt) => this.handleEventSelected(evt as ZermeloEvent) )}
                components={{
                    event: Event,
                    work_week: {
                        event: EventWorkWeek,
                      },
                }}
                 />
              <Dialog
        hidden={false}
        dialogContentProps={dialogContentProps}/>
             </div>
          );
    }
}