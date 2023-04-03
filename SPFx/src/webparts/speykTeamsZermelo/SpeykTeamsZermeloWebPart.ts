import * as React from "react";
import * as ReactDom from "react-dom";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";
import TokenWrapper, { AppProps } from "../../App";
import { ServiceScope } from "@microsoft/sp-core-library";
import { ZermeloLiveRosterService } from "../../services/ZermeloLiveRosterService";
import * as strings from "SpeykTeamsZermeloWebPartStrings";
import { AadTokenProvider, AadTokenProviderFactory } from "@microsoft/sp-http";
import {
	IPropertyPaneConfiguration,
	PropertyPaneTextField,
} from "@microsoft/sp-property-pane";

export interface ISpeykZermeloWebPartProps {
	disApiEndpoint: string;
	disSubscriptionKey: string;
	azureTenantId: string;
	azureApplicationId: string;
}

export default class SpeykTeamsZermeloWebPart extends BaseClientSideWebPart<ISpeykZermeloWebPartProps> {
	private zermeloLiveRosterService: ZermeloLiveRosterService;

	private validateDisEndpoint(value: string) {
		if (value === null || value.trim().length === 0) {
			return "Geef het DIS API endpoint in.";
		}

		var pattern = new RegExp(
			"^(https?:\\/\\/)?" + // protocol
				"((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
				"((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
				"(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
				"(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
				"(\\#[-a-z\\d_]*)?$",
			"i"
		);

		if (!pattern.test(value)) {
			return "Opgegeven DIS API endpoint is geen geldige url.";
		}
		return "";
	}

	private validateSubscriptionKey(value: string) {
		if (value === null || value.trim().length === 0) {
			return "Geef de DIS subscription key in.";
		}
		return "";
	}

	private validateGuid(value: string) {
		if (value == null || value.trim().length === 0) {
			return "Geef de tenant en het application id in.";
		}
		const re =
			/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
		if (!re.test(value)) {
			return "Opgegeven tenant en/of application id is geen geldige GUID.;";
		}
		return "";
	}

	private async getToken(): Promise<string> {
		const aadTokenProvider: AadTokenProvider =
			await this.context.aadTokenProviderFactory.getTokenProvider();
		return await aadTokenProvider.getToken(
			"https://graph.microsoft.com",
			false
		);
	}

	public onInit(): Promise<void> {
		return new Promise<void>(
			(resolve: () => void, reject: (error: any) => void) => {
				const serviceScope: ServiceScope =
					this.context.serviceScope.getParent();
				serviceScope.whenFinished(
					async (): Promise<void> => {
						this.zermeloLiveRosterService =
							serviceScope.consume(
								ZermeloLiveRosterService.serviceKey
							);
						this.zermeloLiveRosterService.initZermeloLiveRosterService(
							{
								disApiEndpoint:
									this
										.properties
										.disApiEndpoint,
								disSubscriptionKey:
									this
										.properties
										.disSubscriptionKey,
							}
						);
					}
				);
				resolve();
			}
		);
	}

	public render(): void {
		this.getToken().then((token) => {
			const app: React.ReactElement<AppProps> =
				React.createElement(TokenWrapper, {
					zermeloLiveRosterService:
						this.zermeloLiveRosterService,
					azureTenantId:
						this.properties.azureTenantId,
					azureAppId: this.properties
						.azureApplicationId,
					token: token,
				});
			ReactDom.render(app, this.domElement);
		});
	}

	protected onDispose(): void {
		ReactDom.unmountComponentAtNode(this.domElement);
	}

	protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
		return {
			pages: [
				{
					header: {
						description:
							strings.PropertyPaneDescription,
					},
					groups: [
						{
							groupName: strings.BasicGroupName,
							groupFields: [
								PropertyPaneTextField(
									"disApiEndpoint",
									{
										label: strings.DisApiEndpointLabel,
										onGetErrorMessage:
											this.validateDisEndpoint.bind(
												this
											),
									}
								),
								PropertyPaneTextField(
									"disSubscriptionKey",
									{
										label: strings.DisSubscriptionKeyLabel,
										onGetErrorMessage:
											this.validateSubscriptionKey.bind(
												this
											),
									}
								),
								PropertyPaneTextField(
									"azureTenantId",
									{
										label: strings.AzureTenantIdLabel,
										onGetErrorMessage:
											this.validateGuid.bind(
												this
											),
									}
								),
								PropertyPaneTextField(
									"azureApplicationId",
									{
										label: strings.AzureAppIdLabel,
										onGetErrorMessage:
											this.validateGuid.bind(
												this
											),
									}
								),
							],
						},
					],
				},
			],
		};
	}
}
