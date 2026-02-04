import { Test, TestingModule } from "@nestjs/testing";
import { CompanySettingsController } from "./company-settings.controller";
import {
  GetCompanySettingsUseCase,
  UpdateCompanySettingsUseCase,
} from "@application/use-cases";
import { CompanySettingsEntity } from "@domain/entities";
import { NotFoundError } from "@domain/errors";
import { UpdateCompanySettingsRequestDto } from "@infrastructure/dto";

describe("CompanySettingsController", () => {
  let controller: CompanySettingsController;
  let getExecuteMock: jest.Mock;
  let updateExecuteMock: jest.Mock;

  const createMockSettings = (
    overrides: Partial<{
      id: number;
      name: string;
      language: string;
      timezone: string;
      brandingLogoUrl: string | null;
      primaryColor: string | null;
      secondaryColor: string | null;
      contactEmail: string | null;
      contactPhone: string | null;
      createdAt: Date;
      updatedAt: Date;
    }> = {}
  ): CompanySettingsEntity =>
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
      ...overrides,
    });

  beforeEach(async () => {
    getExecuteMock = jest.fn();
    updateExecuteMock = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompanySettingsController],
      providers: [
        {
          provide: GetCompanySettingsUseCase,
          useValue: { execute: getExecuteMock },
        },
        {
          provide: UpdateCompanySettingsUseCase,
          useValue: { execute: updateExecuteMock },
        },
      ],
    }).compile();

    controller = module.get<CompanySettingsController>(
      CompanySettingsController
    );
  });

  describe("getCompanySettings", () => {
    it("should return company settings DTO", async () => {
      // Arrange
      const mockSettings = createMockSettings();
      getExecuteMock.mockResolvedValue(mockSettings);

      // Act
      const result = await controller.getCompanySettings();

      // Assert
      expect(result.id).toBe(1);
      expect(result.name).toBe("Test Company");
      expect(result.language).toBe("fr");
      expect(result.timezone).toBe("Europe/Paris");
      expect(result.brandingLogoUrl).toBe("https://example.com/logo.png");
      expect(result.primaryColor).toBe("#3B82F6");
      expect(result.secondaryColor).toBe("#10B981");
      expect(result.contactEmail).toBe("contact@test.com");
      expect(result.contactPhone).toBe("+33 1 23 45 67 89");
      expect(getExecuteMock).toHaveBeenCalledTimes(1);
    });

    it("should propagate NotFoundError from use case", async () => {
      // Arrange
      getExecuteMock.mockRejectedValue(new NotFoundError("CompanySettings"));

      // Act & Assert
      await expect(controller.getCompanySettings()).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe("updateCompanySettings", () => {
    it("should update and return company settings DTO", async () => {
      // Arrange
      const dto: UpdateCompanySettingsRequestDto = {
        name: "Updated Company",
        primaryColor: "#FF0000",
      };

      const updatedSettings = createMockSettings({
        name: "Updated Company",
        primaryColor: "#FF0000",
      });

      updateExecuteMock.mockResolvedValue(updatedSettings);

      // Act
      const result = await controller.updateCompanySettings(dto);

      // Assert
      expect(result.name).toBe("Updated Company");
      expect(result.primaryColor).toBe("#FF0000");
      expect(updateExecuteMock).toHaveBeenCalledWith({ data: dto });
    });

    it("should handle partial updates", async () => {
      // Arrange
      const dto: UpdateCompanySettingsRequestDto = {
        contactEmail: "new@email.com",
      };

      const updatedSettings = createMockSettings({
        contactEmail: "new@email.com",
      });

      updateExecuteMock.mockResolvedValue(updatedSettings);

      // Act
      const result = await controller.updateCompanySettings(dto);

      // Assert
      expect(result.contactEmail).toBe("new@email.com");
      expect(result.name).toBe("Test Company");
    });

    it("should propagate NotFoundError from use case", async () => {
      // Arrange
      const dto: UpdateCompanySettingsRequestDto = { name: "New Name" };
      updateExecuteMock.mockRejectedValue(new NotFoundError("CompanySettings"));

      // Act & Assert
      await expect(controller.updateCompanySettings(dto)).rejects.toThrow(
        NotFoundError
      );
    });
  });
});
