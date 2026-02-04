import { Test, TestingModule } from "@nestjs/testing";
import { UpdateCompanySettingsUseCase } from "./update-company-settings.use-case";
import { CompanySettingsRepository } from "@domain/repositories";
import { CompanySettingsEntity } from "@domain/entities";

describe("UpdateCompanySettingsUseCase", () => {
  let useCase: UpdateCompanySettingsUseCase;
  let findFirstMock: jest.Mock;
  let createMock: jest.Mock;
  let updateMock: jest.Mock;

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
    findFirstMock = jest.fn();
    createMock = jest.fn();
    updateMock = jest.fn();

    const mockRepository = {
      findFirst: findFirstMock,
      create: createMock,
      update: updateMock,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateCompanySettingsUseCase,
        {
          provide: CompanySettingsRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<UpdateCompanySettingsUseCase>(
      UpdateCompanySettingsUseCase
    );
  });

  describe("execute", () => {
    it("should update and return company settings", async () => {
      // Arrange
      const updateData = {
        name: "Updated Company",
        primaryColor: "#FF0000",
      };
      const existingSettings = createMockSettings();
      const updatedSettings = createMockSettings({
        name: "Updated Company",
        primaryColor: "#FF0000",
        updatedAt: new Date(),
      });

      findFirstMock.mockResolvedValue(existingSettings);
      updateMock.mockResolvedValue(updatedSettings);

      // Act
      const result = await useCase.execute({ data: updateData });

      // Assert
      expect(result.name).toBe("Updated Company");
      expect(result.primaryColor).toBe("#FF0000");
      expect(findFirstMock).toHaveBeenCalledTimes(1);
      expect(updateMock).toHaveBeenCalledWith(1, updateData);
    });

    it("should create settings when they do not exist", async () => {
      // Arrange
      const inputData = { name: "New Company", language: "en" };
      const createdSettings = createMockSettings({
        name: "New Company",
        language: "en",
      });

      findFirstMock.mockResolvedValue(null);
      createMock.mockResolvedValue(createdSettings);

      // Act
      const result = await useCase.execute({ data: inputData });

      // Assert
      expect(result.name).toBe("New Company");
      expect(result.language).toBe("en");
      expect(createMock).toHaveBeenCalledWith({
        name: "New Company",
        language: "en",
        timezone: undefined,
        brandingLogoUrl: undefined,
        primaryColor: undefined,
        secondaryColor: undefined,
        contactEmail: undefined,
        contactPhone: undefined,
      });
      expect(updateMock).not.toHaveBeenCalled();
    });

    it("should use default company name when creating without name", async () => {
      // Arrange
      const inputData = { language: "en" };
      const createdSettings = createMockSettings({
        name: "My Company",
        language: "en",
      });

      findFirstMock.mockResolvedValue(null);
      createMock.mockResolvedValue(createdSettings);

      // Act
      const result = await useCase.execute({ data: inputData });

      // Assert
      expect(result.name).toBe("My Company");
      expect(createMock).toHaveBeenCalledWith(
        expect.objectContaining({ name: "My Company" })
      );
    });

    it("should update only provided fields", async () => {
      // Arrange
      const updateData = { contactEmail: "new@email.com" };
      const existingSettings = createMockSettings();
      const updatedSettings = createMockSettings({
        contactEmail: "new@email.com",
      });

      findFirstMock.mockResolvedValue(existingSettings);
      updateMock.mockResolvedValue(updatedSettings);

      // Act
      const result = await useCase.execute({ data: updateData });

      // Assert
      expect(result.contactEmail).toBe("new@email.com");
      expect(result.name).toBe("Test Company");
      expect(updateMock).toHaveBeenCalledWith(1, {
        contactEmail: "new@email.com",
      });
    });

    it("should allow setting nullable fields to null", async () => {
      // Arrange
      const updateData = {
        brandingLogoUrl: null,
        primaryColor: null,
      };
      const existingSettings = createMockSettings();
      const updatedSettings = createMockSettings({
        brandingLogoUrl: null,
        primaryColor: null,
      });

      findFirstMock.mockResolvedValue(existingSettings);
      updateMock.mockResolvedValue(updatedSettings);

      // Act
      const result = await useCase.execute({ data: updateData });

      // Assert
      expect(result.brandingLogoUrl).toBeNull();
      expect(result.primaryColor).toBeNull();
    });
  });
});
