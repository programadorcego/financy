import {
    Arg,
    Ctx,
    ID,
    Mutation,
    Query,
    Resolver,
    UseMiddleware,
} from "type-graphql";

import { CategoryService } from "../services/category.service";

import { CategoryModel } from "../models/category.model";

import {
    CreateCategoryInput,
    UpdateCategoryInput,
} from "../dtos/input/category.input";

import { IsAuth } from "../middlewares/auth.middleware";
import { GraphqlContext } from "../graphql/context";

@Resolver(() => CategoryModel)
@UseMiddleware(IsAuth)
export class CategoryResolver {
    private readonly categoryService = new CategoryService();

    @Mutation(() => CategoryModel)
    async createCategory(
        @Arg("data", () => CreateCategoryInput)
        data: CreateCategoryInput,

        @Ctx()
        context: GraphqlContext
    ): Promise<CategoryModel> {
        return this.categoryService.create(
            context.user!,
            data
        );
    }

    @Query(() => [CategoryModel])
    async categories(
        @Ctx()
        context: GraphqlContext
    ): Promise<CategoryModel[]> {
        return this.categoryService.findAll(context.user!);
    }

    @Query(() => CategoryModel)
    async category(
        @Arg("id", () => ID)
        id: string,

        @Ctx()
        context: GraphqlContext
    ): Promise<CategoryModel> {
        return this.categoryService.findById(
            context.user!,
            id
        );
    }

    @Mutation(() => CategoryModel)
    async updateCategory(
        @Arg("id", () => ID)
        id: string,

        @Arg("data", () => UpdateCategoryInput)
        data: UpdateCategoryInput,

        @Ctx()
        context: GraphqlContext
    ): Promise<CategoryModel> {
        return this.categoryService.update(
            context.user!,
            id,
            data
        );
    }

    @Mutation(() => Boolean)
    async deleteCategory(
        @Arg("id", () => ID)
        id: string,

        @Ctx()
        context: GraphqlContext
    ): Promise<boolean> {
        return this.categoryService.delete(
            context.user!,
            id
        );
    }
}