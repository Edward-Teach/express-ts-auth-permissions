import {
    Table,
    Model, PrimaryKey, ForeignKey, Column, DataType,
} from 'sequelize-typescript';
import { Role } from "./Role";
import { Permission } from "./Permission";

@Table({
    tableName: 'role_has_permission',
    timestamps: true,
})
export class RolePermission extends Model<RolePermission> {
    @PrimaryKey
    @ForeignKey(() => Role)
    @Column(DataType.INTEGER)
    declare roleId: number;

    @PrimaryKey
    @ForeignKey(() => Permission)
    @Column(DataType.INTEGER)
    declare permissionId: number;
}
