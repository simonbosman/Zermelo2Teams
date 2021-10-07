import { ServiceKey } from "@microsoft/sp-core-library";
import * as moment from "moment";
import "moment/locale/nl";
import { AppointmentType, ZermeloEvent, ZermeloEvents, zermeloUrlParams } from "../model/ZermeloEvent";
import { AppointmentsEntity, ZermeloRestLiveRosterResp } from "../model/ZermeloRestLIveRosterResp";


const createZermeloUrl = (params: zermeloUrlParams): string => {
    return `${params.clientUrl}:443/api/v3/liveschedule?` +
        `student=${params.student}&` +
        `week=${params.week}&` +
        `fields=appointmentInstance,start,end,startTimeSlotName,endTimeSlotName,subjects,groups,` +
        `locations,teachers,cancelled,changeDescription,schedulerRemark,content,appointmentType`;
};

export class ZermeloLiveRosterService {
   
    private params: zermeloUrlParams;

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
                "online": appointment.online
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

    private async getEvents(week: string): Promise<ZermeloEvents> {
        try {
            const params: zermeloUrlParams = {
                ...this.params,
                week: week
            };
            
            const data: Response = await fetch(
               createZermeloUrl(params), { 
                    method: "get", 
                    headers: new Headers({
                        "Authorization": `Bearer ${params.token}`, 
                        "User-Agent": "SPEYK Zermelo Teams App",
                        "Content-Type": "text/json",
                        //"X-Impersonate": "138888"
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
        } catch(error) {
            return Promise.reject(error);
        }        
    }
   
    public static readonly serviceKey: ServiceKey<ZermeloLiveRosterService> = 
    ServiceKey.create<ZermeloLiveRosterService>("App.ZermeloLiveRosterService", ZermeloLiveRosterService);

    public setZermelUrlParam (params: zermeloUrlParams) {
        this.params = params;
    }
   
    public async getEventsForWeeks(weeks: number) {
        try {
            let requests: Array<Promise<ZermeloEvents>> = [];
            for(let w = 0; w < 3; w++) {
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

