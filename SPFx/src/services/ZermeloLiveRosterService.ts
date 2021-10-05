import { ServiceKey } from "@microsoft/sp-core-library";
import * as moment from "moment";
import "moment/locale/nl";
import { ZermeloEvents } from "../model/ZermeloEvent";
import { AppointmentsEntity, ZermeloRestLiveRosterResp } from "../model/ZermeloRestLIveRosterResp";

export type zermeloUrlParams = {
    clientUrl: string;
    token: string; 
    student: string; 
    week: string;
}; 

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
        appointments.map((appointment) => {
            if (appointment.appointmentType === "choice") {
                events.push({
                    "title": `${appointment.actions.length} keuzevakken`,
                    "type": appointment.appointmentType,
                    "choices": appointment.actions,
                    "id": appointment.id,
                    "start": new Date(appointment.start * 1000),
                    "end": new Date(appointment.end * 1000),
                    "subjects": appointment.subjects,
                    "locations": appointment.locations,
                    "teachers": appointment.teachers,
                    "groups": appointment.groups}); 
            } 
            else if (appointment.appointmentType === "conflict") {
                events.push({
                    "title": `${appointment.actions.length} conflicten`,
                    "type": appointment.appointmentType,
                    "choices": appointment.actions,
                    "id": appointment.id,
                    "start": new Date(appointment.start * 1000),
                    "end": new Date(appointment.end * 1000),
                    "subjects": appointment.subjects,
                    "locations": appointment.locations,
                    "teachers": appointment.teachers,
                    "groups": appointment.groups}); 
            } 
            else {
                events.push({
                "id": appointment.id,
                "start": new Date(appointment.start * 1000),
                "end": new Date(appointment.end * 1000),
                "subjects": appointment.subjects,
                "locations": appointment.locations,
                "teachers": appointment.teachers,
                "groups": appointment.groups}); 
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
                       // "X-Impersonate": "138888"
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
            let events: ZermeloEvents = [];
            for(let w = 0; w < 3; w++) {
                events.push(...await this.getEvents(moment().year() + "" + moment().add(w, "w").week()));
            }
            return Promise.resolve(events);
        }
        catch (error) {
            return Promise.reject(error);
        }
    }
}

