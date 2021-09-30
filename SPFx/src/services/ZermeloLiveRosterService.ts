import { ServiceKey } from "@microsoft/sp-core-library";
import * as moment from "moment";
import "moment/locale/nl";
import { Events } from "../model/Events";

export class ZermeloLiveRosterService {
   
    private token: string = "5laek7o5hr2ipv45qu4h2ml774";
    private student: string = "138888";
    private clientUrl = "https://v21-10-speyk.zportal.nl";

    public static readonly serviceKey: ServiceKey<ZermeloLiveRosterService> = 
    ServiceKey.create<ZermeloLiveRosterService>("App.ZermeloLiveRosterService", ZermeloLiveRosterService);

    private zermeloToTeamsEvents(appointments: any): Events {
        let events: Events = [];
        appointments.map((appointment) => {
            let subjects: string = (appointment.subjects as Array<string>).join();
            let locations: string = (appointment.locations as Array<string>).join();
            if (appointment.appointmentType === "choice") {
                events.push({
                    "id": appointment.appointmentInstance,
                    "title":`Keuzeles`,
                    "start": new Date(appointment.start * 1000),
                    "end": new Date(appointment.end * 1000),
                    "choices": appointment.actions});
            } else {
                events.push({
                    "id": appointment.id,
                    "title": `${subjects} . ${locations}`,
                    "start": new Date(appointment.start * 1000),
                    "end": new Date(appointment.end * 1000),
                    "choices": null});
            }    
        });
        return events;
    }

    
    private async getEvents(week: string): Promise<Events> {
        try {
            const data: Response = await fetch(
                `${this.clientUrl}:443/api/v3/liveschedule?` +
                `student=${this.student}&`+
                `week=${week}&`+
                `fields=appointmentInstance,start,end,startTimeSlotName,endTimeSlotName,subjects,groups,locations,`+
                `teachers,cancelled,changeDescription,schedulerRemark,content,appointmentType`, { 
                    method: "get", 
                    headers: new Headers({
                        "Authorization": `Bearer ${this.token}`, 
                        "User-Agent": "SPEYK Zermelo Teams App"
                })
            });

            if (data.ok) {
                const results = await data.json();
                if (results.response.status === 200) {
                    let appointments = results.response.data[0].appointments;
                    return Promise.resolve(this.zermeloToTeamsEvents(appointments));
                }
            }
            return Promise.resolve([]);
        } catch(error) {
            return Promise.reject(error);
        }        
    }

    public async getEventsForWeeks(weeks: number) {
        try {
            let events: Events = [];
            for (let week = 0; week < weeks; week++) {
                events.push(...await this.getEvents(moment().year() + "" + moment().add(week, "w").week()));
            }
            return Promise.resolve(events);
        }
        catch (error) {
            return Promise.reject(error);
        }
    }
}

