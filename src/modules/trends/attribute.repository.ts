import { eq } from "drizzle-orm";
import {
  db,
  productAttributes,
  type NewProductAttribute,
  type ProductAttribute,
} from "../../db";

export class AttributeRepository {
  async insert(data: NewProductAttribute): Promise<ProductAttribute> {
    const [attr] = await db.insert(productAttributes).values(data).returning();
    return attr!;
  }

  async findByProductId(
    productId: number,
  ): Promise<ProductAttribute | undefined> {
    const [attr] = await db
      .select()
      .from(productAttributes)
      .where(eq(productAttributes.productId, productId))
      .limit(1);
    return attr;
  }

  async findAll(): Promise<ProductAttribute[]> {
    return db.select().from(productAttributes);
  }
}
