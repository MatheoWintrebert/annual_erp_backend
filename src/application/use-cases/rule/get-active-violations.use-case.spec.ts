import { Test, TestingModule } from "@nestjs/testing";
import { GetActiveViolationsUseCase } from "./get-active-violations.use-case";
import { RuleRepository } from "@domain/repositories";
import { RuleViolationDetectorService } from "@domain/services";
import { RuleEntity } from "@domain/entities";
import { RuleType } from "@domain/types";
import type { RuleViolation } from "@domain/types";

describe("GetActiveViolationsUseCase", () => {
  let useCase: GetActiveViolationsUseCase;
  let findAllMock: jest.Mock;
  let detectViolationsMock: jest.Mock;

  const mockDate = new Date("2024-01-15T10:30:00.000Z");

  const createMockRule = (id: number, type: RuleType): RuleEntity =>
    new RuleEntity({
      id,
      name: `Rule ${String(id)}`,
      description: null,
      type,
      isActive: true,
      createdAt: mockDate,
      updatedAt: mockDate,
      deletedAt: null,
    });

  const createMockViolation = (
    paletteId: number,
    ruleName: string
  ): RuleViolation => ({
    paletteId,
    palettierName: "Rack A1",
    positionX: 0,
    positionY: 0,
    positionZ: 0,
    productName: "Product A",
    ruleName,
    ruleType: "storage_condition",
    violationReason: "Test violation",
  });

  beforeEach(async () => {
    findAllMock = jest.fn();
    detectViolationsMock = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetActiveViolationsUseCase,
        {
          provide: RuleRepository,
          useValue: {
            findAll: findAllMock,
          },
        },
        {
          provide: RuleViolationDetectorService,
          useValue: {
            detectViolations: detectViolationsMock,
          },
        },
      ],
    }).compile();

    useCase = module.get<GetActiveViolationsUseCase>(
      GetActiveViolationsUseCase
    );
  });

  it("should return empty array when no active rules exist", async () => {
    findAllMock.mockResolvedValue({ rules: [], meta: { total: 0 } });

    const result = await useCase.execute();

    expect(result).toEqual([]);
    expect(findAllMock).toHaveBeenCalledWith(
      expect.objectContaining({ isActive: true })
    );
    expect(detectViolationsMock).not.toHaveBeenCalled();
  });

  it("should detect violations for each active rule", async () => {
    const rule1 = createMockRule(1, RuleType.STORAGE_CONDITION);
    const rule2 = createMockRule(2, RuleType.PLACEMENT_CONSTRAINT);

    findAllMock.mockResolvedValue({
      rules: [{ rule: rule1 }, { rule: rule2 }],
      meta: { total: 2 },
    });

    const violation1 = createMockViolation(1, "Rule 1");
    const violation2 = createMockViolation(2, "Rule 2");

    detectViolationsMock
      .mockResolvedValueOnce([violation1])
      .mockResolvedValueOnce([violation2]);

    const result = await useCase.execute();

    expect(result).toHaveLength(2);
    expect(result).toContainEqual(violation1);
    expect(result).toContainEqual(violation2);
    expect(detectViolationsMock).toHaveBeenCalledWith(1);
    expect(detectViolationsMock).toHaveBeenCalledWith(2);
  });

  it("should flatten violations from multiple rules", async () => {
    const rule1 = createMockRule(1, RuleType.ZONE_PRIORITY);

    findAllMock.mockResolvedValue({
      rules: [{ rule: rule1 }],
      meta: { total: 1 },
    });

    const violations = [
      createMockViolation(1, "Rule 1"),
      createMockViolation(2, "Rule 1"),
      createMockViolation(3, "Rule 1"),
    ];

    detectViolationsMock.mockResolvedValueOnce(violations);

    const result = await useCase.execute();

    expect(result).toHaveLength(3);
  });

  it("should continue collecting violations when one rule detection fails", async () => {
    const rule1 = createMockRule(1, RuleType.STORAGE_CONDITION);
    const rule2 = createMockRule(2, RuleType.PLACEMENT_CONSTRAINT);
    const rule3 = createMockRule(3, RuleType.ZONE_PRIORITY);

    findAllMock.mockResolvedValue({
      rules: [{ rule: rule1 }, { rule: rule2 }, { rule: rule3 }],
      meta: { total: 3 },
    });

    const violation1 = createMockViolation(1, "Rule 1");
    const violation3 = createMockViolation(3, "Rule 3");

    detectViolationsMock
      .mockResolvedValueOnce([violation1])
      .mockRejectedValueOnce(new Error("DB connection lost"))
      .mockResolvedValueOnce([violation3]);

    const result = await useCase.execute();

    expect(result).toHaveLength(2);
    expect(result).toContainEqual(violation1);
    expect(result).toContainEqual(violation3);
  });

  it("should return empty array when rules have no violations", async () => {
    const rule1 = createMockRule(1, RuleType.STORAGE_CONDITION);

    findAllMock.mockResolvedValue({
      rules: [{ rule: rule1 }],
      meta: { total: 1 },
    });

    detectViolationsMock.mockResolvedValueOnce([]);

    const result = await useCase.execute();

    expect(result).toEqual([]);
  });
});
