import { Arg, Ctx, ID, Mutation, Query, Resolver, UseMiddleware } from "type-graphql";
import { TransactionModel } from "../models/transaction.model";
import { IsAuth } from "../middlewares/auth.middleware";
import { TransactionService } from "../services/transaction.service";
import { CreateTransactionInput, UpdateTransactionInput } from "../dtos/input/transaction.input";
import { GraphqlContext } from "../graphql/context";

@Resolver(() => TransactionModel)
@UseMiddleware(IsAuth)
export class TransactionResolver {
  private readonly transactionService = new TransactionService();

  @Mutation(() => TransactionModel)
  async createTransaction(
    @Arg("data", () => CreateTransactionInput)
    data: CreateTransactionInput,

    @Ctx()
    context: GraphqlContext
  ): Promise<TransactionModel> {
    return this.transactionService.create(
      context.user!,
      data
    );
  }

  @Query(() => [TransactionModel])
  async transactions(
    @Ctx()
    context: GraphqlContext
  ): Promise<TransactionModel[]> {
    return this.transactionService.findAll(context.user!);
  }

  @Query(() => TransactionModel)
  async transaction(
    @Arg("id", () => ID)
    id: string,

    @Ctx()
    context: GraphqlContext
  ): Promise<TransactionModel> {
    return this.transactionService.findById(
      context.user!,
      id
    );
  }

  @Mutation(() => TransactionModel)
  async updateTransaction(
    @Arg("id", () => ID)
    id: string,

    @Arg("data", () => UpdateTransactionInput)
    data: UpdateTransactionInput,

    @Ctx()
    context: GraphqlContext
  ): Promise<TransactionModel> {
    return this.transactionService.update(
      context.user!,
      id,
      data
    );
  }

  @Mutation(() => Boolean)
  async deleteTransaction(
    @Arg("id", () => ID)
    id: string,

    @Ctx()
    context: GraphqlContext
  ): Promise<boolean> {
    return this.transactionService.delete(
      context.user!,
      id
    );
  }
}