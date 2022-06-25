import * as React from "react";
import * as ReactDom from "react-dom";
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import App, { AppProps } from "../../App";
import { ServiceScope } from "@microsoft/sp-core-library";
import { ZermeloLiveRosterService } from "../../services/ZermeloLiveRosterService";
import * as strings from "SpeykTeamsZermeloWebPartStrings";

import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
} from '@microsoft/sp-property-pane';


type SpeykZermeloWebPartProps ={
  description: string;
};

export default class SpeykTeamsZermeloWebPart extends BaseClientSideWebPart<SpeykZermeloWebPartProps> {
 
  private zermeloLiveRosterService: ZermeloLiveRosterService;
 
  public onInit(): Promise<void> {
    return new Promise<void>(async (resolve: () => void, reject: (error: any) => void): Promise<void> => {
      const serviceScope: ServiceScope = this.context.serviceScope.getParent();
      serviceScope.whenFinished((): void => {
        this.zermeloLiveRosterService = serviceScope.consume(ZermeloLiveRosterService.serviceKey);
        this.zermeloLiveRosterService.setZermelUrlParam({
          clientUrl: "https://speyk-speyk.zportal.nl",
          token: "ueoeg63t40b4s6k8sfdbd1lmmv",
          student: "138888",
          week: null
        });
      });
      resolve();
    });
  }
  
  public render(): void {
    const app: React.ReactElement<AppProps> = React.createElement(
      App, {
        zermeloLiveRosterService: this.zermeloLiveRosterService,
        context: this.context
      });
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
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
