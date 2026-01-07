import { Request, Response, NextFunction } from 'express';
import { OAuthError } from "oauth2-server";
import { Prisma } from "@prisma/client";
import { JsonWebTokenError, TokenExpiredError, NotBeforeError } from "jsonwebtoken";

const prismaCodes = [{ code: "P2002", status: 409, del: 'USER' }, { code: "P2025", status: 404, del: 'USER' }, { code: "P2023", status: 404, del: 'USER' }]

export const errorHandler = (err: any, req: Request, res: Response, _next: NextFunction) => {
    /*console.log(err.code)
    console.log(err.message)
    console.log(err.name)*/
    let responseCode = {
        status: 500,
        message: "Internal Server Error",
        code: "",
        details: "SYS"
    }


    const currentCode = prismaCodes.find((x) => x.code === err?.code)
    if (err instanceof OAuthError) {
        const error = err as any;
        responseCode = {
            status: error.code,
            message: error.message,
            code: error.name,
            details: error.details
        }
    } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
        responseCode = {
            status: currentCode?.status ?? 400,
            message: `${err.meta?.modelName}:${err.meta?.message}`,
            code: err.code,
            details: currentCode?.del ?? "SYS"
        }
    } else if (err instanceof Prisma.PrismaClientValidationError) {
        responseCode = {
            status: 400,
            message: err.message,
            code: 'PRISMA_INITIALIZE',
            details: 'USER'
        }
    } else if (err instanceof Prisma.PrismaClientInitializationError) {
        responseCode = {
            status: 500,
            message: err.message,
            code: err.name,
            details: 'SYS'
        }
    } else if (err instanceof Prisma.PrismaClientRustPanicError) {
        responseCode = {
            status: 500,
            message: err.message,
            code: 'PRISMA_INTERNAL_ERROR',
            details: 'SYS'
        }
    } else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
        console.log(err)
        responseCode = {
            status: 500,
            message: err.message,
            code: 'PRISMA_UNKNOWN',
            details: 'SYS'
        }
    } else if (err instanceof TokenExpiredError) {
        responseCode = {
            status: 400,
            message: err.message,
            code: 'TOKEN_EXP',
            details: 'SYS'
        }
    } else if (err instanceof NotBeforeError) {
        responseCode = {
            status: 400,
            message: err.message,
            code: 'TOKEN_INVALID',
            details: 'SYS'
        }
    } else if (err instanceof JsonWebTokenError) {
        responseCode = {
            status: 400,
            message: err.message,
            code: 'TOKEN_INVALID',
            details: 'SYS'
        }
    } else {
        if (err.message === 'fetch failed') {
            responseCode = {
                status: 503,
                message: "Recurso no disponible",
                code: "INTERNAL_SERVER_ERROR",
                details: "SYS"
            }
        } else {
            responseCode = {
                status: 500,
                message: err.message,
                code: "INTERNAL_SERVER_ERROR",
                details: "SYS"
            }
        }

    }

    res.status(responseCode.status).json(responseCode)

}