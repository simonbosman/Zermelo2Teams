import { ServiceKey, Log, ServiceScope } from "@microsoft/sp-core-library";
import * as moment from "moment";
import "moment/locale/nl";
import { AppointmentType, ZermeloEvents, zermeloUrlParams } from "../model/ZermeloEvent";
import { AppointmentsEntity, Student, ZermeloRestLiveRosterResp } from "../model/ZermeloRestLIveRosterResp";
import { IStudentsListBackedService, StudentsListBackedService } from "./StudentsListBackedService";


const createZermeloUrl = (params: zermeloUrlParams): string => {
    return `${params.clientUrl}:443/api/v3/liveschedule?` +
        `student=${params.studentCode}&` +
        `week=${params.week}&` +
        `fields=appointmentInstance,start,end,startTimeSlotName,endTimeSlotName,subjects,groups,` +
        `locations,teachers,cancelled,changeDescription,schedulerRemark,content,appointmentType`;
};

export class ZermeloLiveRosterService {

    private params: zermeloUrlParams;
    private students: Student[];
    private studentsListBackedService: IStudentsListBackedService;

    constructor(serviceScope: ServiceScope) {

        serviceScope.whenFinished(() => {
            this.studentsListBackedService = serviceScope.consume(StudentsListBackedService.serviceKey)
        });
    }

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
                if (cntChoices === 0) {
                    events.push({
                        ...baseEvent,
                        "title": "geen keuzevakken beschikbaar"
                    })
                }
                else {
                events.push({
                    ...baseEvent,
                    "title": `${cntChoices} keuzevakken`,
                });
            }
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

    private async setStudentsFromZermelo() {
        const params: zermeloUrlParams = this.params;
        try {
            const data: Response = await fetch(
                `${params.clientUrl}/api/v3/users?isStudent=true&fields=email,code`,
                {
                    method: "get",
                    headers: new Headers({
                        "Authorization": `Bearer ${params.token}`,
                        "User-Agent": "SPEYK Zermelo Teams App",
                        "Content-Type": "text/json"
                    })
                });

            if (data.ok) {
                const results: any = await data.json();
                if (results.response.status == 200) {
                    this.students = results.response.data;
                }
                Log.info("ZermeloLiveRosterService", "Students haven been set");
            }
        }
        catch (error) {
            console.error(error);
        }
    }

    private getStudentCode(students: Student[], email: string) {
        let studentCodes = students.filter((entity) => {
            return entity.email === email;
        });
        if (studentCodes.length > 0) {
            return studentCodes[0].code;
        }
        else {
            return "";
        }
    }

    public async setStudent() {
        this.students = await this.studentsListBackedService.getStudents();
        let studentCode = this.getStudentCode(this.students, this.params.studentEmail);

        if (studentCode.length > 0) {
            this.params.studentCode = studentCode;
        }
        else {
            await this.setStudentsFromZermelo();
            let studentCode = this.getStudentCode(this.students, this.params.studentEmail);
            if (studentCode.length > 0) {
                this.studentsListBackedService.addStudent(studentCode, this.params.studentEmail)
                this.params.studentCode = studentCode;
            }
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
                    "X-Impersonate": this.params.studentCode
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

    public initZermeloLiveRosterService(params: zermeloUrlParams) {
        this.params = params;
        this.studentsListBackedService.initStudentsListBackedService(this.params.spInitPath);
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
                    "X-Impersonate": this.params.studentCode
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

