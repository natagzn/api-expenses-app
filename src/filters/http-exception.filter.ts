import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';

@Catch(HttpException, Prisma.PrismaClientKnownRequestError)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(
    exception: HttpException | Prisma.PrismaClientKnownRequestError,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      exception = this.mapPrismaError(exception);
    }

    const status = exception.getStatus();
    const payload = exception.getResponse();

    const message =
      typeof payload === 'string'
        ? payload
        : ((payload as any)?.message ??
          (payload as any)?.error ??
          exception.message);

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }

  private mapPrismaError(
    e: Prisma.PrismaClientKnownRequestError,
  ): HttpException {
    switch (e.code) {
      case 'P2002':
        const dupFields = Array.isArray(e.meta?.target)
          ? (e.meta.target as string[]).join(', ')
          : (e.meta?.target ?? 'unknown field');

        return new ConflictException(
          `Duplicate record (unique on: ${dupFields})`,
        );

      case 'P2025':
      case 'P2001':
        return new NotFoundException('Record not found');
      case 'P2000':
        return new BadRequestException(
          `Value too long for "${e.meta?.column_name}"`,
        );
      default:
        return new BadRequestException('Database error');
    }
  }
}
