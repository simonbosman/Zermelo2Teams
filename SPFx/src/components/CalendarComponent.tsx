import * as React from "react";
import { Messages, Calendar, momentLocalizer, Views, DayPropGetter } from "react-big-calendar";
import  styles  from "./CalendarComponent.module.scss";
import "react-big-calendar/lib/css/react-big-calendar.css";
import * as moment from 'moment';
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { ZermeloEvent, ZermeloEvents } from "../model/ZermeloEvent";
import { Dialog, Form, FormRadioGroup, RadioGroupItemProps, stringLiteralsArray } from "@fluentui/react-northstar";
import { ActionsEntity, Appointment } from "../model/ZermeloRestLIveRosterResp";

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

export type CalendarStates = {
    isOpen: boolean,
    appointmentChoices: Appointment[],
    startDate: Date,
    endDate: Date
};

const EventDay: React.FunctionComponent<{event: ZermeloEvent, title: string}> = eventComp => {
    const { subjects } = eventComp.event;
    const { locations } = eventComp.event;
    const { teachers } = eventComp.event;
    let subjectsRender: string =  (subjects !== undefined) ? subjects.join().toUpperCase() : "";
    let locationsRender: string  = (locations !== undefined) ? locations.join() : "";
    let teachersRender: string = (teachers !== undefined) ? teachers.join() : "";
    
    if(eventComp.title != null) {
        return (
            <span><strong>{eventComp.title}</strong></span>
        );
    }
    else if (subjectsRender == "PAUZE") {
        return (
            <span><strong>pauze - {locationsRender}</strong></span>
        );
    }
    else { 
        return (
            <span>
                <strong>{eventComp.title}{subjectsRender} . {locationsRender} . {teachersRender}</strong><br/>
            </span>
        );
    }
};

const EventWorkWeek: React.FunctionComponent<{event: ZermeloEvent, title: string}> = eventComp => {
    const { subjects } = eventComp.event;
    const { locations } = eventComp.event;
    const { teachers } = eventComp.event;
    let subjectsRender: string =  (subjects !== undefined) ? subjects.join().toUpperCase() : "";
    let locationsRender: string  = (locations !== undefined) ? locations.join() : "";
    let teachersRender: string = (teachers !== undefined) ? teachers.join() : "";
    if(eventComp.title != null) {
        return (
            <span><strong>{eventComp.title}</strong></span>
        );
    }
    else if (subjectsRender == "PAUZE") {
        return (
            <span><strong>{locationsRender}</strong></span>
        );
    }
    else {
        return (
            <span>
                <strong>{eventComp.title}{subjectsRender} <br/> {locationsRender} . {teachersRender}</strong><br/>
            </span>
        );
    }  
};
  
const eventPropGetter = (event: ZermeloEvent, 
                        star: Date, 
                        end:Date, 
                        isSelected: boolean) => {
                            let bg = (event.type == null) ? "#E9EAF6" : ((event.type === "conflict") ? "LightPink" : "LightGreen");
                            let newStyle = {
                                backgroundColor: bg,
                                color: 'black',
                                border: "1px solid white",
                                borderLeft: "4px solid rgb(98, 100, 167)",
                                borderRadius: "4px",
                            };
                            return {
                                style: newStyle
                            };
 };
  

export default class CalendarComponent extends React.Component<CalendarProps, CalendarStates> {

    constructor(props: CalendarProps) {
        super(props);
        this.handleEventSelected = this.handleEventSelected.bind(this);
        this.state = {
            isOpen: false,
            appointmentChoices: [],
            startDate: new Date(moment.now()),
            endDate: new Date(moment.now())
        };
    }
    
    private handleEventSelected(event: ZermeloEvent, e: React.SyntheticEvent) {
        if (event.choices === null || event.choices.length === 0) return;
        let appointmentChoices: Appointment[] = [];
        event.choices.forEach(choice => {
            appointmentChoices.push(choice.appointment);      
        });
        this.setState(
            {
                appointmentChoices: appointmentChoices,
                startDate: event.start,
                endDate: event.end
            }
        );
        this.setOpen(true);    
    }

    private setOpen(open: boolean) {
        this.setState(
            {
                isOpen: open
            }
        );
    }

    public render(){
        const { events } = this.props;
        const { isOpen } = this.state;
        const { appointmentChoices } = this.state;
        const { startDate } = this.state;
        const { endDate } = this.state;
        
        let startTime: string = `${startDate.getHours()}:${startDate.getMinutes()}`;
        let endTime: string = `${endDate.getHours()}:${endDate.getMinutes()}`;
        let options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        let headerDate: string = `${startDate.toLocaleDateString("nl-NL", options)} ${startTime}-${endTime}`;
        let appointmentChoicesDialog = [];
        if (appointmentChoices !== null &&  appointmentChoices.length > 0) {
            appointmentChoices.forEach((appointment) => {
                appointmentChoicesDialog.push(
                    {
                        name: appointment.id,
                        key: appointment.id,
                        label: `${appointment.subjects.join().toUpperCase()} . ${appointment.teachers.join()} . ${appointment.locations.join()}`,
                        value: "/api/v3/liveschedule/enrollment?enroll=" + appointment.id
                    });
            });
        }
        
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
                showMultiDayTimes
                onSelectEvent={this.handleEventSelected}
                eventPropGetter={eventPropGetter}
                components={{
                    work_week: {
                        event: EventWorkWeek,
                        },
                    day: {
                        event: EventDay,
                    }
                }}
            />
            <Dialog
                open={isOpen}   
                onCancel={() => this.setOpen(false)}
                onConfirm={() => this.setOpen(false)}
                cancelButton="Annuleren"
                confirmButton="Inschrijven"
                content={
                    <Form>
                        <FormRadioGroup vertical items = {appointmentChoicesDialog}
                        />
                    </Form>
                }
                header={headerDate}
                styles={{width: "25ww"}}
                />
            </div>
          );
    }
}