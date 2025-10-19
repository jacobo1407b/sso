type rols = Array<{
  role_code: string;
  policy_permission: Array<string>
}>

declare namespace Express {
  interface Request {
    user?: {
      userId: string,
      username: string,
      iat: number,
      exp: number,
      client_id: string,
      rols: rols,
      log_in_status: string | null
    };
  }
}

