import {
    Table,
    Model, PrimaryKey, ForeignKey, Column, DataType,
} from 'sequelize-typescript';
import { User } from "./User";
import { Role } from "./Role";
import { Permission } from "./Permission";

@Table({
    tableName: 'user_has_permission',
    timestamps: true,
})
export class UserPermission extends Model<UserPermission> {
    @PrimaryKey
    @ForeignKey(() => User)
    @Column(DataType.INTEGER)
    declare userId: number;

    @PrimaryKey
    @ForeignKey(() => Permission)
    @Column(DataType.INTEGER)
    declare permissionId: number;
}
