import { RefForward, RightSquareBracketKey } from "@fluentui/react-northstar";
import { ServiceKey } from "@microsoft/sp-core-library";
import * as moment from "moment";
import "moment/locale/nl";
import { AppointmentType, ZermeloEvents, zermeloUrlParams } from "../model/ZermeloEvent";
import { AppointmentsEntity, DataEntity, Student, ZermeloRestLiveRosterResp } from "../model/ZermeloRestLIveRosterResp";


const createZermeloUrl = (params: zermeloUrlParams): string => {
    return `${params.clientUrl}:443/api/v3/liveschedule?` +
        `student=${params.student}&` +
        `week=${params.week}&` +
        `fields=appointmentInstance,start,end,startTimeSlotName,endTimeSlotName,subjects,groups,` +
        `locations,teachers,cancelled,changeDescription,schedulerRemark,content,appointmentType`;
};

export class ZermeloLiveRosterService {

    private params: zermeloUrlParams;
    private students: Student[];

    private zermeloToTeamsEvents(appointments: AppointmentsEntity[]): ZermeloEvents {
        let events: ZermeloEvents = [];
        appointments.forEach((appointment) => {
            let baseEvent = {
                "id": appointment.id,
                "start": new Date(appointment.start * 1000),
                "end": new Date(appointment.end * 1000),
                "subjects": appointment.subjects,
                "locations": appointment.locations,
                "teachers": appointment.teachers,
                "groups": appointment.groups,
                "type": appointment.appointmentType,
                "choices": appointment.actions,
                "schedulerRemark": appointment.schedulerRemark,
                "online": appointment.online,
                "onlineLocationUrl": appointment.onlineLocationUrl
            };
            if (appointment.appointmentType === AppointmentType.CHOICE) {
                let cntChoices: number = appointment.actions.filter((action) => {
                    return action.status?.length == 0;
                }).length;
                events.push({
                    ...baseEvent,
                    "title": `${cntChoices} keuzevakken`,
                });
            }
            else if (appointment.appointmentType === AppointmentType.CONFLICT) {
                let cntChoices: number = appointment.actions.filter((action) => {
                    return action.status?.length != 0;
                }).length;
                events.push({
                    ...baseEvent,
                    "title": `${cntChoices} conflicten`,
                });
            }
            else if (appointment.appointmentType === AppointmentType.INTERLUDE) {
                events.push({
                    ...baseEvent,
                    "title": `Tussenuur . ${appointment.locations[0]}`
                });
            }
            else {
                events.push({
                    ...baseEvent
                });
            }
        });
        return events;
    }

    public async setStudents() {
        const params: zermeloUrlParams = this.params;
        try {
            const data: Response = await fetch(
                `${params.clientUrl}/api/v3/users?isStudent=true&fields=email,code`,
                {
                    method: "get",
                    headers: new Headers({
                        "Authorization": `Bearer ${params.token}`,
                        "User-Agent": "SPEYK Zermelo Teams App",
                        "Content-Type": "text/json",
                    })
                });
            if (data.ok) {
                const results: any = await data.json();
                if (results.response.status == 200) {
                    this.students = results.response.data;
                    let student: string = this.students.filter((entity) => {
                        return entity.email === params.student;
                    })[0].code;
                    this.params = {
                        ...params,
                        student: student
                    }
                }
            }
        }
        catch (error) {
            console.error(error);
        }
    }

    private async getEvents(week: string): Promise<ZermeloEvents> {
        const params: zermeloUrlParams = {
            ...this.params,
            week: week
        };
        try {
            const data: Response = await fetch(
                createZermeloUrl(params), {
                method: "get",
                headers: new Headers({
                    "Authorization": `Bearer ${params.token}`,
                    "User-Agent": "SPEYK Zermelo Teams App",
                    "Content-Type": "text/json",
                    "X-Impersonate": "138888"
                })
            });

            if (data.ok) {
                const results: ZermeloRestLiveRosterResp = await data.json();
                if (results.response.status === 200) {
                    let appointments: AppointmentsEntity[] = results.response.data[0].appointments;
                    return Promise.resolve(this.zermeloToTeamsEvents(appointments));
                }
            }
            return Promise.resolve([]);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    public static readonly serviceKey: ServiceKey<ZermeloLiveRosterService> =
        ServiceKey.create<ZermeloLiveRosterService>("App.ZermeloLiveRosterService", ZermeloLiveRosterService);

    public setZermelUrlParam(params: zermeloUrlParams) {
      this.params = params;
    }

    public async postAction(action: string): Promise<void> {
        const { token } = this.params;
        const url = this.params.clientUrl + action;
        try {
            const response = await fetch(
                url, {
                method: "post",
                headers: new Headers({
                    "Authorization": `Bearer ${token}`,
                    "User-Agent": "SPEYK Zermelo Teams App",
                    "Content-Type": "text/json",
                    "X-Impersonate": "138888"
                })
            }
            );
            if (response.ok) {
                console.log("Post action succesfull: " + response.statusText);
            }
            else {
                console.error("Error posting action: " + response.statusText);
            }
        }
        catch (error) {
            console.error(error);
        }
    }
    
    public async getEventsForWeeks(weeks: number) {
        try {
            let requests: Array<Promise<ZermeloEvents>> = [];
            for (let w = 0; w < weeks; w++) {
                requests.push(this.getEvents(moment().year() + "" + moment().add(w, "w").week()));
            }
            let results = [].concat(...await Promise.all(requests));
            return Promise.resolve(results);
        }
        catch (error) {
            return Promise.reject(error);
        }
    }
}

