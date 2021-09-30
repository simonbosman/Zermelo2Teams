import { WebPartContext } from '@microsoft/sp-webpart-base';
import * as React from 'react';
import { Provider, teamsTheme, Loader } from '@fluentui/react-northstar';
import CalendarComponent, { CalendarProps } from './components/CalendarComponent';
import { Events } from './model/Events';
import { ZermeloLiveRosterService } from './services/ZermeloLiveRosterService';

export type AppProps = {
    zermeloLiveRosterService: ZermeloLiveRosterService;
    context: WebPartContext;
};

type AppState = {
    events: Events;
    isLoading: boolean;
};

export default class App extends React.Component<AppProps, AppState> {
   
    constructor(props: AppProps) {
        super(props);
        this.state = {
            events: [],
            isLoading: false
        };
    }
    
    public componentDidMount() {
        this.getItems();
    }

    private async getItems(): Promise<void> {
        try {
            this.setState({isLoading: true});
            let events: Events = await this.props.zermeloLiveRosterService.getEventsForWeeks(3);
            this.setState({
                isLoading: false,
                events: events
            });
          }
          catch(error) {
            this.setState({isLoading: false});
            console.error(error);
          }
    }

    public render(): React.ReactElement<CalendarProps> {
        const events: Events = [];
        return(
            <Provider theme={teamsTheme}>
               <div>
                {
                    this.state.isLoading &&
                     <Loader label="Rooster wordt opgehaald..."/>
                }
                {   
                    this.state.events.length > 0 &&
                    <CalendarComponent events={this.state.events} context={this.context}/>
                }
            </div>
            </Provider>
        );
    }
}
