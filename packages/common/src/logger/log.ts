enum LogType {
  Info = "info",
  Error = "error",
}

type Props = {
  type: LogType;
  message: string;
  payload?: object;
  module?: string;
  tenantId?: string;
};

class Log {
  type: LogType;

  date: Date;

  message: string;

  payload?: object;

  module?: string;

  tenantId?: string;

  constructor(props: Props) {
    this.date = new Date();
    this.type = props.type;
    this.message = props.message;
    this.payload = props.payload;
    this.module = props.module;
    this.tenantId = props.tenantId;
  }
}

export { Log, LogType };
