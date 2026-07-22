import "module-alias/register";
import dataSource from "../../../ormconfig";
import { UnitOfMeasureTypeormEntity } from "@infrastructure/entities/unit-of-measure.typeorm.entity";
import { CategoryTypeormEntity } from "@infrastructure/entities/category.typeorm.entity";
import { ProductTypeormEntity } from "@infrastructure/entities/product.typeorm.entity";
import { PalettierTypeTypeormEntity } from "@infrastructure/entities/palettier-type.typeorm.entity";
import { PalettierTypeormEntity } from "@infrastructure/entities/palettier.typeorm.entity";
import { RuleTypeormEntity } from "@infrastructure/entities/rule.typeorm.entity";
import { RuleStorageConditionConfigTypeormEntity } from "@infrastructure/entities/rule-storage-condition-config.typeorm.entity";
import { ProductRuleTypeormEntity } from "@infrastructure/entities/product-rule.typeorm.entity";
import { LotTypeormEntity } from "@infrastructure/entities/lot.typeorm.entity";
import { PaletteTypeormEntity } from "@infrastructure/entities/palette.typeorm.entity";
import { PaletteLotTypeormEntity } from "@infrastructure/entities/palette-lot.typeorm.entity";
import { CompanySettingsTypeormEntity } from "@infrastructure/entities/company-settings.typeorm.entity";
import { RuleType, SelectionMode } from "@domain/types";

const COMPANY_SETTINGS = {
  name: "Hearth & Grain Bakery",
  brandingLogoUrl:
    "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fcdn1.vectorstock.com%2Fi%2F1000x1000%2F19%2F65%2Fbakery-icon-vector-3611965.jpg&f=1&nofb=1&ipt=0a7522e25653fb2e8cc6f23778c3b13274dd9f9aa48f8452a6425fc0cbf7d681",
};

const UNITS_OF_MEASURE = [
  { name: "Unit", abbreviation: "pcs" },
  { name: "Kilogram", abbreviation: "kg" },
  { name: "Liter", abbreviation: "L" },
];

const CATEGORIES = ["Bakery"];

const PALETTIER_TYPES = [
  {
    name: "Refrigerated",
    description:
      "Temperature-controlled palettiers used to store perishable goods that spoil at ambient temperature.",
  },
];

const PALETTIERS = [
  {
    name: "PAL-FRIDGE",
    palettierType: "Refrigerated",
    width: 2,
    depth: 1,
    height: 2,
  },
  {
    name: "PAL-GEN-01",
    palettierType: null as string | null,
    width: 3,
    depth: 2,
    height: 3,
  },
];

const STORAGE_CONDITION_RULES = [
  {
    name: "Cold Storage",
    description:
      "Perishable products must be placed in refrigerated palettiers to stay below spoilage temperature.",
    isActive: true,
    conditionType: "refrigerated",
    selectionMode: SelectionMode.PALETTIER_TYPE,
    palettierType: "Refrigerated",
  },
];

const PRODUCTS = [
  {
    reference: "DEMO-BAKE-001",
    name: "Milk",
    unitOfMeasure: "Liter",
    category: "Bakery",
    minimumStock: 20,
    expiryAlertThreshold: 5,
    rule: "Cold Storage",
  },
  {
    reference: "DEMO-BAKE-002",
    name: "Eggs",
    unitOfMeasure: "Unit",
    category: "Bakery",
    minimumStock: 60,
    expiryAlertThreshold: 21,
    rule: "Cold Storage",
  },
  {
    reference: "DEMO-BAKE-003",
    name: "Yeast",
    unitOfMeasure: "Kilogram",
    category: "Bakery",
    minimumStock: 2,
    expiryAlertThreshold: 14,
    rule: "Cold Storage",
  },
  {
    reference: "DEMO-BAKE-004",
    name: "Butter",
    unitOfMeasure: "Kilogram",
    category: "Bakery",
    minimumStock: 10,
    expiryAlertThreshold: 30,
    rule: "Cold Storage",
  },
  {
    reference: "DEMO-BAKE-005",
    name: "Sugar",
    unitOfMeasure: "Kilogram",
    category: "Bakery",
    minimumStock: 25,
    expiryAlertThreshold: null,
    rule: null,
  },
  {
    reference: "DEMO-BAKE-006",
    name: "Salt",
    unitOfMeasure: "Kilogram",
    category: "Bakery",
    minimumStock: 5,
    expiryAlertThreshold: null,
    rule: null,
  },
];

