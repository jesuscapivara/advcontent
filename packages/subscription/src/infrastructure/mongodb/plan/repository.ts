import { AbstractMongoRepository, CollectionType } from "@org/common/mongo";
import { Result } from "@org/common/result";

import { PlanNotFoundErrorError } from "../../../domain/catalog/errors";
import { Plan } from "../../../domain/catalog/plan";
import { PlanRepository } from "../../../domain/catalog/plan-repository";

import { PlanMapper } from "./mapper";
import { PlanSchema } from "./schema";

class MongoPlanRepository
  extends AbstractMongoRepository<PlanSchema>
  implements PlanRepository
{
  protected collectionName = CollectionType.PlansCatalog;

  getByName(_: string): Promise<Result<Plan, Error>> {
    throw new Error("Method not implemented.");
  }

  async getTrialPlan(): Promise<Result<Plan, Error>> {
    const schema = await this.collection.findOne({ isTrial: true });

    if (!schema) {
      return Result.fail(new Error("Trial plan not found"));
    }

    return Result.ok(PlanMapper.toDomain(schema));
  }

  async create(plan: Plan) {
    const schema = PlanMapper.toSchema(plan);

    await this.collection.insertOne(schema);
  }

  async edit(plan: Plan): Promise<Result<undefined, PlanNotFoundErrorError>> {
    const schema = PlanMapper.toSchema(plan);

    const result = await this.collection.updateOne(
      { _id: schema._id },
      { $set: { ...schema, version: schema.version + 1 } },
    );

    if (result.modifiedCount) {
      return Result.ok(undefined);
    }

    return Result.fail(new PlanNotFoundErrorError(plan.id));
  }

  async getAll(): Promise<Plan[]> {
    const schemas = await this.collection.find().toArray();

    return schemas.map((s) => PlanMapper.toDomain(s));
  }
}

export { MongoPlanRepository };
