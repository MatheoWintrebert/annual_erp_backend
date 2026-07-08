import { SetMetadata } from "@nestjs/common";
import { IProtectionContext } from "@domain/types";

export const TwoFactor = (): MethodDecorator & ClassDecorator =>
  SetMetadata("protectionContext", {
    is2Fa: true,
  } satisfies IProtectionContext);
