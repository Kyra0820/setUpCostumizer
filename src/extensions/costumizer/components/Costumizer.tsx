import * as React from 'react';
import { IconButton, Panel, PanelType, Pivot, PivotItem, TextField, PrimaryButton, Toggle } from '@fluentui/react';
import SPService from '../../../services/SPService';
import { PeoplePicker, PrincipalType } from '@pnp/spfx-controls-react/lib/PeoplePicker';
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { FieldCustomizerContext } from '@microsoft/sp-listview-extensibility';
export interface ICostumizerProps {
  listId?: string;
  itemId: number; 
  context?: WebPartContext | FieldCustomizerContext; 
}

export interface ICostumizerState {
  isPanelOpen: boolean;
  courseName: string;
  teachers: string;
  isActive: boolean;
  capacity: number;
  description: string;
  link: string;
  classroom: string;
  isFull: boolean;
  building: string;
  students: any[];
  
}

export default class Costumizer extends React.Component<ICostumizerProps, ICostumizerState> {
  

  constructor(props: ICostumizerProps) {
    super(props);
    this.state = {
      isPanelOpen: false,
      courseName: '',
      teachers: '',
      isActive: false,
      capacity: 0,
      description: '',
      link: '',
      classroom: '',
      isFull: false,
      building: '',
      students: []
    };
    this.context = props.context;
    
  


    if (!this.props.listId || !this.props.itemId) {
      console.error('listName vagy itemId nincs inicializálva.');
    }
  }

  
  
  private onIconButtonClick = async (): Promise<void> => {
    try {
     
      const courseData = await SPService.current.getCourseData(this.props.listId || '', this.props.itemId);

      if (courseData) {
     
        this.setState({
          courseName: courseData.T_x00e1_egyneve || '',
          teachers: courseData.Tan_x00e1_rok || '',
          isActive: courseData.Akt_x00ed_v_x0028_tan_x00ed_tj_x || false,
          capacity: courseData.L_x00e9_tsz_x00e1_m || 0,
          description: courseData.R_x00f6_vidle_x00ed_r_x00e1_s || '',
          link: courseData.Link?.Url || '',
          classroom: courseData.Tanterem || '',
          isFull: courseData.Megtelt || false,
          building: courseData.OData__x00c9_p_x00fc_let || ''
        });

   
        const courseId = this.props.itemId;
        const courseName = await SPService.current.getCourseNameById(courseId);
        const students = await SPService.current.getStudentsByCourse(courseName);

        this.setState({ students });
      }

   
      this.setState({ isPanelOpen: true });
    } catch (error) {
      console.error('Hiba történt az adatok betöltésekor:', error);
    }
  };

  private onClosePanel = (): void => {
    this.setState({ isPanelOpen: false });
  };

 

  private onSave = async (): Promise<void> => {
    const { listId, itemId } = this.props;
    const { courseName, teachers, isActive, capacity, description, classroom, link, isFull, building } = this.state;
  
    if (!listId || !itemId) {
      console.error('listId vagy itemId nincs megadva.');
      return;
    }
  
    const courseData = {
      T_x00e1_egyneve: courseName,
      Tan_x00e1_rok: teachers,
      Akt_x00ed_v_x0028_tan_x00ed_tj_x: isActive,
      L_x00e9_tsz_x00e1_m: capacity,
      R_x00f6_vidle_x00ed_r_x00e1_s: description,
      Link: { Url: link },
      Tanterem: classroom,
      Megtelt: isFull,
      OData__x00c9_p_x00fc_let: building
    };
  
    try {
      await SPService.current.updateCourseData(listId, itemId, courseData);
      this.setState({ isPanelOpen: false }); 
    } catch (error) {
      console.error('Hiba az adatok mentésekor:', error);
    }
  };
  
  
  public render(): React.ReactElement<{}> {
    const isWebPartContext = this.props.context instanceof WebPartContext;

    return (
      <div>
        <IconButton
          iconProps={{ iconName: 'Settings' }}
          title="Settings"
          ariaLabel="Settings"
          onClick={this.onIconButtonClick}
        />
        <Panel
          isOpen={this.state.isPanelOpen}
          onDismiss={this.onClosePanel}
          type={PanelType.smallFixedFar}
          headerText="Tantárgy Információk"
        >
          <Pivot aria-label="Tantárgy Információk">
            <PivotItem headerText="Alapadatok">
              <TextField label="Tantárgy neve" value={this.state.courseName} onChange={(e, newValue) => this.setState({ courseName: newValue || '' })} />
              <TextField label="Tanárok" value={this.state.teachers} onChange={(e, newValue) => this.setState({ teachers: newValue || '' })} />
              <Toggle label="Aktív" checked={this.state.isActive} onChange={(e, checked) => this.setState({ isActive: !!checked })} />
              <TextField label="Létszám" type="number" value={this.state.capacity.toString()} onChange={(e, newValue) => {
                const newCapacity = newValue ? parseInt(newValue, 10) : 0;
                this.setState({ capacity: newCapacity });
              }} />
              <TextField label="Rövid leírás" value={this.state.description} onChange={(e, newValue) => this.setState({ description: newValue || '' })} />
              <TextField label="Link" value={this.state.link} onChange={(e, newValue) => this.setState({ link: newValue || '' })} />
              <TextField label="Tanterem" value={this.state.classroom} onChange={(e, newValue) => this.setState({ classroom: newValue || '' })} />
              <TextField label="Épület" value={this.state.building} onChange={(e, newValue) => this.setState({ building: newValue || '' })} />
              <PrimaryButton text="Mentés" onClick={this.onSave} style={{ marginTop: '20px' }} />
            </PivotItem>
            <PivotItem headerText="Diákok">
              {isWebPartContext && this.state.students.map((student, index) => (
                <PeoplePicker
                  key={index}
                  context={this.props.context as WebPartContext}
                  personSelectionLimit={1}
                  principalTypes={[PrincipalType.User]}
                  defaultSelectedUsers={[student.email]}
                  disabled={true}
                />
              ))}
            </PivotItem>
          </Pivot>
        </Panel>
      </div>
    );
  }
}
