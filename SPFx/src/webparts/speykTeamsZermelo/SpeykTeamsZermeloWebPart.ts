import * as React from "react";
import * as ReactDom from "react-dom";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";
import TokenWrapper, { AppProps } from "../../App";
import { ServiceScope } from "@microsoft/sp-core-library";
import { ZermeloLiveRosterService } from "../../services/ZermeloLiveRosterService";
import * as strings from "SpeykTeamsZermeloWebPartStrings";

import {
	IPropertyPaneConfiguration,
	PropertyPaneTextField,
} from "@microsoft/sp-property-pane";

export interface ISpeykZermeloWebPartProps {
	disApiEndpoint: string;
	disSubscriptionKey: string;
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
		const app: React.ReactElement<AppProps> = React.createElement(
			TokenWrapper,
			{
				zermeloLiveRosterService:
					this.zermeloLiveRosterService,
			}
		);
		ReactDom.render(app, this.domElement);
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
							],
						},
					],
				},
			],
		};
	}
}
