import { ServiceKey } from "@microsoft/sp-core-library";
import { SomTodayEvents } from "../model/SomTodayEvent"
import { Homework } from "../model/SomTodayHomeworkResp"

export default class SomTodayService {
    
    public static readonly serviceKey: ServiceKey<SomTodayService> =
        ServiceKey.create<SomTodayService>("App.ZermeloLiveRosterService", SomTodayService);

    private somTodayToTeamsEvents(homework: Homework[]): SomTodayEvents {
        let events: SomTodayEvents = [];
        homework.forEach( (homework) => {
            let endDate = new Date(homework.begindatum);
            const uren = endDate.getHours();
            if (uren !== 0){
                endDate.setMinutes(endDate.getMinutes() + 40);
            }
            let baseEvent = {
                "id": homework.huiswerkUUID,
                "start": new Date(homework.begindatum),
                "end": endDate,
                "onderwerp": homework.onderwerp,
                "omschrijving": homework.omschrijving,
                "notitie": homework.notitie,
                "huiswerktype": homework.huiswerktype,
                "vaknaam": homework.vaknaam,
                "leerdoelen": homework.leerdoelen,
                "externMateriaal": homework.externMateriaal
            }
            events.push(baseEvent);
        })
        return events;
    }

    public async fetchHomework() {
        try {
            let token = "";
            const respToken = await fetch('https://inloggen.somtoday.nl/oauth2/token?organisation=1349fac3-259a-44fd-a1f1-6fe5f8a2f39e&client_id=3fbbc39e-784d-434f-aa77-ec12be683669&client_secret=b9a940ff-f01a-40d6-a31c-61f4bc07af62&grant_type=client_credentials', {
                method: 'POST',
                mode: 'cors',
                cache: 'no-cache',
                credentials: 'same-origin',
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded'
                }
              });
            if (respToken.ok) {
                const jsonToken = await respToken.json();
                token = jsonToken.access_token;
            }
            
            const respHomework = await fetch('https://api.somtoday.nl/rest/v1/connect/vestiging/064276aa-6448-409b-b6e7-9dc63df931ca/leerling/4b1e3430-c38e-414c-8340-dd1cff369c1c/huiswerk', {
                  headers: {
                    'Authorization': 'Bearer ' + token
                  }
                });
            if (respHomework.ok) {
                const jsonHomework = await respHomework.json();
                return Promise.resolve(this.somTodayToTeamsEvents(jsonHomework.huiswerk));
            }
            return Promise.resolve([]);
        }
        catch (error) {
            return Promise.reject(error);
        }
    }
}