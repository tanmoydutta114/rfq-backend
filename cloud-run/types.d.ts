declare namespace Express {
    export interface Request {
      user?: {
        uid?: string;
        // rid?: string,
        email?: string;
        name?: string;
        active?: boolean;
      };
      verifyRes?: {
        isAllowed: boolean;
      };
      verifyShareLinkRes?: {
        isAllowed: boolean;
        errorMsg?: string;

        userAuth?: { uid: string; email: string };
      };
      rawBody?: any;
      claims: any;
      globalLogFields?: any;
    }
  }
  