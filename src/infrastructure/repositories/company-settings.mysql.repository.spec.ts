import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { CompanySettingsMysqlRepository } from "./company-settings.mysql.repository";
import { CompanySettingsTypeormEntity } from "@infrastructure/entities";

describe("CompanySettingsMysqlRepository", () => {
  let repository: CompanySettingsMysqlRepository;
  let findOneMock: jest.Mock;
  let findOneOrFailMock: jest.Mock;
  let createMock: jest.Mock;
  let saveMock: jest.Mock;
  let updateMock: jest.Mock;

  const createMockTypeormEntity = (
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
  ): CompanySettingsTypeormEntity =>
    ({
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
    }) as CompanySettingsTypeormEntity;

  beforeEach(async () => {
    findOneMock = jest.fn();
    findOneOrFailMock = jest.fn();
    createMock = jest.fn();
    saveMock = jest.fn();
    updateMock = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanySettingsMysqlRepository,
        {
          provide: getRepositoryToken(CompanySettingsTypeormEntity),
          useValue: {
            findOne: findOneMock,
            findOneOrFail: findOneOrFailMock,
            create: createMock,
            save: saveMock,
            update: updateMock,
          },
        },
      ],
    }).compile();

    repository = module.get<CompanySettingsMysqlRepository>(
      CompanySettingsMysqlRepository
    );
  });

  describe("findFirst", () => {
    it("should return company settings entity when found", async () => {
      // Arrange
      const mockEntity = createMockTypeormEntity();
      findOneMock.mockResolvedValue(mockEntity);

      // Act
      const result = await repository.findFirst();

      // Assert
      expect(result).not.toBeNull();
      expect(result?.id).toBe(1);
      expect(result?.name).toBe("Test Company");
      expect(result?.language).toBe("fr");
      expect(findOneMock).toHaveBeenCalledWith({
        where: {},
        order: { id: "ASC" },
      });
    });

    it("should return null when not found", async () => {
      // Arrange
      findOneMock.mockResolvedValue(null);

      // Act
      const result = await repository.findFirst();

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("create", () => {
    it("should create and return new company settings", async () => {
      // Arrange
      const createData = {
        name: "New Company",
        language: "en",
        timezone: "America/New_York",
      };

      const createdEntity = createMockTypeormEntity({
        name: "New Company",
        language: "en",
        timezone: "America/New_York",
      });

      createMock.mockReturnValue(createdEntity);
      saveMock.mockResolvedValue(createdEntity);

      // Act
      const result = await repository.create(createData);

      // Assert
      expect(result.name).toBe("New Company");
      expect(result.language).toBe("en");
      expect(result.timezone).toBe("America/New_York");
      expect(createMock).toHaveBeenCalledWith(createData);
      expect(saveMock).toHaveBeenCalledWith(createdEntity);
    });

    it("should create with only required name field", async () => {
      // Arrange
      const createData = { name: "Minimal Company" };
      const createdEntity = createMockTypeormEntity({
        name: "Minimal Company",
      });

      createMock.mockReturnValue(createdEntity);
      saveMock.mockResolvedValue(createdEntity);

      // Act
      const result = await repository.create(createData);

      // Assert
      expect(result.name).toBe("Minimal Company");
      expect(createMock).toHaveBeenCalledWith(createData);
    });
  });

  describe("update", () => {
    it("should update and return the updated entity", async () => {
      // Arrange
      const updateData = {
        name: "Updated Company",
        primaryColor: "#FF0000",
      };

      const updatedEntity = createMockTypeormEntity({
        name: "Updated Company",
        primaryColor: "#FF0000",
      });

      updateMock.mockResolvedValue({
        affected: 1,
        raw: {},
        generatedMaps: [],
      });
      findOneOrFailMock.mockResolvedValue(updatedEntity);

      // Act
      const result = await repository.update(1, updateData);

      // Assert
      expect(result.name).toBe("Updated Company");
      expect(result.primaryColor).toBe("#FF0000");
      expect(updateMock).toHaveBeenCalledWith(1, updateData);
      expect(findOneOrFailMock).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it("should handle nullable fields update", async () => {
      // Arrange
      const updateData = {
        brandingLogoUrl: null,
        contactEmail: null,
      };

      const updatedEntity = createMockTypeormEntity({
        brandingLogoUrl: null,
        contactEmail: null,
      });

      updateMock.mockResolvedValue({
        affected: 1,
        raw: {},
        generatedMaps: [],
      });
      findOneOrFailMock.mockResolvedValue(updatedEntity);

      // Act
      const result = await repository.update(1, updateData);

      // Assert
      expect(result.brandingLogoUrl).toBeNull();
      expect(result.contactEmail).toBeNull();
    });
  });
});
