import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();

    const { method, originalUrl } = req;
    const ip = req.ip;
    const userAgent = req.get('user-agent') || 'Unknown';

    // Log incoming request
    console.log(`[REQUEST] ${method} ${originalUrl} | IP: ${ip}`);

    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const statusCode = res.statusCode;

      console.log(
        `[RESPONSE] ${method} ${originalUrl} | ` +
          `Status: ${statusCode} | ` +
          `Duration: ${duration}ms | ` +
          `IP: ${ip} | ` +
          `User-Agent: ${userAgent}`,
      );
    });

    next();
  }
}
