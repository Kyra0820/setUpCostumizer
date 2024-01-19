import { BaseComponentContext } from '@microsoft/sp-component-base';
import { SPFx, spfi, SPFI } from '@pnp/sp';
import "@pnp/sp/webs";
import "@pnp/sp/fields";
import "@pnp/sp/lists"
import "@pnp/sp/items";
import "@pnp/sp/views";
import "@pnp/sp/site-users/web";
import { AddFieldOptions, IFieldAddResult } from '@pnp/sp/fields';
import { SPHttpClient, SPHttpClientResponse} from '@microsoft/sp-http';
//import { IWebEnsureUserResult } from '@pnp/sp/site-users/types';


/**
 * Singleton class SharePoint hívásokhozs
 */
export default class SPService {
    private static _current: SPService;
    private _spfi: SPFI;
    private _sphttpclient: SPHttpClient;
    //private relativeUrl: string;
    public static get current(): SPService {
        if (!this._current) {
            throw new Error("SPService not initialized");
        }
        return this._current;
    }

    /**
     * Instance inicializálása, pnp inicializálása
     * Minden belépési pontból meg kell hívni, azaz web part, field customzer, application customizer, stb
     * @param context Base Compoenent Context
     */
    public ctx : BaseComponentContext;
    public static init(context: BaseComponentContext): void {
      if (!this._current) {
        this._current = new SPService();
        this._current._spfi = spfi().using(SPFx(context));
        this._current._sphttpclient = context.spHttpClient;
        //this._current.relativeUrl = context.pageContext.web.serverRelativeUrl;
      }
    }
    

    

    /**
     * Oszlop hozzáadása a listához
     * Hozzáadja az összes content type-hoz, a default view-hoz és a megadott static névvel hozza létre az oszlopot
     * @returns 
     */
    public async AddColumnToList(): Promise<IFieldAddResult> {

        // itt ha megnézed a createFieldAsXml leírását (F12) akkor látod, hogy kétfajta paramétert adhatunk meg neki, string-et vagy objectet
        // object esetében pedig az Options paraméterrel lehet hinteket adni (típusa: AddFieldOptions) és azt érdemes tudni róla, hogy az egyes enum értékeket össze lehet adni
        // azaz ha szeretnénk, hogy a megadott static névvel jöjjön létre az oszlop és a default view-hoz is hozzá legyen adva, akkor az alábbiakat kell használnunk:
        // AddToAllContentTypes + AddFieldInternalNameHint + AddFieldToDefaultView

        // valamint felhívnám a figyelmet a visszatérési érték figyelésére is (legalább böngészőben nézd meg a network fülön, hogy mit ad vissza)

        // ezeket persze szebb paraméterként beadni, de most így egyszerűbb
        const listRelativeUrl = "/sites/Adatlistak/Lists/Tantrgyak";
        const xml = `<Field Type="Text" DisplayName="CustomColumn" StaticName="CustomColumn" Name="CustomColumn" />`;
       
        return this._spfi.web.getList(listRelativeUrl).fields.createFieldAsXml(
            {
                SchemaXml: xml,
                Options: AddFieldOptions.AddToAllContentTypes
                    + AddFieldOptions.AddFieldInternalNameHint
                    + AddFieldOptions.AddFieldToDefaultView
            }
        );
    }

    /**
     * Oszlop hozzáadása a default view-hoz
     * @returns 
     */
    public async AddColumnToView(): Promise<void> {
        // ezeket persze szebb paraméterként beadni, de most így egyszerűbb
        const listRelativeUrl = "/sites/Adatlistak/Lists/Tantrgyak";
        const fieldName = "CustomColumn"

        // itt nincs visszatérési érték, de ha szépen szeretnénk csinálni akkor készülni kell rá, hogy dobhat exception-t
        return this._spfi.web.getList(listRelativeUrl).defaultView.fields.add(fieldName);
    }

    public async CheckFieldOnList(listRelativeUrl: string, fieldName: string): Promise<boolean> {
        try {
            // Lekéri az adott oszlopot a megadott listán
            const field = await this._spfi.web.getList(listRelativeUrl).fields.getByInternalNameOrTitle(fieldName)();
            // Ha a field objektum létezik és nem üres, az oszlop létezik
            return !!field;
        } catch (error) {
            // Ha a field nem létezik vagy más hiba történik, false-szal tér vissza
            console.error('Hiba történt az oszlop ellenőrzése közben:', error);
            return false;
        }
    }
    
