import { EventEmitter } from 'events';

class updatedPermissionEmitter extends EventEmitter {}
const updatedPermissionEvent = new updatedPermissionEmitter();

export default updatedPermissionEvent;