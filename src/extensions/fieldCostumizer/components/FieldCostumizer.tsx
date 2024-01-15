
import * as React from 'react';
import { Log } from '@microsoft/sp-core-library';

export interface IGearIconFieldCustomizerProps {
  text: string;
}
const LOG_SOURCE: string = 'FieldCostumizer';

export default class GearIconFieldCustomizer extends React.Component<IGearIconFieldCustomizerProps, {}> {
  public componentWillUnmount(): void {
    Log.info(LOG_SOURCE, 'React Element: FieldCostumizer unmounted');
  }
  public constructor(props: IGearIconFieldCustomizerProps) {
    super(props);
  }
  public componentDidMount(): void {
    Log.info(LOG_SOURCE, 'React Element: FieldCostumizer mounted');
  }
  public render(): React.ReactElement<{}> {
    return (
      <div>
       {/*<IconButton
          iconProps={{ iconName: 'Gear' }}
          title="Settings"
          ariaLabel="Settings"
    />*/}
      assd
      </div>
    );
  }
}
