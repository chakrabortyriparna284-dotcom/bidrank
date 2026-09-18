/* eslint-disable */
import { GenericDataModel, GenericId } from "convex/values";
import schema from "../schema";
import { DataModelFromSchemaDefinition } from "convex/server";

export type DataModel = DataModelFromSchemaDefinition<typeof schema>;
export type Doc<TableName extends keyof DataModel> = DataModel[TableName]["document"];
export type Id<TableName extends keyof DataModel> = GenericId<TableName>;
