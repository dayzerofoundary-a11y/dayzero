import type { ErrorRequestHandler } from 'express'

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    const status = typeof (err as any)?.statusCode === 'number' ? (err as any).statusCode : 500
    const message = status === 500 ? 'Internal server error' : (err as any)?.message ?? 'Error'

    res.status(status).json({
        success: false,
        message,
        data: null,
        errors: [
            {
                message: status === 500 ? 'Something went wrong' : message,
            },
        ],
    })
}

