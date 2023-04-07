import * as React from "react";
import { Provider, teamsTheme, Loader } from "@fluentui/react-northstar";
import {
	PublicClientApplication,
	InteractionStatus,
	AuthenticationResult,
} from "@azure/msal-browser";
import { IMicrosoftTeams } from "@microsoft/sp-webpart-base";
import { MsalProvider, MsalContext } from "@azure/msal-react";
import CalendarComponent, {
	CalendarProps,
} from "./components/CalendarComponent";
import { ZermeloEvents } from "./model/ZermeloEvent";
import { ZermeloLiveRosterService } from "./services/ZermeloLiveRosterService";
import { msalConfig } from "./AuthConfig";

export type AppProps = {
	zermeloLiveRosterService: ZermeloLiveRosterService;
	azureTenantId: string;
	azureAppId: string;
	microsoftTeams: IMicrosoftTeams;
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

var token: string;

export default class TokenWrapper extends React.Component<AppProps> {
	render() {
		const { azureTenantId, azureAppId } = this.props;
		const msalInstance = new PublicClientApplication(
			msalConfig(azureTenantId, azureAppId)
		);
		return (
			<React.StrictMode>
				<MsalProvider instance={msalInstance}>
					<App {...this.props} />
				</MsalProvider>
			</React.StrictMode>
		);
	}
}

class App extends React.Component<AppProps, AppState> {
	static contextType = MsalContext;
	private eventStatus: EventStatus = EventStatus.None;
	private showPopup: boolean = false;

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
		await zermeloLiveRosterService.postAction(action, token);
		this.eventStatus = EventStatus.None;
	}

	public async handleReload() {
		setTimeout(() => {
			this.getItems();
		}, 1500);
	}

	private async callLogin() {
		const msalInst: PublicClientApplication = this.context.instance;
		const isAuthenticated = this.context.accounts.length > 0;
		const loginRequest = {
			scopes: [],
		};
		if (
			!isAuthenticated &&
			this.context.inProgress === InteractionStatus.None &&
			this.showPopup == false
		) {
			this.showPopup = true;
			await msalInst
				.loginPopup()
				.catch((error) => console.error(error));
		} else if (this.context.inProgress === InteractionStatus.None) {
			let scopes = {
				scopes: ["user.read"],
			};
			msalInst.setActiveAccount(this.context.accounts[0]);
			msalInst.acquireTokenSilent(scopes)
				.then((authRes: AuthenticationResult) => {
					token = authRes.accessToken;
					this.showPopup = false;
					this.getItems();
				})
				.catch((error) => console.error(error));
		}
	}

	private async callLoginTeams() {
		const teams = this.props.microsoftTeams.teamsJs;
		teams.initialize();
		const authTokenRequest = {
			successCallback: function (result: string) {
				token = result;
			},
			failureCallback: function (error: string) {
				console.error("Error getting token: " + error);
			},
		};
		teams.authentication.getAuthToken(authTokenRequest);
		setTimeout(() => {
			this.getItems();
		}, 1500);
	}

	public async componentDidMount() {
		if (typeof this.props.microsoftTeams === "undefined") {
			await this.callLogin();
		} else {
			await this.callLoginTeams();
		}
	}

	public async componentDidUpdate() {
		if (typeof this.props.microsoftTeams === "undefined") {
			await this.callLogin();
		}
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
					token
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
