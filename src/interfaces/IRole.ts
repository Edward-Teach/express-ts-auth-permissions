import { IPermission } from "./IPermission";

export interface IRole{
    id?: number
    name: string
    permissions?: IPermission[]
}