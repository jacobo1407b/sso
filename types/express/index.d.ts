
declare namespace Express {
  interface Request {
    user?: {
      userId: string,
      username: string,
      iat: number,
      exp: number
    };
  }
}

