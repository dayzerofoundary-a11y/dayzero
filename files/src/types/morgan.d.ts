declare module 'morgan' {
    import type { Request, Response } from 'express'

    type MorganFormatFn = (req: Request, res: Response) => string

    interface MorganOptions {
        skip?: (req: Request, res: Response) => boolean
        stream?: NodeJS.WritableStream
        format?: MorganFormatFn | string
    }

    function morgan(format?: string | MorganFormatFn | MorganOptions): any

    export default morgan
}

