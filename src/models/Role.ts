import { BelongsToMany, Column, DataType, HasMany, Model, Table, } from 'sequelize-typescript';
import { UserRole } from './UserRole';
import { User } from './User';
import { RolePermission } from "./RolePermission";
import { Permission } from "./Permission";

@Table({
    tableName: 'roles',
    timestamps: true,
    defaultScope: {
        include: ['permissions']
    }
})
export class Role extends Model {

    @Column(DataType.STRING)
    declare name: string;

    @HasMany(() => UserRole)
    userRoles!: UserRole[];

    @BelongsToMany(() => User, () => UserRole)
    users!: User[];

    @HasMany(() => RolePermission)
    rolePermissions!: RolePermission[];

    @BelongsToMany(() => Permission, () => RolePermission)
    permissions!: Permission[];

    toJSON(): object {
        const obj = this.get();
        const values: any = {};
        values.id = this.id;
        values.name = this.name;
        values.permissions = obj.permissions?.map((p: Permission) => p.name);
        return values;
    }
}