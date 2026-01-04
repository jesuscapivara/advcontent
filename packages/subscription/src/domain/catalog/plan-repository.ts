import { Result } from "@org/common/result";

import { Plan } from "./plan";

interface PlanRepository {
  getByName(name: string): Promise<Result<Plan, Error>>;
  getTrialPlan(): Promise<Result<Plan, Error>>;
}

export type { PlanRepository };
