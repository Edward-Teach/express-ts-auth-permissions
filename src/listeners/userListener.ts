import {IUser} from "../interfaces/IUser";
import userCreatedEvent from "../events/userCreatedEvent";
import {randomUUID} from "node:crypto";
import {jobScheduler} from "../index";

// Define the action to take when the event is emitted
const onUserCreated = async (user: IUser) => {
    console.log(`User created: ${user.name}.. sending an email yolo`);
    // Perform additional actions, such as sending a welcome email
    // call job send verification email
    const timestamp = new Date().getTime();
    const job = {
        id: randomUUID(),
        timestamp,
        type: 'sendVerificationEmailJob',
        payload: {user},
    };
    await jobScheduler.scheduleJob(job)
};

// Register the listener
userCreatedEvent.on('userCreated', onUserCreated);