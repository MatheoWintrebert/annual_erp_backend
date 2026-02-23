import { ExecutionContext } from "@nestjs/common";
import { AuthGuard } from "./auth.guard";

describe("AuthGuard", () => {
  let guard: AuthGuard;

  beforeEach(() => {
    guard = new AuthGuard();
  });

  it("should be defined", () => {
    expect(guard).toBeDefined();
  });

  it("should return true for any request (placeholder behavior)", () => {
    const mockContext = {} as ExecutionContext;
    expect(guard.canActivate(mockContext)).toBe(true);
  });
});
