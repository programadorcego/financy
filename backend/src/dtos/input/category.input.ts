import { Field, InputType } from "type-graphql";

@InputType()
export class CreateCategoryInput {
    @Field(() => String)
    name!: string;
}

@InputType()
export class UpdateCategoryInput {
    @Field(() => String)
    name!: string;
}