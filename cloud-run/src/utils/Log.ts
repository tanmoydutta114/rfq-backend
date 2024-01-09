export class Log {
    static globalLogFields: { [key: string]: string } = {};
  
    static i(message: string, ...otherProps: any) {
      if (otherProps?.length) {
        message = message + ` (Attached in jsonPayload: ${otherProps?.length})`;
      }
      const entry = Object.assign(
        {
          severity: "INFO",
          message,
          otherProps: otherProps?.length ? otherProps : null,
        },
        { globalLogFields: Log.globalLogFields }
      );
      // Serialize to a JSON string and output.
      console.log(JSON.stringify(entry));
    }
  
    static e(message: string, err?: Error | null, ...otherProps) {
      if (otherProps?.length) {
        message =
          message +
          ` (Attached in jsonPayload: ${otherProps?.length}, error: ${
            err ? "Yes" : "No"
          })`;
      }
      const entry = Object.assign(
        {
          severity: "ERROR",
          message,
          error: err?.stack ?? null,
          otherProps: otherProps?.length ? otherProps : null,
        },
        { globalLogFields: Log.globalLogFields }
      );
      // Serialize to a JSON string and output.
      console.log(JSON.stringify(entry));
    }
  }
  