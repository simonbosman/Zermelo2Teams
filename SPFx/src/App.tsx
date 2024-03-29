import { WebPartContext } from "@microsoft/sp-webpart-base";
import * as React from "react";
import { Provider, teamsTheme, Loader } from "@fluentui/react-northstar";
import {
	PublicClientApplication,
	InteractionStatus,
	AuthenticationResult,
} from "@azure/msal-browser";
import { MsalProvider, MsalContext } from "@azure/msal-react";
import CalendarComponent, {
	CalendarProps,
} from "./components/CalendarComponent";
import { ZermeloEvents } from "./model/ZermeloEvent";
import { ZermeloLiveRosterService } from "./services/ZermeloLiveRosterService";
import { msalConfig } from "./AuthConfig";

export type AppProps = {
	zermeloLiveRosterService: ZermeloLiveRosterService;
};

type AppState = {
	events: ZermeloEvents;
	isLoading: boolean;
};

enum EventStatus {
	None = "none",
	Fetching = "fetching",
	Posting = "posting",
	Done = "done",
}

export default class TokenWrapper extends React.Component<AppProps> {
	render() {
		const { zermeloLiveRosterService } = this.props;
		const msalInstance = new PublicClientApplication(msalConfig);
		return (
			<React.StrictMode>
				<MsalProvider instance={msalInstance}>
					<App
						zermeloLiveRosterService={
							zermeloLiveRosterService
						}
					/>
				</MsalProvider>
			</React.StrictMode>
		);
	}
}

class App extends React.Component<AppProps, AppState> {
	static contextType = MsalContext;
	private token: string;
	private eventStatus: EventStatus = EventStatus.None;

	constructor(props: AppProps) {
		super(props);
		this.state = {
			events: [],
			isLoading: true,
		};
		this.handleActionChange = this.handleActionChange.bind(this);
		this.handleReload = this.handleReload.bind(this);
	}

	public async handleActionChange(action: string) {
		const { zermeloLiveRosterService } = this.props;
		this.eventStatus = EventStatus.Posting;
		await zermeloLiveRosterService.postAction(action, this.token);
		this.eventStatus = EventStatus.None
	}

	public async handleReload() {
		setTimeout(() => {
			this.getItems();
		}, 1500);
	}

	private async callLogin() {
		const msalInst: PublicClientApplication = this.context.instance;
		const isAuthenticated = this.context.accounts.length > 0;
		if (
			!isAuthenticated &&
			this.context.inProgress === InteractionStatus.None
		) {
			msalInst.loginPopup()
				.then((authRes: AuthenticationResult) => {
					this.token = authRes.accessToken;
				})
				.catch((error) => console.error(error));
		} else if (this.context.inProgress === InteractionStatus.None) {
			let scopes = {
				scopes: ["user.read"],
			};
			msalInst.setActiveAccount(this.context.accounts[0]);
			msalInst.acquireTokenSilent(scopes)
				.then((authRes: AuthenticationResult) => {
					this.token = authRes.accessToken;
					this.getItems();
				})
				.catch((error) => console.error(error));
		}
	}

	public async componentDidMount() {
		await this.callLogin();
	}

	public async componentDidUpdate() {
		await this.callLogin();
	}

	private async getItems(): Promise<void> {
		if (this.eventStatus === EventStatus.Done) {
			return;
		}

		try {
			const { zermeloLiveRosterService } = this.props;
			this.eventStatus = EventStatus.Fetching;
			let events: ZermeloEvents =
				await zermeloLiveRosterService.getEventsForWeeks(
					3,
					this.token
				);
			this.setState({
				isLoading: false,
				events: events,
			});
			this.eventStatus = EventStatus.Done;
		} catch (error) {
			this.setState({ isLoading: false });
			console.error(error);
			this.eventStatus = EventStatus.Done;
		}
	}

	public render(): React.ReactElement<CalendarProps> {
		const { events, isLoading } = this.state;
		return (
			<Provider theme={teamsTheme}>
				<div>
					{isLoading && (
						<Loader
							label={{
								content: "Rooster wordt opgehaald...",
								size: "large",
							}}
							size="larger"
						/>
					)}
					{events.length > 0 && (
						<CalendarComponent
							events={events}
							context={this.context}
							onActionChange={
								this
									.handleActionChange
							}
							onReload={
								this
									.handleReload
							}
						/>
					)}
				</div>
			</Provider>
		);
	}
}
