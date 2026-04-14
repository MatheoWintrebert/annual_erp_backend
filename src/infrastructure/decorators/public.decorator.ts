import { SetMetadata } from "@nestjs/common";
import { IProtectionContext } from "@domain/types";

export const Public = (): MethodDecorator & ClassDecorator =>
  SetMetadata("protectionContext", { isPublic: true } satisfies IProtectionContext);
