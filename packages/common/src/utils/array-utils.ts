type Callback<Item> = (
  item: Item,
  index: number,
  array: Item[],
) => Promise<unknown>;

type RunInBatchesInput<Item> = {
  array: Item[];
  batchSize: number;
};

type RunInBatchesCallback<Item> = (
  item: Item,
  index: number,
  batch: Item[],
  batches: Item[][],
) => Promise<unknown>;

export class ArrayUtils {
  static async sequentialFor<Item>(
    array: Item[],
    callback: Callback<Item>,
  ): Promise<void> {
    await array.reduce(async (promise, item, index) => {
      await promise;

      return callback(item, index, array);
    }, Promise.resolve() as Promise<unknown>);
  }

  static async parallelFor<Item>(
    array: Item[],
    callback: Callback<Item>,
  ): Promise<void> {
    await Promise.all(
      array.map(async (item, index) => callback(item, index, array)),
    );
  }

  private static splitInChunks<T>(array: T[], size: number): T[][] {
    const result: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      result.push(array.slice(i, i + size));
    }
    return result;
  }

  static async runInBatches<Item>(
    { array, batchSize }: RunInBatchesInput<Item>,
    callback: RunInBatchesCallback<Item>,
  ): Promise<void> {
    const batches = this.splitInChunks(array, batchSize);

    await ArrayUtils.sequentialFor(batches, async (batch) =>
      ArrayUtils.parallelFor(batch, async (...args) =>
        callback(...args, batches),
      ),
    );
  }
}
