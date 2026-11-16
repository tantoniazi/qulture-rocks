export interface SessionUser {
  id: number;
  name: string;
  email: string;
}

export interface Session {
  token: string;
  user: SessionUser;
}

export interface SignupInput {
  name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
}
