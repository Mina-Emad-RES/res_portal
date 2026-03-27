import { NotFoundException, ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

export function handlePrismaNotFound(
  error: unknown,
  message = 'Resource not found',
): never {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2025'
  ) {
    throw new NotFoundException(message);
  }

  throw error;
}

export function handlePrismaUniqueViolation(
  error: unknown,
  message = 'Resource already exists',
): never {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  ) {
    throw new ConflictException(message);
  }

  throw error;
}
