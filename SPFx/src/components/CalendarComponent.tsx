import * as React from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import * as moment from 'moment';
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { ZermeloEvent, ZermeloEvents } from "../model/ZermeloEvent";
import { CloseIcon, Dialog, RadioGroup, RadioGroupItemProps, ShorthandCollection} from "@fluentui/react-northstar";
import { ActionsEntity } from "../model/ZermeloRestLIveRosterResp";
import { EventDay, eventPropGetter, EventWorkWeek, messages } from "./CalendarComponentHelpers";

const localizer = momentLocalizer(moment);


export type CalendarProps = {
    events: ZermeloEvents
    context: WebPartContext
    onActionChange: (url: string) => void
    onReload: () => void
};

export type CalendarStates = {
    isOpen: boolean,
    appointmentActions: ActionsEntity[],
    startDate: Date,
    endDate: Date,
    action: string
};

export default class CalendarComponent extends React.Component<CalendarProps, CalendarStates> {

    constructor(props: CalendarProps) {
        super(props);
        this.state = {
            isOpen: false,
            appointmentActions: [],
            startDate: new Date(moment.now()),
            endDate: new Date(moment.now()),
            action: ''
        };
        this.handleEventSelected = this.handleEventSelected.bind(this);
    }
    
    private handleEventSelected(event: ZermeloEvent, e: React.SyntheticEvent) {
        if (event.choices == null || event.choices.length == 0) return;
        this.setState({
                appointmentActions: event.choices,
                startDate: event.start,
                endDate: event.end,
                isOpen: true
            }
        );
    }

    private setOpen(open: boolean) {
        this.setState({
                isOpen: open
            }
        );
    }

    private setAction(action: string) {
        this.setState({
            action: action
        });
    }

    private getAppChoicesDialog(appointmentActions: ActionsEntity[]): ShorthandCollection<RadioGroupItemProps> {
        let appointmentChoicesDialog = [];
        if (appointmentActions != null &&  appointmentActions.length > 0) {
            appointmentActions.forEach((action) => {
                let isDisabled:boolean = false;
                let statusMsg: string = "";
               
                if(action.status?.length > 0) {
                    isDisabled = true;
                    statusMsg = "STATUS: " + action.status?.map(s => s.nl).join();
                }
               
                if (action.appointment === null) {
                    appointmentChoicesDialog.push(
                        {
                            disabled: false,
                            name: "enroll",
                            value: action.post,
                            label: `${statusMsg}`
                        }
                    );
                }
                else {
                  appointmentChoicesDialog.push(
                        {
                            disabled: isDisabled,
                            name: "enroll",
                            value: action.post,
                            key: action.appointment.id,
                            label: `${action.appointment.subjects.join().toUpperCase()} . ` + 
                            `${action.appointment.locations.join()} . ${action.appointment.teachers.join()}  ` +
                            `${statusMsg}`,
                        });
                }
            });
        }
        return appointmentChoicesDialog;
    }

    public render(){
        const { events } = this.props;
        const { onActionChange } = this.props;
        const { onReload } = this.props;
        const { isOpen } = this.state;
        const { appointmentActions } = this.state;
        const { startDate } = this.state;
        const { endDate } = this.state;
        
        let startTime: string = `${startDate.getHours()}:${startDate.getMinutes()}`;
        let endTime: string = `${endDate.getHours()}:${endDate.getMinutes()}`;
        let options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        let headerDate: string = `${startDate.toLocaleDateString("nl-NL", options)} ${startTime}-${endTime}`;
        
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
                //TODO: Als er geen inschrijving mogelijk is, knop 
                //inschrijven grayedout maken
                confirmButton="Inschrijven"
                onConfirm={() => {
                    if (this.state.action == '') {return;}
                    onActionChange(this.state.action);
                    this.setAction('');
                    this.setOpen(false);
                    onReload();
                    }
                } 
                content={
                    <RadioGroup 
                        vertical 
                        items={this.getAppChoicesDialog(appointmentActions)}
                        onCheckedValueChange={(e, props) =>
                           this.setAction(String(props.value))
                        }/>
                }
                header={headerDate}
                headerAction={{
                    icon: <CloseIcon />,
                    title: "Annuleren",
                    onClick: () => {
                        this.setAction('');
                        this.setOpen(false);
                    }
                  }}
                />
            </div>
          );
    }
}