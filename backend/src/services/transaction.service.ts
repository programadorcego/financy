import { GraphQLError } from "graphql";

import {
  TransactionType,
  type Prisma,
} from "@prisma/client";

import { prismaClient } from "../../prisma/prisma";

import {
  CreateTransactionInput,
  UpdateTransactionInput,
} from "../dtos/input/transaction.input";

export class TransactionService {
  private validateId(id: string): void {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(id)) {
      throw new GraphQLError("ID inválido.", {
        extensions: {
          code: "BAD_USER_INPUT",
        },
      });
    }
  }

  private validateDescription(description: string): string {
    const normalized = description.trim();

    if (normalized.length < 3) {
      throw new GraphQLError(
        "A descrição deve conter pelo menos 3 caracteres.",
        {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        }
      );
    }

    if (normalized.length > 255) {
      throw new GraphQLError(
        "A descrição deve conter no máximo 255 caracteres.",
        {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        }
      );
    }

    return normalized;
  }

  private validateAmount(amount: number): void {
    if (!Number.isSafeInteger(amount) || amount <= 0) {
      throw new GraphQLError(
        "O valor deve ser um número inteiro positivo em centavos.",
        {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        }
      );
    }

    if (amount > 2147483647) {
      throw new GraphQLError(
        "O valor excede o limite permitido.",
        {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        }
      );
    }
  }

  private validateType(type: TransactionType): void {
    if (!Object.values(TransactionType).includes(type)) {
      throw new GraphQLError(
        "O tipo da transação é inválido.",
        {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        }
      );
    }
  }

  private validateDate(date: Date): void {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
      throw new GraphQLError(
        "A data da transação é inválida.",
        {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        }
      );
    }
  }

  private async validateCategory(
    userId: string,
    categoryId: string
  ): Promise<void> {
    this.validateId(categoryId);

    const category = await prismaClient.category.findFirst({
      where: {
        id: categoryId,
        userId,
      },
    });

    if (!category) {
      throw new GraphQLError(
        "Categoria não encontrada.",
        {
          extensions: {
            code: "NOT_FOUND",
          },
        }
      );
    }
  }

  async create(userId: string, data: CreateTransactionInput) {
    const description = this.validateDescription(data.description);

    this.validateAmount(data.amount);
    this.validateType(data.type);
    this.validateDate(data.date);

    if (data.categoryId != null) {
      await this.validateCategory(userId, data.categoryId);
    }

    return prismaClient.transaction.create({
      data: {
        description,
        amount: data.amount,
        type: data.type,
        date: data.date,
        userId,
        categoryId: data.categoryId ?? null,
      },
      include: {
        category: true,
      },
    });
  }

  async findAll(userId: string) {
    return prismaClient.transaction.findMany({
      where: {
        userId,
      },
      include: {
        category: true,
      },
      orderBy: {
        date: "desc",
      },
    });
  }

  async findById(userId: string, id: string) {
    this.validateId(id);

    const transaction = await prismaClient.transaction.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        category: true,
      },
    });

    if (!transaction) {
      throw new GraphQLError(
        "Transação não encontrada.",
        {
          extensions: {
            code: "NOT_FOUND",
          },
        }
      );
    }

    return transaction;
  }

  async update(
    userId: string,
    id: string,
    data: UpdateTransactionInput
  ) {
    this.validateId(id);

    const updateData: Prisma.TransactionUncheckedUpdateManyInput = {};

    if (data.description !== undefined) {
      updateData.description = this.validateDescription(
        data.description
      );
    }

    if (data.amount !== undefined) {
      this.validateAmount(data.amount);
      updateData.amount = data.amount;
    }

    if (data.type !== undefined) {
      this.validateType(data.type);
      updateData.type = data.type;
    }

    if (data.date !== undefined) {
      this.validateDate(data.date);
      updateData.date = data.date;
    }

    if (data.categoryId !== undefined) {
      if (data.categoryId !== null) {
        await this.validateCategory(userId, data.categoryId);
      }

      updateData.categoryId = data.categoryId;
    }

    const result = await prismaClient.transaction.updateMany({
      where: {
        id,
        userId,
      },
      data: updateData,
    });

    if (result.count === 0) {
      throw new GraphQLError(
        "Transação não encontrada.",
        {
          extensions: {
            code: "NOT_FOUND",
          },
        }
      );
    }

    return this.findById(userId, id);
  }

  async delete(userId: string, id: string): Promise<boolean> {
    this.validateId(id);

    const result = await prismaClient.transaction.deleteMany({
      where: {
        id,
        userId,
      },
    });

    if (result.count === 0) {
      throw new GraphQLError(
        "Transação não encontrada.",
        {
          extensions: {
            code: "NOT_FOUND",
          },
        }
      );
    }

    return true;
  }
}