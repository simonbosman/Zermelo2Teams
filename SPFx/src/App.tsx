import { WebPartContext } from '@microsoft/sp-webpart-base';
import * as React from 'react';
import { Provider, teamsTheme } from '@fluentui/react-northstar';
import CalendarComponent, { CalendarProps } from './components/CalendarComponent';
import { Events } from './model/Events';

export type AppProps = {
    events: Events;
    context: WebPartContext;
};

export default class App extends React.Component<AppProps> {
   
    public render(): React.ReactElement<CalendarProps> {
        const events: Events = this.props.events;
        return(
            <Provider>
             <div style={{ height: 700 }}>
                <CalendarComponent events={events} context={this.context}/>
            </div>
            </Provider>
        );
    }
}