    public async GetFieldId(listRelativeUrl: string, fieldName: string): Promise<string> {
    try {
        const field = await this._spfi.web.getList(listRelativeUrl).fields.getByInternalNameOrTitle(fieldName).select('Id')();
        return field.Id;
    } catch (error) {
        console.error('Error getting field ID:', error);
        return '';
    }
}

public async UpdateListColumn(columnId: string, extensionId: string, extensionProperties?: string): Promise<void> {
 
  const endpoint: string = `https://kyra1025.sharepoint.com/sites/Adatlistak/_api/web/lists/getbytitle('Tantárgyak')/fields(guid'${columnId}')`;
  await this._sphttpclient.post(
    endpoint,
    SPHttpClient.configurations.v1,
    {
      headers: {
        'ACCEPT': 'application/json; odata.metadata=none',
        'CONTENT-TYPE': 'application/json',
        'X-HTTP-Method': 'MERGE'
      },
      body: JSON.stringify({
        ClientSideComponentId: extensionId,
        ClientSideComponentProperties: extensionProperties
      })
    }
  );
}  
public async AddGearIconFieldCustomizerToList(columnName: string): Promise<void> {
    try {
      //const listRelativeUrl = "/sites/Adatlistak/Lists/Tantrgyak";
      const fieldCustomizerId = "8d0a27e2-1e34-4151-a29f-c4709b8b1df9"; 
    const listName = "Tantárgyak";
      const body: string = JSON.stringify({
        ClientSideComponentId: fieldCustomizerId
        
      });
      this._sphttpclient.get(`https://kyra1025.sharepoint.com/sites/Adatlistak/_api/web/lists/getbytitle('${listName}')/fields/getbyinternalnameortitle('${columnName}')`,  
      SPHttpClient.configurations.v1)  
      .then((response: SPHttpClientResponse) => {  
        response.json().then((responseJSON: any) => {  
          console.log(responseJSON); 
          this.UpdateListColumn(responseJSON.Id, fieldCustomizerId) 
        });  
      });  
      await fetch(`https://kyra1025.sharepoint.com/sites/Adatlistak/_api/web/lists/getbytitle('${listName}')/fields/getbyinternalnameortitle('${columnName}')`, {
        method: 'POST',
        body: body,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'odata-version': ''
        }
      });
      
      console.log(`Field Customizer successfully added to column ${columnName}`);
    } catch (error) {
      console.error('Error adding Gear Icon Field Customizer:', error);
      throw error;
    }
  }

  public async getCourseData(listId: string, itemId: number): Promise<any> {
    try {
      const response: SPHttpClientResponse = await this._sphttpclient.get(
        `/sites/Adatlistak/_api/web/lists(guid'${listId}')/items(${itemId})`,
        SPHttpClient.configurations.v1,
        {
          headers: {
            'Accept': 'application/json;odata=nometadata',
            'odata-version': ''
          }
        }
      );
      console.log('getCourseData called with listName:', listId, 'and itemId:', itemId);

      if (response.ok) {
        const item = await response.json();
        return item;
      } else {
        console.error(`HTTP error status: ${response.status}`);
        return null; 
      }
    } catch (error) {
      console.error('Error getting course data:', error);
      return null; 
    }
    

  }


  public async updateCourseData(listId: string, itemId: number, courseData: any): Promise<void> {
    try {
      const formValues = Object.keys(courseData).map(key => {
        const value = courseData[key];
      
    
        if (typeof value === 'object' && value !== null && 'Url' in value) {
          return {
            FieldName: key,
            FieldValue: `${value.Description}, ${value.Url}`
          };
        } else {
          return {
            FieldName: key,
            FieldValue: value?.toString() || ""
          };
        }
      });
      
      
      
      await this._spfi.web.lists.getById(listId).items.getById(itemId).validateUpdateListItem(formValues);
  
    } catch (error) {
      console.error('Hiba történt a lista elem frissítésekor:', error);
      throw error;
    }
  }
  

  
  public async getStudentsByCourse(courseName: string): Promise<any[]> {
    try {
      const items: any[] = await this._spfi.web.lists.getByTitle('Students').items
        .filter(`Subject eq '${courseName}'`)
        .expand('Students')
        .select('Title', 'Students/Id', 'Students/Title')
        ();
  
      return items.map((item) => ({
        title: item.Title,
        students: item.Students
      }));
    } catch (error) {
      console.error('Error getting students:', error);
      return [];
    }
  }
  public async getCourseNameById(courseId: number): Promise<string> {
    try {
      const item: any = await this._spfi.web.lists.getByTitle('Tantárgyak').items.getById(courseId).select('T_x00e1_egyneve')();
      return item.T_x00e1_egyneve;
    } catch (error) {
      console.error('Error getting course name:', error);
      return '';
    }
  }
  public async getAllStudents(): Promise<any[]> {
    try {
      const student = await this._spfi.web.lists.getByTitle('Students').items.select('Title', 'Id')();
      return student.map((student: { Id: any; Title: any; }) => ({
        id: student.Id,
        text: student.Title
      }));
    } catch (error) {
      console.error('Error getting all students:', error);
      return [];
    }
  }
  public async addStudentsToCourse(subjectTitle: string, newStudentNames: string[]): Promise<void> {
    try {
      const subjectItem = (await this._spfi.web.lists.getByTitle('Students').items
        .filter(`Subject eq '${subjectTitle}'`)
        .expand('Students')
        .select('Id', 'Students/Id')())[0];
  
      if (!subjectItem) {
        console.error('Subject not found:', subjectTitle);
        return;
      }
      console.log(subjectTitle);
      const users =  await Promise.all(newStudentNames.map(name => this._spfi.web.ensureUser(name)));

      const existingStudentIds : number[] = subjectItem.Students.map((s: { Id: any; }) => s.Id);
      const userIds = users.map(user => user.data.Id);

      existingStudentIds.push(...userIds);
    
     
        await this._spfi.web.lists.getByTitle('Students').items.getById(subjectItem.Id).update({
          StudentsId: existingStudentIds 
         
        });
       
      } 
     catch (error) {
      console.error('Error adding students to course:', error);
    }
  }
  
  
  


 public async getStudentId(username: string): Promise<number> {
  try {
    // Ellenőrizzük, hogy a felhasználó létezik-e a SharePoint-ban
    const userResult = await this._spfi.web.ensureUser(username);

    // Visszaadjuk a felhasználó azonosítóját
    return userResult.data.Id;
  } catch (error) {
    console.error('Error getting user ID for username:', username, error);
    return -1;
  }
}

}



  
  
  
  
  
