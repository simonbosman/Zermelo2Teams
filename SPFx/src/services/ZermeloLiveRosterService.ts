import { ServiceKey, Log, ServiceScope } from "@microsoft/sp-core-library";
import * as moment from "moment";
import "moment/locale/nl";
import { AppointmentType, ZermeloEvents } from "../model/ZermeloEvent";
import { DisApiParams } from "../model/DisApi";
import {
	AppointmentsEntity,
	ZermeloRestLiveRosterResp,
} from "../model/ZermeloRestLIveRosterResp";

export class ZermeloLiveRosterService {
	private bearer = localStorage.getItem(
		"adal.access.token.keyhttps://outlook.office.com"
	);
	private params: DisApiParams;

	private zermeloToTeamsEvents(
		appointments: AppointmentsEntity[]
	): ZermeloEvents {
		let events: ZermeloEvents = [];
		appointments.forEach((appointment) => {
			let baseEvent = {
				id: appointment.id,
				start: new Date(appointment.start * 1000),
				end: new Date(appointment.end * 1000),
				subjects: appointment.subjects,
				locations: appointment.locations,
				teachers: appointment.teachers,
				groups: appointment.groups,
				type: appointment.appointmentType,
				choices: appointment.actions,
				schedulerRemark: appointment.schedulerRemark,
				online: appointment.online,
				onlineLocationUrl:
					appointment.onlineLocationUrl,
			};
			if (
				appointment.appointmentType ===
				AppointmentType.CHOICE
			) {
				let cntChoices: number =
					appointment.actions.filter((action) => {
						return (
							action.status?.length ==
							0
						);
					}).length;
				if (cntChoices === 0) {
					events.push({
						...baseEvent,
						title: "geen keuzevakken beschikbaar",
					});
				} else {
					events.push({
						...baseEvent,
						title: `${cntChoices} keuzevakken`,
					});
				}
			} else if (
				appointment.appointmentType ===
				AppointmentType.CONFLICT
			) {
				let cntChoices: number =
					appointment.actions.filter((action) => {
						return (
							action.status?.length !=
							0
						);
					}).length;
				events.push({
					...baseEvent,
					title: `${cntChoices} conflicten`,
				});
			} else if (
				appointment.appointmentType ===
				AppointmentType.INTERLUDE
			) {
				events.push({
					...baseEvent,
					title: `Tussenuur . ${appointment.locations[0]}`,
				});
			} else {
				events.push({
					...baseEvent,
				});
			}
		});
		return events;
	}

	private async getEvents(
		week: string,
		token: string
	): Promise<ZermeloEvents> {
		const { disApiEndpoint, disSubscriptionKey } = {
			...this.params,
		};
		try {
			const data: Response = await fetch(
				`${disApiEndpoint}?week=${week}`,
				{
					method: "get",
					headers: new Headers({
						Authorization: `Bearer ${token}`,
						"Ocp-Apim-Subscription-Key":
							disSubscriptionKey,
						"Content-Type": "text/json",
					}),
				}
			);

			if (data.ok) {
				const results: ZermeloRestLiveRosterResp =
					await data.json();
				if (results.response.status === 200) {
					let appointments: AppointmentsEntity[] =
						results.response.data[0]
							.appointments;
					return Promise.resolve(
						this.zermeloToTeamsEvents(
							appointments
						)
					);
				}
			}
			return Promise.resolve([]);
		} catch (error) {
			return Promise.reject(error);
		}
	}

	public static readonly serviceKey: ServiceKey<ZermeloLiveRosterService> =
		ServiceKey.create<ZermeloLiveRosterService>(
			"App.ZermeloLiveRosterService",
			ZermeloLiveRosterService
		);

	public initZermeloLiveRosterService(params: DisApiParams) {
		this.params = params;
	}

	public async postAction(action: string, token: string): Promise<void> {
		const { disApiEndpoint, disSubscriptionKey } = this.params;
		const url = `${disApiEndpoint}/action${action}`;
		try {
			const response = await fetch(url, {
				method: "post",
				headers: new Headers({
					Authorization: `Bearer ${token}`,
					"Ocp-Apim-Subscription-Key":
						disSubscriptionKey,
					"Content-Type": "text/json",
				}),
			});
			if (response.ok) {
				console.log(
					"Post action succesfull: " +
						response.statusText
				);
			} else {
				console.error(
					"Error posting action: " +
						response.statusText
				);
			}
		} catch (error) {
			console.error(error);
		}
	}

	public async getEventsForWeeks(weeks: number, token: string) {
		try {
			let requests: Array<Promise<ZermeloEvents>> = [];
			for (let w = 0; w < weeks; w++) {
				requests.push(
					this.getEvents(
						moment().year() +
							"" +
							moment()
								.add(w, "w")
								.format("ww"),
						token
					)
				);
			}

			let results = [].concat(
				...(await Promise.all(requests))
			);
			return Promise.resolve(results);
		} catch (error) {
			return Promise.reject(error);
		}
	}
}
