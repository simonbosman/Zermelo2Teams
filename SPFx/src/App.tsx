import { WebPartContext } from '@microsoft/sp-webpart-base';
import * as React from 'react';
import { Provider, teamsTheme, Loader } from '@fluentui/react-northstar';
import CalendarComponent, { CalendarProps } from './components/CalendarComponent';
import { ZermeloEvents } from './model/ZermeloEvent';
import { ZermeloLiveRosterService } from './services/ZermeloLiveRosterService';

export type AppProps = {
    zermeloLiveRosterService: ZermeloLiveRosterService;
    context: WebPartContext;
};

type AppState = {
    events: ZermeloEvents;
    isLoading: boolean;
};

export default class App extends React.Component<AppProps, AppState> {

    constructor(props: AppProps) {
        super(props);
        this.state = {
            events: [],
            isLoading: false,
        };
        this.handleActionChange = this.handleActionChange.bind(this);
        this.handleReload = this.handleReload.bind(this);
    }

    public async handleActionChange(action: string) {
        const { zermeloLiveRosterService } = this.props;
        await zermeloLiveRosterService.postAction(action);
    }

    public async handleReload() {
        setTimeout(() => { this.getItems(); }, 1500);
    }

    public async componentDidMount() {
        const { zermeloLiveRosterService } = this.props;
        await this.getItems();
    }

    private async getItems(): Promise<void> {
        try {
            const { zermeloLiveRosterService } = this.props;
            this.setState({ isLoading: true });
            await zermeloLiveRosterService.setStudent();
            let events: ZermeloEvents = await zermeloLiveRosterService.getEventsForWeeks(3);
            this.setState({
                isLoading: false,
                events: events,
            });
        }
        catch (error) {
            this.setState({ isLoading: false });
            console.error(error);
        }
    }

    public render(): React.ReactElement<CalendarProps> {
        const { events, isLoading } = this.state;
        return (
                <Provider theme={teamsTheme}>
                    <div>
                        {
                            isLoading &&
                            <Loader label={{ content: "Rooster wordt opgehaald...", size: "large" }} size="larger" />
                        }
                        {
                            events.length > 0 &&
                            <CalendarComponent events={events} context={this.context} onActionChange={this.handleActionChange} onReload={this.handleReload} />
                        }
                    </div>
                </Provider>
        );
    }
}
