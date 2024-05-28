import { EventEmitter } from 'events';

class userCreatedEmitter extends EventEmitter {}
const userCreatedEvent = new userCreatedEmitter();

export default userCreatedEvent;