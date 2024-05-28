import {Table, Column, Model, DataType, Unique} from 'sequelize-typescript';
import {IUser} from "../interfaces/IUser";
import { format, parseISO } from 'date-fns';

/**
 * User model for Sequelize ORM.
 * Implements IUser interface.
 *
 * @remarks
 * This model represents a user in the application.
 * It includes fields for username, email, password, verifier, MFA secret, email verification date,
 * password expiration date, and password verification date.
 *
 * @extends Model<User>
 * @implements IUser
 */
@Table({
    tableName: 'users'
})
export class User extends Model implements IUser {
    /**
     * Unique username of the user.
     *
     * @remarks
     * This field is required and must be unique.
     * A validation message is displayed if the username is not provided or already taken.
     */
    @Unique({
        name: 'username',
        msg: 'Username already taken, Please try a different username'
    })
    @Column({
        type: DataType.STRING,
        allowNull: false,
        validate: {
            notNull: {msg: 'username is required'}
        }
    })
    declare name: string;

    /**
     * Unique email of the user.
     *
     * @remarks
     * This field is required and must be unique.
     * A validation message is displayed if the email is not provided or already taken.
     */
    @Unique({
        name: 'email',
        msg: 'email already taken, Please try a different email'
    })
    @Column({
        type: DataType.STRING,
        allowNull: false,
        validate: {
            notNull: {msg: 'email is required'}
        }
    })
    declare email: string;

    /**
     * Password of the user.
     *
     * @remarks
     * This field is required.
     * A validation message is displayed if the password is not provided.
     */
    @Column({
        type: DataType.STRING,
        allowNull: false,
        validate: {
            notNull: {msg: 'Password is required'}
        }
    })
    declare password: string;

    /**
     * Verifier of the user.
     *
     * @remarks
     * This field is required.
     * A validation message is displayed if the verifier is not provided.
     */
    @Column({
        type: DataType.STRING,
        allowNull: false,
        validate: {
            notNull: {msg: 'Verifier is required'}
        }
    })
    declare verifier: string;

    /**
     * MFA secret of the user.
     *
     * @remarks
     * This field is optional.
     */
    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    declare mfaSecret: string;

    /**
     * Email verification date of the user.
     *
     * @remarks
     * This field is optional.
     */
    @Column({
        type: DataType.DATE,
        allowNull: true
    })
    declare emailVerifiedAt: string;

    /**
     * Password expiration date of the user.
     *
     * @remarks
     * This field is required.
     */
    @Column({
        type: DataType.DATE,
        allowNull: false
    })
    declare passwordExpiresAt: string;


    /**
     * Custom toJSON method to exclude sensitive fields.
     *
     * @remarks
     * This method is called when converting the user object to JSON.
     * It returns a new object with the same properties as the original object,
     * but with the 'erifier' and 'password' fields set to null.
     *
     * @returns {object} - The user object with sensitive fields excluded.
     */
    toJSON(): object {
        const values : any = { };
        values.id = this.id;
        values.name = this.name;
        values.email = this.email;
        if (this.passwordExpiresAt) {
            values.passwordExpiresAt = format(this.passwordExpiresAt, 'yyyy-MM-dd HH:mm:ss');
        }
        return values;
    }
}
