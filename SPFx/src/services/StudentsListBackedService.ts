
import { ServiceKey, ServiceScope } from "@microsoft/sp-core-library";
import { PageContext } from "@microsoft/sp-page-context";
import { SPFI, spfi, SPFx } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists/web";

export interface IStudentsListBackedService {
    getLists(): Promise<any[]>;
}

export class StudentsListBackedService {

    public static readonly serviceKey: ServiceKey<IStudentsListBackedService> =
        ServiceKey.create<IStudentsListBackedService>('App:StudentsListBackedService', StudentsListBackedService);
    private _sp: SPFI;

    constructor(serviceScope: ServiceScope) {

        serviceScope.whenFinished(() => {

            const pageContext = serviceScope.consume(PageContext.serviceKey);
            this._sp = spfi().using(SPFx({ pageContext }));
        });
    }

    public getLists(): Promise<any[]> {
        return this._sp.web.lists();
    }
}