declare interface IListViewCommandSetStrings {
  Command1: string;
  Command2: string;
}

declare module 'ListViewCommandSetStrings' {
  const strings: IListViewCommandSetStrings;
  export = strings;
}
