import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";

@Injectable()
export class AuthGuard implements CanActivate {
  // Placeholder: allows all requests. Replace with real auth implementation.
  canActivate(_context: ExecutionContext): boolean {
    return true;
  }
}
