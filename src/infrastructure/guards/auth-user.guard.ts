import { GetUserUseCase } from "@application/use-cases";
import { IAuthRequest, IProtectionContext, IUserInfo } from "@domain/types";
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthUserGuard implements CanActivate {
  constructor(
    private readonly tokenService: JwtService,
    private readonly reflector: Reflector,
    @Inject(GetUserUseCase)
    private readonly getUserUseCase: GetUserUseCase
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const protectionContext = this.reflector.get<
      IProtectionContext | undefined
    >("protectionContext", context.getHandler());
    const allowPublicRequests = protectionContext?.isPublic;

    if (allowPublicRequests) {
      return true;
    }

    const request: IAuthRequest = context.switchToHttp().getRequest();
    const authorization = request.headers.authorization ?? "";
    const jwtToken = authorization.split(" ")[1];

    if (!jwtToken) {
      throw new UnauthorizedException("No bearer token");
    }

    const jwtDecode = this.tokenService.verify(jwtToken, {
      secret: process.env.JWT_SECRET ?? "application",
    }) as { id: number; email: string } | null;
    if (!jwtDecode) {
      throw new UnauthorizedException("Invalid token");
    }

    const user: IUserInfo | null = await this.getUserUseCase.execute({
      userId: jwtDecode.id,
    });

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    request.userInfo = user;

    return true;
  }
}
