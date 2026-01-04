import { Transaction } from "./transaction";
import { UseCase } from "./use-case";

type Deps = {
  transaction: Transaction;
};

class TransactionalUseCaseDecorator<Input, Output>
  implements UseCase<Input, Output>
{
  constructor(
    private deps: Deps,
    private useCase: UseCase<Input, Output>,
  ) {}

  async execute(input: Input): Promise<Output> {
    this.deps.transaction.start();
    try {
      const result = await this.useCase.execute(input);
      await this.deps.transaction.commit();
      return result;
    } catch (e) {
      await this.deps.transaction.abort();
      throw e;
    } finally {
      await this.deps.transaction.end();
    }
  }
}

export { TransactionalUseCaseDecorator };
