import { DtManager } from './events/eventInstance';
import { EventsNames } from './triggers/index';

type DtManagerType = DtManager;
const dt = new DtManager();

export { dt, EventsNames, DtManagerType };
