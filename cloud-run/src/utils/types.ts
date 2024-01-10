import { ZodArray, ZodEffects, ZodObject, ZodRecord, z } from "zod";

export interface ICheckPermSchemaParams {
  expectedProps?: {
    body?: string[];
    params?: string[];
    query?: string[];
  } | null;
  zodValidation?: {
    bodyProp?: string;
    zodSchema:
      | ZodObject<any, any>
      | ZodArray<any, any>
      | ZodRecord<any>
      | ZodEffects<any>;
  }[];
}
