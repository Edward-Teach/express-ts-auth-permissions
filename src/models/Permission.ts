import { BelongsToMany, Column, DataType, HasMany, Model, Table, } from 'sequelize-typescript';
import { User } from './User';
import { UserPermission } from "./UserPermission";
import { RolePermission } from "./RolePermission";
import { Role } from "./Role";

@Table({
    tableName: 'permissions',
    timestamps: true,
})
export class Permission extends Model {

    @Column(DataType.STRING)
    declare name: string;

    @HasMany(() => UserPermission)
    userPermissions!: UserPermission[];

    @HasMany(() => RolePermission)
    rolePermission!: RolePermission[];

    @BelongsToMany(() => User, () => UserPermission)
    users!: User[];

    @BelongsToMany(() => Role, () => RolePermission)
    roles!: Role[];

    toJSON(): object {
        const obj = this.get();
        const values: any = {};
        values.id = this.id;
        values.name = this.name;
        values.roles = obj.roles?.map((p: Role) => p.name);
        return values;
    }
}