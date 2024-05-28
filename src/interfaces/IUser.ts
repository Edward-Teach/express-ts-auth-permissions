export interface IUser {
    id?: number
    email: string
    name: string
    password: string
    verifier: string
    mfaSecret?: string
    emailVerifiedAt: string
    passwordExpiresAt: string
}