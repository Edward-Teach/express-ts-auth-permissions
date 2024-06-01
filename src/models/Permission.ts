import {
    Table,
    Column,
    Model,
    DataType,
    HasMany, BelongsToMany,
} from 'sequelize-typescript';
import { UserRole } from './UserRole';
import { User } from './User';
import { UserPermission } from "./UserPermission";

@Table({
    tableName: 'permissions',
    timestamps: true,
})
export class Permission extends Model {

    @Column(DataType.STRING)
    declare name: string;

    @HasMany(() => UserPermission)
    userPermissions!: UserPermission[];

    @BelongsToMany(() => User, () => UserPermission)
    users!: User[];

    toJSON(): object {
        const values : any = { };
        values.id = this.id;
        values.name = this.name;
        return values;
    }
}