import { EventEmitter } from 'events';

class updatedRoleEmitter extends EventEmitter {}
const updatedRoleEvent = new updatedRoleEmitter();

export default updatedRoleEvent;