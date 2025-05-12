export interface Logger
  extends Pick<Console, "info" | "log" | "warn" | "error"> {}
