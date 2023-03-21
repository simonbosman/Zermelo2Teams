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
	private bearer =
		"eyJ0eXAiOiJKV1QiLCJub25jZSI6IldPZjB5U3lGZ0MzQlh4cmRMOHh5RDJPek0yZGh4N3lMWGdKbmhMaUVaWTAiLCJhbGciOiJSUzI1NiIsIng1dCI6Ii1LSTNROW5OUjdiUm9meG1lWm9YcWJIWkdldyIsImtpZCI6Ii1LSTNROW5OUjdiUm9meG1lWm9YcWJIWkdldyJ9.eyJhdWQiOiJodHRwczovL291dGxvb2sub2ZmaWNlLmNvbSIsImlzcyI6Imh0dHBzOi8vc3RzLndpbmRvd3MubmV0L2Q3MTg5NmM1LTc5NWYtNDI0ZS1iZmI1LTU1OGRkMWY5NWJiMS8iLCJpYXQiOjE2Nzc1ODcyODUsIm5iZiI6MTY3NzU4NzI4NSwiZXhwIjoxNjc3NTkyMzE3LCJhY2N0IjowLCJhY3IiOiIxIiwiYWlvIjoiRTJZQUFxbnBMcG1udzQ1Y1NXaDdVMndqbjdmZ0dKZis3VDBiM3hiclBKNjUybURWSExIdXFMUmRlOFd2SDJxZmVNcW1zdlFqQUE9PSIsImFtciI6WyJwd2QiXSwiYXBwX2Rpc3BsYXluYW1lIjoiU1BFWUsgLSBHcmFwaCBBUEkiLCJhcHBpZCI6ImM4Yjc5OWVjLWEyZjktNGRiZS05Mzg5LWFmMGMwM2RlMzdiOSIsImFwcGlkYWNyIjoiMCIsImVuZnBvbGlkcyI6W10sImZhbWlseV9uYW1lIjoiU3VwcG9ydCIsImdpdmVuX25hbWUiOiJTUEVZSyIsImlwYWRkciI6IjMxLjIwLjIxOC45OCIsIm5hbWUiOiJTUEVZSyBTdXBwb3J0Iiwib2lkIjoiZjE3MDQyZTUtOGJmYy00ZGM1LThlODItOGY1ODE1M2ZmNmZkIiwicHVpZCI6IjEwMDM3RkZFOUYwMkNGRDQiLCJyaCI6IjAuQVNBQXhaWVkxMTk1VGtLX3RWV04wZmxic1FJQUFBQUFBUEVQemdBQUFBQUFBQUFnQURJLiIsInNjcCI6IkNhbGVuZGFycy5SZWFkLlNoYXJlZCBDYWxlbmRhcnMuUmVhZFdyaXRlLlNoYXJlZCBDb250YWN0cy5SZWFkV3JpdGUuU2hhcmVkIEZpbGVzLlJlYWQgR3JvdXAuUmVhZC5BbGwgR3JvdXAuUmVhZFdyaXRlLkFsbCBNYWlsLlJlYWRXcml0ZSBNYWlsLlJlYWRXcml0ZS5TaGFyZWQgTm90ZXMuUmVhZCBUYXNrcy5SZWFkV3JpdGUuU2hhcmVkIFVzZXIuUmVhZCBVc2VyLlJlYWRXcml0ZSIsInNpZCI6IjhlNmE4M2VlLTNiMGItNGI2Ni04YjM5LTI0YzZmYmFiNTVmYSIsInNpZ25pbl9zdGF0ZSI6WyJrbXNpIl0sInN1YiI6Im1RZThzaWFVdVRzX3gyVkpEY0cxSVNkUnkzQ201VjdQbG9Nb1dNWTRRQmMiLCJ0aWQiOiJkNzE4OTZjNS03OTVmLTQyNGUtYmZiNS01NThkZDFmOTViYjEiLCJ1bmlxdWVfbmFtZSI6ImFkbWluQHNwZXlrZGV2Lm9ubWljcm9zb2Z0LmNvbSIsInVwbiI6ImFkbWluQHNwZXlrZGV2Lm9ubWljcm9zb2Z0LmNvbSIsInV0aSI6ImNTM0w3al9OeWthX1c1TGl3bjlyQUEiLCJ2ZXIiOiIxLjAifQ.mShgw-XRqrXMRpULRBM4sMkPZ5XSM7GYIHY0N6aMJ9va7bRhPNLWOpEHzaZ7UipdEDgQmPrFbmO1XCbWfex5t610pyeenMN6s2-8isK_TW835WISnhCaFvhMQsjC55XNO3rEjp0yyOZrOq46eH1T7Wma5a-cDR5U7OdOe4aAxUCUR_JxW9cjqvIQv6MpR277C1IWm1Ek8hmfjlbxvg8GyFIqjaFe9l1JCf2WDdW144Ja0-wH1FHSoAhD3HKBKnEOn1-27JwDKMs6hBx9yw8Wg5e56eZdTI2F5zlHPCeT8aHlvxB0TlMfOrRb7g4Vtq3ezwFz7v9e0PV6Dj9UCygVhQ";

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

	private async getEvents(week: string): Promise<ZermeloEvents> {
		const { disApiEndpoint, disSubscriptionKey } = {
			...this.params,
		};
		try {
			const data: Response = await fetch(
				`${disApiEndpoint}?week=${week}`,
				{
					method: "get",
					headers: new Headers({
						Authorization: `Bearer ${this.bearer}`,
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

	public async postAction(action: string): Promise<void> {
		const { disApiEndpoint, disSubscriptionKey } = this.params;
		const url = `${disApiEndpoint}/action${action}`;
		try {
			const response = await fetch(url, {
				method: "post",
				headers: new Headers({
					Authorization: `Bearer ${this.bearer}`,
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

	public async getEventsForWeeks(weeks: number) {
		try {
			let requests: Array<Promise<ZermeloEvents>> = [];
			for (let w = 0; w < weeks; w++) {
				requests.push(
					this.getEvents(
						moment().year() +
							"" +
							moment()
								.add(w, "w")
								.format("ww")
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
