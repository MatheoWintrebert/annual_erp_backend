import { Test, TestingModule } from "@nestjs/testing";
import { GetCompanySettingsUseCase } from "./get-company-settings.use-case";
import { CompanySettingsRepository } from "@domain/repositories";
import { CompanySettingsEntity } from "@domain/entities";
import { NotFoundError } from "@domain/errors";

describe("GetCompanySettingsUseCase", () => {
  let useCase: GetCompanySettingsUseCase;
  let findFirstMock: jest.Mock;

  const createMockSettings = (): CompanySettingsEntity =>
    new CompanySettingsEntity({
      id: 1,
      name: "Test Company",
      language: "fr",
      timezone: "Europe/Paris",
      brandingLogoUrl: "https://example.com/logo.png",
      primaryColor: "#3B82F6",
      secondaryColor: "#10B981",
      contactEmail: "contact@test.com",
      contactPhone: "+33 1 23 45 67 89",
      createdAt: new Date("2024-01-15T10:30:00.000Z"),
      updatedAt: new Date("2024-01-20T14:45:00.000Z"),
    });

  beforeEach(async () => {
    findFirstMock = jest.fn();

    const mockRepository = {
      findFirst: findFirstMock,
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetCompanySettingsUseCase,
        {
          provide: CompanySettingsRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetCompanySettingsUseCase>(GetCompanySettingsUseCase);
  });

  describe("execute", () => {
    it("should return company settings when they exist", async () => {
      // Arrange
      const mockSettings = createMockSettings();
      findFirstMock.mockResolvedValue(mockSettings);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toEqual(mockSettings);
      expect(findFirstMock).toHaveBeenCalledTimes(1);
    });

    it("should throw NotFoundError when settings do not exist", async () => {
      // Arrange
      findFirstMock.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute()).rejects.toThrow(NotFoundError);
      await expect(useCase.execute()).rejects.toThrow(
        "CompanySettings not found"
      );
    });
  });
});