// arrivalDaysAgo / expirationInDays are relative to seed run time so alerts
// (low stock, expiry) stay meaningful whenever this seed is (re)run.
const LOTS = [
  {
    reference: "LOT-MILK-01",
    product: "Milk",
    supplierName: "Local Dairy Farm",
    quantity: 18,
    arrivalDaysAgo: 2,
    expirationInDays: 2 as number | null, // within threshold (5) -> expiry warning demo
  },
  {
    reference: "LOT-MILK-02",
    product: "Milk",
    supplierName: "Local Dairy Farm",
    quantity: 4, // placed in PAL-GEN-01 below -> rule violation demo
    arrivalDaysAgo: 1,
    expirationInDays: 25,
  },
  {
    reference: "LOT-EGGS-01",
    product: "Eggs",
    supplierName: "Green Valley Farm",
    quantity: 84,
    arrivalDaysAgo: 3,
    expirationInDays: 40,
  },
  {
    reference: "LOT-YEAST-01",
    product: "Yeast",
    supplierName: "BakeCraft Supplies",
    quantity: 5,
    arrivalDaysAgo: 5,
    expirationInDays: 60,
  },
  {
    reference: "LOT-BUTTER-01",
    product: "Butter",
    supplierName: "Local Dairy Farm",
    quantity: 3, // below minimumStock (10) -> low stock warning demo
    arrivalDaysAgo: 5,
    expirationInDays: 25,
  },
  {
    reference: "LOT-SUGAR-01",
    product: "Sugar",
    supplierName: "Global Grains Inc.",
    quantity: 30,
    arrivalDaysAgo: 10,
    expirationInDays: null,
  },
  {
    reference: "LOT-SALT-01",
    product: "Salt",
    supplierName: "Global Grains Inc.",
    quantity: 8,
    arrivalDaysAgo: 10,
    expirationInDays: null,
  },
];

const PALETTES = [
  // single-product palette
  { palettier: "PAL-FRIDGE", x: 0, y: 0, z: 0, lots: ["LOT-MILK-01"] },
  // multi-product palette
  {
    palettier: "PAL-FRIDGE",
    x: 1,
    y: 0,
    z: 0,
    lots: ["LOT-EGGS-01", "LOT-YEAST-01"],
  },
  // single-product palette, low stock warning demo
  { palettier: "PAL-FRIDGE", x: 0, y: 0, z: 1, lots: ["LOT-BUTTER-01"] },
  // multi-product palette, ambient dry goods
  {
    palettier: "PAL-GEN-01",
    x: 0,
    y: 0,
    z: 0,
    lots: ["LOT-SUGAR-01", "LOT-SALT-01"],
  },
  // Milk (a Cold Storage product) in a non-refrigerated palettier -> rule violation demo
  { palettier: "PAL-GEN-01", x: 1, y: 1, z: 0, lots: ["LOT-MILK-02"] },
];

