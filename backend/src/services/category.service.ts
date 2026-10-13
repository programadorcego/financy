import { GraphQLError } from "graphql";
import { Prisma } from "@prisma/client";

import {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "../dtos/input/category.input.js";
import { prismaClient } from "../../prisma/prisma.js";

export class CategoryService {
  private validateName(name: string): string {
    const normalizedName = name.trim();

    if (normalizedName.length < 3) {
      throw new GraphQLError(
        "O nome deve conter pelo menos 3 caracteres.",
        {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        }
      );
    }

    if (normalizedName.length > 100) {
      throw new GraphQLError(
        "O nome deve conter no máximo 100 caracteres.",
        {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        }
      );
    }

    return normalizedName;
  }

  private validateId(id: string): void {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(id)) {
      throw new GraphQLError("ID da categoria inválido.", {
        extensions: {
          code: "BAD_USER_INPUT",
        },
      });
    }
  }

  private handlePrismaError(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new GraphQLError(
        "Você já possui uma categoria com esse nome.",
        {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        }
      );
    }

    throw error;
  }

  async create(userId: string, data: CreateCategoryInput) {
    const name = this.validateName(data.name);

    try {
      return await prismaClient.category.create({
        data: {
          name,
          userId,
        },
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async findAll(userId: string) {
    return prismaClient.category.findMany({
      where: {
        userId,
      },
      orderBy: {
        name: "asc",
      },
    });
  }

  async findById(userId: string, id: string) {
    this.validateId(id);

    const category = await prismaClient.category.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!category) {
      throw new GraphQLError("Categoria não encontrada.", {
        extensions: {
          code: "NOT_FOUND",
        },
      });
    }

    return category;
  }

  async update(
    userId: string,
    id: string,
    data: UpdateCategoryInput
  ) {
    this.validateId(id);

    const name = this.validateName(data.name);

    try {
      const result = await prismaClient.category.updateMany({
        where: {
          id,
          userId,
        },
        data: {
          name,
        },
      });

      if (result.count === 0) {
        throw new GraphQLError("Categoria não encontrada.", {
          extensions: {
            code: "NOT_FOUND",
          },
        });
      }

      return this.findById(userId, id);
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async delete(userId: string, id: string): Promise<boolean> {
    this.validateId(id);

    const result = await prismaClient.category.deleteMany({
      where: {
        id,
        userId,
      },
    });

    if (result.count === 0) {
      throw new GraphQLError("Categoria não encontrada.", {
        extensions: {
          code: "NOT_FOUND",
        },
      });
    }

    return true;
  }
}