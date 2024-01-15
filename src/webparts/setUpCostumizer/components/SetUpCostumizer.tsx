import * as React from 'react';
import { ISetUpCustomizerProps } from './ISetUpCostumizerProps';
import { DefaultButton, Spinner, SpinnerSize, TextField } from '@fluentui/react';
import { ISetUpCustomizerState } from './ISetUpCostumizerState';
import SPService from '../../../services/SPService';

export default class SetUpCustomizer extends React.Component<ISetUpCustomizerProps, ISetUpCustomizerState> {

  constructor(props: ISetUpCustomizerProps) {
    super(props);

    this.state = {
      isLoading: true,
      isFieldAdded: false
    };
  }
  async componentDidMount(): Promise<void> {
    try {
        const listRelativeUrl = "/sites/Adatlistak/Lists/Tantrgyak";
        const fieldName = "CustomColumn";
        const isFieldAdded: boolean = await SPService.current.CheckFieldOnList(listRelativeUrl, fieldName);
        const fieldId: string = await SPService.current.GetFieldId(listRelativeUrl, fieldName);

        this.setState({
            isFieldAdded,
            isLoading: false,
            componentID: fieldId
        });

        console.log('Field check successful. Field added:', isFieldAdded, 'Field ID:', fieldId);
    } catch (error) {
        console.error('Error:', error);
        this.setState({ isLoading: false });
    }
}


 
  
  private _onTextChange = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string): void => {
    this.setState({ componentID: newValue });
  }

  private _addField = async (): Promise<void> => {
    this.setState({ isWorking: true }, async () => {
      const result = await SPService.current.AddColumnToList();
      // TODO: result megnézése nem árt
      console.log(result);

      this.setState({
        isWorking: false,
        isFieldAdded: true
      });
    });
  }

  private _addCustomizer = async (): Promise<void> => {
    this.setState({ isWorking: true });

  try {
    await SPService.current.AddGearIconFieldCustomizerToList('CustomColumn');
    console.log('Field customizer added successfully.');
  } catch (error) {
    console.error('Error adding field customizer:', error);
  } finally {
    this.setState({ isWorking: false });
  }
  }


  public render(): React.ReactElement<ISetUpCustomizerProps> {
    if (this.state.isLoading) {
      return <Spinner size={SpinnerSize.large} label="Betöltés..." />;
    }
  
    return (
      <div>
        <DefaultButton
          text="Oszlop hozzáadása"
          onClick={this._addField}
          disabled={this.state.isWorking || this.state.isFieldAdded}
        />
  
        {this.state.isFieldAdded && (
          <div>
            <p>Oszlop már hozzá lett adva.</p>
            <TextField label="Component ID" onChange={this._onTextChange} disabled={this.state.isWorking}  value={this.state.componentID} />
            <DefaultButton
              text="Field customizer hozzáadása"
              onClick={this._addCustomizer}
              disabled={this.state.isWorking}
            />
          </div>
        )}
      </div>
    );
  }
}

