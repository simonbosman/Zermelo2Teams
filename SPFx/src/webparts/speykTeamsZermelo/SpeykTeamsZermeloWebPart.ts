import * as React from "react";
import * as ReactDom from "react-dom";
import { BaseClientSideWebPart, WebPartContext } from '@microsoft/sp-webpart-base';
import App, { AppProps, AppState } from "../../App";
import { ServiceScope } from "@microsoft/sp-core-library";
import { Events } from "../../model/Events";
import * as moment from "moment";
import { ZermeloLiveRosterService } from "../../services/ZermeloLiveRosterService";


export default class SpeykTeamsZermeloWebPart extends BaseClientSideWebPart<{}> {
 
  private events: Events;

  private zermeloLiveRosterService: ZermeloLiveRosterService;
 
  public onInit(): Promise<void> {
    return new Promise<void>(async (resolve: () => void, reject: (error: any) => void): Promise<void> => {
      const serviceScope: ServiceScope = this.context.serviceScope.getParent();
      serviceScope.whenFinished((): void => {
        this.zermeloLiveRosterService = serviceScope.consume(ZermeloLiveRosterService.serviceKey);
      });
  
      try {
        this.events = await this.zermeloLiveRosterService.getEventsForWeeks(3);
      }
      catch(error) {
        console.error(error);
        reject(error);
      }
      resolve();
    });
  }
  

  public render(): void {
    const app: React.ReactElement<AppProps> = React.createElement(
      App, {
        events: this.events,
        context: this.context
      });
    ReactDom.render(app, this.domElement);
  }
}
