import { IRole } from "./IRole";
import { IPermission } from "./IPermission";

export interface IUser {
    id?: number
    email: string
    name: string
    password: string
    verifier: string
    mfaSecret?: string|null
    emailVerifiedAt: string|null
    passwordExpiresAt: string
    roles?: string[]|IRole[]
    permissions?: string[]|IPermission[]
}