import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Log } from '@microsoft/sp-core-library';
import {
  BaseFieldCustomizer,
  type IFieldCustomizerCellEventParameters
} from '@microsoft/sp-listview-extensibility';


import Costumizer, { ICostumizerProps } from './components/Costumizer';
import SPService from '../../services/SPService';

/**
 * If your field customizer uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface ICostumizerFieldCustomizerProperties {
  // This is an example; replace with your own property
  sampleText?: string;
}



export default class CostumizerFieldCustomizer
  extends BaseFieldCustomizer<ICostumizerFieldCustomizerProperties> {

    public onInit(): Promise<void> {
    
      SPService.init(this.context);
  
      Log.info('Costumizer', 'Field Customizer inicializálva');
      return Promise.resolve();
    }

    public onRenderCell(event: IFieldCustomizerCellEventParameters): void {
      
      const props: ICostumizerProps = {
        itemId: event.listItem.getValueByName('ID'),
        listId: this.context.pageContext.list?.id.toString(),
        context: this.context  
      };
    
      const costumizer: React.ReactElement<{}> = React.createElement(Costumizer, props);
    
     
      ReactDOM.render(costumizer, event.domElement);
    }
    

  public onDisposeCell(event: IFieldCustomizerCellEventParameters): void {
    // This method should be used to free any resources that were allocated during rendering.
    // For example, if your onRenderCell() called ReactDOM.render(), then you should
    // call ReactDOM.unmountComponentAtNode() here.
    ReactDOM.unmountComponentAtNode(event.domElement);
    super.onDisposeCell(event);
  }
}
