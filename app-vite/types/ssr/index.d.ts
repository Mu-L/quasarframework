import { HasSsr } from "quasar";
import { QSsrContext } from "./context";

export type HasSsrParam = HasSsr<{ ssrContext?: QSsrContext | null }>;

export { SsrDriver } from "./driver";
export * from "./ssrmiddleware";

export { QSsrContext };
