import {
    Table,
    Model, PrimaryKey, ForeignKey, Column, DataType,
} from 'sequelize-typescript';
import { User } from "./User";
import { Role } from "./Role";

@Table({
    tableName: 'user_has_role',
    timestamps: true,
})
export class UserRole extends Model<UserRole> {
    @PrimaryKey
    @ForeignKey(() => User)
    @Column(DataType.INTEGER)
    declare userId: number;

    @PrimaryKey
    @ForeignKey(() => Role)
    @Column(DataType.INTEGER)
    declare roleId: number;
}
