import {IUser} from "../interfaces/IUser";
import {User} from "../models/User";
import userCreatedEvent from "../events/userCreatedEvent";

class UserService {


    static createUser = async (data: any): Promise<IUser>  => {
        const newUser = await User.create<User>(data)
        userCreatedEvent.emit('userCreated', newUser); // Emit the event
        return newUser;
    }
}
export default UserService;