function daysFromNow(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

async function seedDemonstration(): Promise<void> {
  await dataSource.initialize();

  const unitOfMeasureRepository = dataSource.getRepository(
    UnitOfMeasureTypeormEntity
  );
  const categoryRepository = dataSource.getRepository(CategoryTypeormEntity);
  const productRepository = dataSource.getRepository(ProductTypeormEntity);
  const palettierTypeRepository = dataSource.getRepository(
    PalettierTypeTypeormEntity
  );
  const palettierRepository = dataSource.getRepository(PalettierTypeormEntity);
  const ruleRepository = dataSource.getRepository(RuleTypeormEntity);
  const ruleStorageConditionConfigRepository = dataSource.getRepository(
    RuleStorageConditionConfigTypeormEntity
  );
  const productRuleRepository = dataSource.getRepository(
    ProductRuleTypeormEntity
  );
  const lotRepository = dataSource.getRepository(LotTypeormEntity);
  const paletteRepository = dataSource.getRepository(PaletteTypeormEntity);
  const paletteLotRepository = dataSource.getRepository(
    PaletteLotTypeormEntity
  );
  const companySettingsRepository = dataSource.getRepository(
    CompanySettingsTypeormEntity
  );

  const existingSettings = await companySettingsRepository.findOne({
    where: {},
    order: { id: "ASC" },
  });

  if (!existingSettings) {
    await companySettingsRepository.save(
      companySettingsRepository.create(COMPANY_SETTINGS)
    );
    console.log(`Company settings created: ${COMPANY_SETTINGS.name}`);
  } else {
    const updates: Partial<CompanySettingsTypeormEntity> = {};
    if (!existingSettings.name) {
      updates.name = COMPANY_SETTINGS.name;
    }
    if (!existingSettings.brandingLogoUrl) {
      updates.brandingLogoUrl = COMPANY_SETTINGS.brandingLogoUrl;
    }

    if (Object.keys(updates).length > 0) {
      await companySettingsRepository.update(existingSettings.id, updates);
      console.log("Company settings updated with bakery name/logo.");
    } else {
      console.log("Company settings already configured, skipping.");
    }
  }

  const unitOfMeasureIdsByName = new Map<string, number>();
  for (const unit of UNITS_OF_MEASURE) {
    const existing = await unitOfMeasureRepository.findOne({
      where: { name: unit.name },
    });
    const saved =
      existing ??
      (await unitOfMeasureRepository.save(
        unitOfMeasureRepository.create(unit)
      ));
    unitOfMeasureIdsByName.set(unit.name, saved.id);
  }

  const categoryIdsByName = new Map<string, number>();
  for (const name of CATEGORIES) {
    const existing = await categoryRepository.findOne({ where: { name } });
    const saved =
      existing ??
      (await categoryRepository.save(categoryRepository.create({ name })));
    categoryIdsByName.set(name, saved.id);
  }

  const palettierTypeIdsByName = new Map<string, number>();
  for (const palettierType of PALETTIER_TYPES) {
    const existing = await palettierTypeRepository.findOne({
      where: { name: palettierType.name },
    });
    const saved =
      existing ??
      (await palettierTypeRepository.save(
        palettierTypeRepository.create(palettierType)
      ));
    palettierTypeIdsByName.set(palettierType.name, saved.id);
  }

  const palettierIdsByName = new Map<string, number>();
  for (const palettier of PALETTIERS) {
    const existing = await palettierRepository.findOne({
      where: { name: palettier.name },
    });
    if (existing) {
      console.log(`Palettier ${palettier.name} already exists, skipping.`);
      palettierIdsByName.set(palettier.name, existing.id);
      continue;
    }

    const savedPalettier = await palettierRepository.save(
      palettierRepository.create({
        name: palettier.name,
        palettierTypeId: palettier.palettierType
          ? (palettierTypeIdsByName.get(palettier.palettierType) ?? null)
          : null,
        width: palettier.width,
        depth: palettier.depth,
        height: palettier.height,
      })
    );
    palettierIdsByName.set(palettier.name, savedPalettier.id);
    console.log(`Palettier ${palettier.name} created.`);
  }

  const ruleIdsByName = new Map<string, number>();
  for (const rule of STORAGE_CONDITION_RULES) {
    const existing = await ruleRepository.findOne({
      where: { name: rule.name },
    });

    if (existing) {
      console.log(`Rule ${rule.name} already exists, skipping.`);
      ruleIdsByName.set(rule.name, existing.id);
      continue;
    }

    const savedRule = await ruleRepository.save(
      ruleRepository.create({
        name: rule.name,
        description: rule.description,
        type: RuleType.STORAGE_CONDITION,
        isActive: rule.isActive,
      })
    );

    await ruleStorageConditionConfigRepository.save(
      ruleStorageConditionConfigRepository.create({
        ruleId: savedRule.id,
        conditionType: rule.conditionType,
        selectionMode: rule.selectionMode,
        palettierTypeId: palettierTypeIdsByName.get(rule.palettierType),
      })
    );

    ruleIdsByName.set(rule.name, savedRule.id);
    console.log(`Rule ${rule.name} created.`);
  }

  const productIdsByName = new Map<string, number>();
  let createdCount = 0;
  for (const product of PRODUCTS) {
    let savedProduct = await productRepository.findOne({
      where: { reference: product.reference },
    });

    if (savedProduct) {
      console.log(`Product ${product.reference} already exists, skipping.`);
    } else {
      savedProduct = await productRepository.save(
        productRepository.create({
          reference: product.reference,
          name: product.name,
          unitOfMeasureId: unitOfMeasureIdsByName.get(product.unitOfMeasure),
          categoryId: categoryIdsByName.get(product.category),
          minimumStock: product.minimumStock,
          expiryAlertThreshold: product.expiryAlertThreshold,
        })
      );
      createdCount++;
      console.log(`Product ${product.reference} (${product.name}) created.`);
    }

    if (product.rule) {
      const ruleId = ruleIdsByName.get(product.rule);
      const existingLink = await productRuleRepository.findOne({
        where: { productId: savedProduct.id, ruleId },
      });

      if (!existingLink) {
        await productRuleRepository.save(
          productRuleRepository.create({
            productId: savedProduct.id,
            ruleId,
          })
        );
        console.log(`Linked ${product.reference} to rule "${product.rule}".`);
      }
    }

    productIdsByName.set(product.name, savedProduct.id);
  }

  const lotIdsByReference = new Map<string, number>();
  for (const lot of LOTS) {
    const existing = await lotRepository.findOne({
      where: { reference: lot.reference },
    });

    if (existing) {
      console.log(`Lot ${lot.reference} already exists, skipping.`);
      lotIdsByReference.set(lot.reference, existing.id);
      continue;
    }

    const savedLot = await lotRepository.save(
      lotRepository.create({
        productId: productIdsByName.get(lot.product),
        reference: lot.reference,
        supplierName: lot.supplierName,
        totalQuantity: lot.quantity,
        arrivalDate: daysFromNow(-lot.arrivalDaysAgo),
        expirationDate:
          lot.expirationInDays === null
            ? null
            : daysFromNow(lot.expirationInDays),
      })
    );
    lotIdsByReference.set(lot.reference, savedLot.id);
    console.log(`Lot ${lot.reference} (${lot.product}) created.`);
  }

  for (const palette of PALETTES) {
    const palettierId = palettierIdsByName.get(palette.palettier);

    const existingPalette = await paletteRepository.findOne({
      where: {
        palettierId,
        positionX: palette.x,
        positionY: palette.y,
        positionZ: palette.z,
      },
    });

    const savedPalette =
      existingPalette ??
      (await paletteRepository.save(
        paletteRepository.create({
          palettierId,
          positionX: palette.x,
          positionY: palette.y,
          positionZ: palette.z,
        })
      ));

    if (!existingPalette) {
      console.log(
        `Palette created in ${palette.palettier} at (${String(palette.x)}, ${String(palette.y)}, ${String(palette.z)}).`
      );
    }

    for (const lotReference of palette.lots) {
      const lotId = lotIdsByReference.get(lotReference);
      const existingPaletteLot = await paletteLotRepository.findOne({
        where: { paletteId: savedPalette.id, lotId },
      });

      if (existingPaletteLot) {
        continue;
      }

      const lot = LOTS.find(
        (candidate) => candidate.reference === lotReference
      );
      await paletteLotRepository.save(
        paletteLotRepository.create({
          paletteId: savedPalette.id,
          lotId,
          quantity: lot?.quantity,
        })
      );
      console.log(
        `Lot ${lotReference} placed on palette ${String(savedPalette.id)}.`
      );
    }
  }

  console.log(
    `Demonstration seed complete: ${String(createdCount)} product(s) created.`
  );

  await dataSource.destroy();
}

seedDemonstration().catch((error: unknown) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
