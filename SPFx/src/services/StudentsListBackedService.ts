
import { ServiceKey, ServiceScope } from "@microsoft/sp-core-library";
import { PageContext } from "@microsoft/sp-page-context";
import { SPFI, spfi, SPFx } from "@pnp/sp";
import { IWeb, Web } from "@pnp/sp/webs";
import { IRenderListDataParameters } from "@pnp/sp/lists";
import "@pnp/sp/webs";
import "@pnp/sp/lists/web";
import { IList } from "@pnp/sp/lists";
import { gridRowBehavior, listItemBehavior, treeItemAsListItemBehavior } from "@fluentui/react-northstar";
import { _GraphQueryable } from "@pnp/graph/graphqueryable";
import {
    Logger,
    LogLevel
} from "@pnp/logging";

export interface IStudentsListBackedService {
   getStudents(): Promise<any>
}

export interface IStudent {
    email: string;
    code: string;
}

export class StudentsListBackedService {

    public static readonly serviceKey: ServiceKey<IStudentsListBackedService> =
        ServiceKey.create<IStudentsListBackedService>('App:StudentsListBackedService', StudentsListBackedService);
    private _sp: SPFI;
    private _web: IWeb;
    
    constructor(serviceScope: ServiceScope) {

        serviceScope.whenFinished(() => {

            const pageContext = serviceScope.consume(PageContext.serviceKey);
            this._sp = spfi().using(SPFx({ pageContext }));
            //this._web = Web(pageContext.web.absoluteUrl).using(SPFx({ pageContext }));
            this._web = Web("https://speykedu.sharepoint.com/sites/Digiplein365").using(SPFx({ pageContext }));
        });
    }
 
    public async getStudents(): Promise<any> {
        let students: IStudent[] = [];
        const ViewXml: string = "<View Scope=\"RecursiveAll\"></View>";
        const list = await this._web.lists.getByTitle("Students").renderListData(ViewXml);
        if (list.Row.length == 0) return students;
        for (let i = list.FirstRow-1; i < list.LastRow; i++) {
            if ((list.Row[i].code !== undefined) && (list.Row[i].email !== undefined)){
                let student: IStudent = { "code": list.Row[i].code, "email": list.Row[i].email };
                students.push(student);
        }
        return students;
       }
    }
}