import * as React from "react";
import * as ReactDom from "react-dom";
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import App, { AppProps } from "../../App";
import { ServiceScope } from "@microsoft/sp-core-library";
import { ZermeloLiveRosterService } from "../../services/ZermeloLiveRosterService";

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
          //TODO: Use paneproperties?
          clientUrl: "https://v21-10-speyk.zportal.nl",
          token: "5laek7o5hr2ipv45qu4h2ml774",
          //token: "k3btlqtrv686uivajd8lmiu2",
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
}
