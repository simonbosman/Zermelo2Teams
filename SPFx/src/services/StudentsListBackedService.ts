
import { ServiceKey, ServiceScope } from "@microsoft/sp-core-library";
import { PageContext } from "@microsoft/sp-page-context";
import { SPFI, SPFx, spfi } from "@pnp/sp";
import { IWeb, Web } from "@pnp/sp/webs";
import "@pnp/sp/webs";
import "@pnp/sp/lists/web";
import { _GraphQueryable } from "@pnp/graph/graphqueryable";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import { IItemAddResult } from "@pnp/sp/items";

export interface IStudentsListBackedService {
   getStudents(): Promise<any>;
   addStudent(code: string, email: string): Promise<void>;
   initStudentsListBackedService(spInitPath: string): void;
}

export interface IStudent {
    email: string;
    code: string;
}

export class StudentsListBackedService {

    public static readonly serviceKey: ServiceKey<IStudentsListBackedService> =
        ServiceKey.create<IStudentsListBackedService>('App:StudentsListBackedService', StudentsListBackedService);
    private  _spfi: SPFI;
    private _web: IWeb;
    private _spInitPath: string;
    private _pageContext: PageContext;
    
    constructor(serviceScope: ServiceScope) {

        serviceScope.whenFinished(() => {
            this._pageContext = serviceScope.consume(PageContext.serviceKey);
        });
    }

    public async initStudentsListBackedService(spInitPath: string) {
        this._spInitPath = spInitPath;
        const pageContext  = this._pageContext;
        this._spfi = spfi(this._spInitPath).using(SPFx ({ pageContext }));
        this._web = Web(this._spInitPath).using(SPFx({ pageContext }));
    }

    public async addStudent(code: string, email: string) {
          const iar: IItemAddResult = await this._spfi.web.lists.getByTitle("Students").items.add({
            code: code,
            email: email
        });
    }
 
    public async getStudents(): Promise<any> {
        let students: IStudent[] = [];
        const ViewXml: string = "<View Scope=\"RecursiveAll\"></View>";
        const list = await this._web.lists.getByTitle("Students").renderListData(ViewXml);
        if (list.Row.length == 0) return students;
        
        for (var i = list.FirstRow-1; i < list.LastRow; i++) {
            if ((list.Row[i].code !== undefined) && (list.Row[i].email !== undefined)){
                students.push({ "code": list.Row[i].code, "email": list.Row[i].email });
            }
        }
        return students;
       }
    }
