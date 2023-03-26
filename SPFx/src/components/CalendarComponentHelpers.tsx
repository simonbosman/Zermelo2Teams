import { CallVideoIcon, LightningIcon } from "@fluentui/react-icons-northstar";
import * as React from "react";
import { Messages } from "react-big-calendar";
import App from "../App";
import { AppointmentType, ZermeloEvent } from "../model/ZermeloEvent";

export const messages: Messages = {
	allDay: "Hele dag",
	previous: "Vorige",
	next: "Volgende",
	today: "Vandaag",
	month: "Maand",
	week: "Week",
	work_week: "Werkweek",
	day: "Dag",
	agenda: "Agenda",
	date: "Datum",
	time: "Tijd",
	event: "Afspraak",
	yesterday: "Gisteren",
	tomorrow: "Morgen",
	showMore: (count: number) => `+ ${count} afspraken`,
	noEventsInRange: "Geen afspraken binnen range",
};

const Colors = {
	PURPLE: "linear-gradient(to right,rgb(98, 100, 167) 0,rgb(98, 100, 167) 4px,#E9EAF6 4px,#E9EAF6 100%)",
	GREEN: "linear-gradient(to right,#6BB700 0,#6BB700 4px,#BDDA9B 4px,#BDDA9B 100%)",
	RED: "linear-gradient(to right,#C4314B 0,#C4314B 4px,#F3D6D8 4px,#F3D6D8 100%)",
	GREY: "linear-gradient(to right,#605E5C 0,#605E5C 4px,#999 4px,#999 100%)",
	LIGHTGREY: "linear-gradient(to right,#999 0,#999 4px,#eaeeef 4px,#eaeeef 100%)",
	YELLOW: "linear-gradient(to right,#FFAA44 0,#FFAA44 4px,#F2E384 4px,#F2E384 100%)",
};

export const EventDay: React.FunctionComponent<{
	event: ZermeloEvent;
	title: string;
}> = (eventComp) => {
	const {
		subjects,
		locations,
		teachers,
		schedulerRemark,
		online,
		onlineLocationUrl,
	} = eventComp.event;

	let subjectsRender: string =
		subjects !== undefined ? subjects.join().toUpperCase() : "";
	let locationsRender: string =
		locations !== undefined ? locations.join() : "";
	let teachersRender: string =
		teachers !== undefined ? teachers.join() : "";
	let isOnline =
		online && onlineLocationUrl != null ? onlineLocationUrl : "";

	if (subjectsRender == "PAUZE") {
		return (
			<span>
				<strong>Pauze . {locations}</strong>
			</span>
		);
	} else if (eventComp.title != null) {
		return (
			<span>
				<strong>{eventComp.title}</strong>
			</span>
		);
	} else {
		return (
			<span>
				<strong>
					{subjectsRender} . {locationsRender} .{" "}
					{teachersRender}
				</strong>
				<br />
				<br />
				{schedulerRemark}
				{isOnline}
			</span>
		);
	}
};

export const EventWorkWeek: React.FunctionComponent<{
	event: ZermeloEvent;
	title: string;
}> = (eventComp) => {
	const {
		subjects,
		locations,
		teachers,
		schedulerRemark,
		online,
		onlineLocationUrl,
	} = eventComp.event;

	let subjectsRender: string =
		subjects != null ? subjects.join().toUpperCase() : "";
	let locationsRender: string = locations != null ? locations.join() : "";
	let teachersRender: string = teachers != null ? teachers.join() : "";
	let isMoreContent =
		schedulerRemark?.length > 0 ? <LightningIcon /> : "";
	let isOnline =
		online && onlineLocationUrl != null ? <CallVideoIcon /> : "";

	if (subjectsRender == "PAUZE") {
		return <span>{locations}</span>;
	} else if (eventComp.title != null) {
		return (
			<span>
				<strong>{eventComp.title}</strong>
			</span>
		);
	} else {
		return (
			<span>
				<strong>
					{subjectsRender} <br />{" "}
					{locationsRender} . {teachersRender}
				</strong>
				<br />
				<br />
				{isMoreContent}
				{isOnline}
			</span>
		);
	}
};

export const eventPropGetter = (event: ZermeloEvent) => {
	let bg: string;
	switch (event.type) {
		case AppointmentType.CHOICE:
			bg = Colors.LIGHTGREY;
			break;
		case AppointmentType.CONFLICT:
			bg = Colors.RED;
			break;
		case AppointmentType.INTERLUDE:
			bg =
				event.subjects[0] === "pauze"
					? Colors.GREY
					: Colors.YELLOW;
			break;
		default:
			bg = Colors.PURPLE;
			break;
	}

	if (
		event.choices.filter((choice) => choice.status.length == 0)
			.length > 0 &&
		event.type != AppointmentType.CONFLICT
	) {
		bg = Colors.GREEN;
	}

	let eventStyle = {
		background: bg,
		color: "black",
		border: "1px solid white",
		borderRadius: "4px",
	};

	return {
		style: eventStyle,
	};
};
