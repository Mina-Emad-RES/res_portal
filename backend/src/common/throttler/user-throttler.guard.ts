import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { ExecutionContext } from '@nestjs/common';
import type { AuthRequest } from '../../auth/auth-request.interface';

@Injectable()
export class UserThrottlerGuard extends ThrottlerGuard {
  // Skip throttling entirely when there's no authenticated user. nginx owns
  // all IP-based limiting (login and every other unauthenticated route), so
  // the app never reads or keys on an IP address at all.
  protected shouldSkip(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthRequest>();
    return Promise.resolve(!request.user?.id);
  }

  // For authenticated requests, key strictly by user id — no IP fallback.
  protected getTracker(req: Record<string, any>): Promise<string> {
    const request = req as AuthRequest;
    return Promise.resolve(`user:${request.user.id}`);
  }
}
