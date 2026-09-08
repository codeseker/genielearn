import type {
  Model,
  QueryFilter,
  UpdateQuery,
  PipelineStage,
  Types,
} from "mongoose";
// import { QueryBuilder } from "./query.builder";

export abstract class BaseRepository<T> {
  constructor(protected readonly model: Model<T>) {}

  async create(payload: Partial<T>): Promise<T> {
    return (await this.model.create(payload)) as unknown as T;
  }

  async findById(id: string | Types.ObjectId): Promise<T | null> {
    return (await this.model.findById(id).exec()) as T | null;
  }

  async findOne(filter: QueryFilter<T>): Promise<T | null> {
    return (await this.model.findOne(filter).exec()) as T | null;
  }

  async updateById(
    id: string | Types.ObjectId,
    payload: UpdateQuery<T>,
  ): Promise<T | null> {
    return (await this.model
      .findByIdAndUpdate(id, payload, { returnDocument: "after" })
      .exec()) as T | null;
  }

  async deleteById(id: string | Types.ObjectId): Promise<T | null> {
    return (await this.model.findByIdAndDelete(id).exec()) as T | null;
  }

  async deleteMany(filter: QueryFilter<T>): Promise<number> {
    const result = await this.model.deleteMany(filter).exec();
    return result.deletedCount;
  }

  async exists(filter: QueryFilter<T>): Promise<boolean> {
    const doc = await this.model.exists(filter);
    return doc !== null;
  }

  async count(filter: QueryFilter<T> = {}): Promise<number> {
    return await this.model.countDocuments(filter).exec();
  }

  async aggregate<R = any>(pipeline: PipelineStage[]): Promise<R[]> {
    return await this.model.aggregate(pipeline).exec();
  }

//   query(): QueryBuilder<T> {
//     return new QueryBuilder<T>(this.model as any);
//   }
}