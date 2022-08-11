import * as React from "react";
import * as ReactDom from "react-dom";
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import App, { AppProps } from "../../App";
import { ServiceScope } from "@microsoft/sp-core-library";
import { ZermeloLiveRosterService } from "../../services/ZermeloLiveRosterService";
import { StudentsListBackedService } from "../../services/StudentsListBackedService";
import * as strings from "SpeykTeamsZermeloWebPartStrings";

import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
} from '@microsoft/sp-property-pane';


export interface ISpeykZermeloWebPartProps {
  token: string;
  zermeloUrl: string;
  spListUrl: string;
}

export default class SpeykTeamsZermeloWebPart extends BaseClientSideWebPart<ISpeykZermeloWebPartProps> {

  private zermeloLiveRosterService: ZermeloLiveRosterService;
  
  private validateZermeloUrl(value: string) {
    if (value === null ||
      value.trim().length === 0) {
      return 'Geef het REST API endpoint van Zermelo in';
    }

    var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator

    if (!pattern.test(value)) {
      return 'Opgegeven REST API endpoint is geen geldige url';
    }
    return "";
  }

  private validateToken(value: string) {
    if (value === null ||
      value.trim().length === 0) {
      return 'Geef de REST API token van Zermelo in';
    }
    return "";
  }
  
  private validateListUrl(value: string) {
    if (value === null ||
      value.trim().length === 0) {
      return 'Geef de url van de Students list in'
      }
  }

  private getStudentEmail(): string {
    return this.context.pageContext.user.email;
  }

  public onInit(): Promise<void> {
    return new Promise<void>(async (resolve: () => void, reject: (error: any) => void): Promise<void> => {
      const serviceScope: ServiceScope = this.context.serviceScope.getParent();
      serviceScope.whenFinished((): void => {
        this.zermeloLiveRosterService = serviceScope.consume(ZermeloLiveRosterService.serviceKey);
        this.zermeloLiveRosterService.initZermeloLiveRosterService({
          clientUrl: this.properties.zermeloUrl,
          token: this.properties.token,
          student: this.getStudentEmail(),
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
                PropertyPaneTextField('zermeloUrl', {
                  label: strings.ZermeloUrlFieldLabel,
                  onGetErrorMessage: this.validateZermeloUrl.bind(this)
                }),
                PropertyPaneTextField('token', {
                  label: strings.TokenFieldLabel,
                  onGetErrorMessage: this.validateToken.bind(this)
                }),
                PropertyPaneTextField('spListUrl', {
                  label: strings.SharepointListUrlLabel,
                  onGetErrorMessage: this.validateListUrl.bind(this)
                })
              ]
            }
          ]
        }
      ]
    };
  }
}