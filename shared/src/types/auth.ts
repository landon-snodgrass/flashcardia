export interface User {
    uid: string;
    email: string;
    displayName?: string;
    photoUrl?: string;
    emailVerified: boolean;
    createdAt: Date;
    lastLoginAt: Date;
}

export interface AuthState {
    user: User | null;
    isLoading: boolean;
    isInitialized: boolean;
    error: string | null;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterCredentials {
    email: string;
    password: string;
    displayName?: string;
}

export interface AuthError {
    code: string;
    message: string;
}