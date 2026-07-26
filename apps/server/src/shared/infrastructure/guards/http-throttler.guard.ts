import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

/**
 * Rate-limiting guard scoped to HTTP traffic only.
 *
 * The stock {@link ThrottlerGuard} assumes an HTTP context and reads
 * `req.headers`, which throws when the guard runs for WebSocket (or RPC)
 * handlers. Since this app exposes a Socket.IO gateway, we short-circuit
 * every non-HTTP context so realtime traffic is never throttled or crashed.
 */
@Injectable()
export class HttpThrottlerGuard extends ThrottlerGuard {
  protected shouldSkip(context: ExecutionContext): Promise<boolean> {
    return Promise.resolve(context.getType() !== 'http');
  }
}
