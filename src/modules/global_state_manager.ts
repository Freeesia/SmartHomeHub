
class GlobalState {
  public config: any;
  public isWake: boolean;
  public isOut: boolean;
}

class GlobalStateManager {
  private state = new GlobalState();

  public get State(): GlobalState {
    return this.state
  }

  public Init(config: any) {
    this.state.config = config;
  }

  public CanSpeak(): boolean {
    return this.state.isWake && !this.state.isOut;
  }
}

const manager = new GlobalStateManager();

export default manager;