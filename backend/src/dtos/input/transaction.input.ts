import {
  Field,
  GraphQLISODateTime,
  ID,
  InputType,
  Int,
} from "type-graphql";

import { TransactionType } from "@prisma/client";

@InputType()
export class CreateTransactionInput {
  @Field(() => String)
  description!: string;

  @Field(() => Int)
  amount!: number;

  @Field(() => TransactionType)
  type!: TransactionType;

  @Field(() => GraphQLISODateTime)
  date!: Date;

  @Field(() => ID, { nullable: true })
  categoryId?: string | null;
}

@InputType()
export class UpdateTransactionInput {
  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => Int, { nullable: true })
  amount?: number;

  @Field(() => TransactionType, { nullable: true })
  type?: TransactionType;

  @Field(() => GraphQLISODateTime, { nullable: true })
  date?: Date;

  @Field(() => ID, { nullable: true })
  categoryId?: string | null;
}