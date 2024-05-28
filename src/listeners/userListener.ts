import {IUser} from "../interfaces/IUser";
import userCreatedEvent from "../events/userCreatedEvent";
import {randomUUID} from "node:crypto";
import {jobScheduler} from "../index";

const onUserCreated = async (user: IUser) => {
    const timestamp = new Date().getTime();
    const job = {
        id: randomUUID(),
        timestamp,
        type: 'sendVerificationEmailJob',
        payload: {user},
    };
    await jobScheduler.scheduleJob(job)
};
userCreatedEvent.on('userCreated', onUserCreated);