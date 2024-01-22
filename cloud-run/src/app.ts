import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { get, set } from "lodash";
import { ApiUtility } from "./utils/ApiUtility";
import { HttpError, sendErrorResponse } from "./utils/HttpError";
import { HttpStatusCode } from "./utils/HttpStatusCodes";
import {
  ICheckPermSchemaParams,
  ZCreateUserReq,
  ZProductsFetchReqBody,
  ZRoleFetchReqBody,
  ZVenderCreateReq,
  ZProductStoreReq,
  ZRVendorFetchReqBody,
  ZRoleCreateReq,
  ZProductCategoryStoreReq,
  ZRfqStoreReq,
  ZRfqsFetchReqBody,
  ZVendorAddProductReq,
  ZRfqProducts,
  ZRfqVendors,
  ZRfqCommentsReq,
} from "./utils/types";
import { rolesController } from "./controllers/rolesController";
import { productsController } from "./controllers/productsController";
import { usersController } from "./controllers/usersController";
import { vendorsController } from "./controllers/vendorsController";
import { ZodSchema } from "zod";
import { rfqController } from "./controllers/rfqController";

const app = express();
app.use(cors());
app.use(express.json());

app.set("port", process.env.PORT || 8080);

app.get("/", (req, res) => {
  res.send(`Hello from cloud run!`);
});

app.post(
  "/api/query/roles",
  ApiUtility.checkUserAuth({}),
  checkPermissionAndReqSchema({
    zodValidation: [{ zodSchema: ZRoleFetchReqBody }],
  }),
  callableWrapper(rolesController.getRoles)
);

app.post(
  "/api/roles",
  ApiUtility.checkUserAuth({}),
  checkPermissionAndReqSchema({
    zodValidation: [{ zodSchema: ZRoleCreateReq }],
  }),
  callableWrapper(rolesController.storeRoles)
);

app.post(
  "/api/query/products",
  ApiUtility.checkUserAuth({}),
  checkPermissionAndReqSchema({
    zodValidation: [{ zodSchema: ZProductsFetchReqBody }],
  }),
  callableWrapper(productsController.getProducts)
);

app.post(
  "/api/query/products/:productId/vendors",
  ApiUtility.checkUserAuth({}),
  checkPermissionAndReqSchema({
    zodValidation: [{ zodSchema: ZProductsFetchReqBody }],
  }),
  callableWrapper(productsController.getProductVendors)
);

app.post(
  "/api/product",
  ApiUtility.checkUserAuth({}),
  checkPermissionAndReqSchema({
    zodValidation: [{ zodSchema: ZProductStoreReq }],
  }),
  callableWrapper(productsController.storeProducts)
);

app.post(
  "/api/query/product-categories",
  ApiUtility.checkUserAuth({}),
  checkPermissionAndReqSchema({
    zodValidation: [{ zodSchema: ZProductsFetchReqBody }],
  }),
  callableWrapper(productsController.getProductCategories)
);

app.post(
  "/api/main-categories/add",
  ApiUtility.checkUserAuth({}),
  checkPermissionAndReqSchema({}),
  callableWrapper(productsController.storeProductMainCategories)
);
app.post(
  "/api/main-categories/:mainCategoryId/sub-categories/add",
  ApiUtility.checkUserAuth({}),
  checkPermissionAndReqSchema({}),
  callableWrapper(productsController.storeProductSubCategories)
);
app.post(
  "/api/sub-categories/:subCategoryId/sub-sub-category/add",
  ApiUtility.checkUserAuth({}),
  checkPermissionAndReqSchema({}),
  callableWrapper(productsController.storeProductSubSubCategories)
);

app.post(
  "/api/vendors",
  ApiUtility.checkUserAuth({}),
  checkPermissionAndReqSchema({
    zodValidation: [{ zodSchema: ZVenderCreateReq }],
  }),
  callableWrapper(vendorsController.storeVendorDetails)
);

app.post(
  "/api/query/vendors",
  ApiUtility.checkUserAuth({}),
  checkPermissionAndReqSchema({
    zodValidation: [{ zodSchema: ZRVendorFetchReqBody }],
  }),
  callableWrapper(vendorsController.getVendors)
);

app.post(
  "/api/vendors/add-product",
  ApiUtility.checkUserAuth({}),
  checkPermissionAndReqSchema({
    zodValidation: [{ zodSchema: ZVendorAddProductReq }],
  }),
  callableWrapper(vendorsController.updateProduct)
);

app.post(
  "/api/rfq",
  ApiUtility.checkUserAuth({}),
  checkPermissionAndReqSchema({
    zodValidation: [{ zodSchema: ZRfqStoreReq }],
  }),
  callableWrapper(rfqController.storeNewRfqs)
);

app.post(
  "/api/rfqs/:rfqId/products",
  ApiUtility.checkUserAuth({}),
  checkPermissionAndReqSchema({
    zodValidation: [{ zodSchema: ZRfqProducts }],
  }),
  callableWrapper(rfqController.addRFQProducts)
);

app.post(
  "/api/rfqs/:rfqId/products/:productId/vendors",
  ApiUtility.checkUserAuth({}),
  checkPermissionAndReqSchema({
    zodValidation: [{ zodSchema: ZRfqVendors }],
  }),
  callableWrapper(rfqController.addRFVendors)
);

app.post(
  "/api/rfqs/:rfqId/products/:productId/vendors/:vendorId/comment",
  ApiUtility.checkUserAuth({}),
  checkPermissionAndReqSchema({
    zodValidation: [{ zodSchema: ZRfqCommentsReq }],
  }),
  callableWrapper(rfqController.storeComment)
);

app.get(
  "/api/rfqs/:rfqId/products/:productId/vendors/:vendorId/comments",
  ApiUtility.checkUserAuth({}),
  checkPermissionAndReqSchema({}),
  callableWrapper(rfqController.getComments)
);

app.get(
  "/api/rfqs/:rfqId/products",
  ApiUtility.checkUserAuth({}),
  checkPermissionAndReqSchema({}),
  callableWrapper(rfqController.getRfqProducts)
);

app.post(
  "/api/query/rfq",
  ApiUtility.checkUserAuth({}),
  checkPermissionAndReqSchema({
    zodValidation: [{ zodSchema: ZRfqsFetchReqBody }],
  }),
  callableWrapper(rfqController.getRfqs)
);

app.get(
  "/api/rfqs/:rfqId",
  ApiUtility.checkUserAuth({}),
  checkPermissionAndReqSchema({}),
  callableWrapper(rfqController.isRfqIdTaken)
);

app.post(
  "/api/create-user",
  ApiUtility.checkUserAuth({}),
  checkPermissionAndReqSchema({
    zodValidation: [{ zodSchema: ZCreateUserReq }],
  }),
  callableWrapper(usersController.createUser)
);

function checkPermissionAndReqSchema<T>(params: ICheckPermSchemaParams) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (params.expectedProps) {
        if (params.expectedProps.body?.length) {
          for (const bodyProp of params.expectedProps.body) {
            if (get(req.body, bodyProp) === undefined) {
              throw new HttpError(
                HttpStatusCode.BAD_REQUEST,
                "Invalid request",
                {
                  message: `${bodyProp} is missing from request body properties`,
                }
              );
            }
          }
        }
        if (params.expectedProps.params?.length) {
          for (const paramProp of params.expectedProps.params) {
            if (!get(req.params, paramProp)) {
              throw new HttpError(
                HttpStatusCode.BAD_REQUEST,
                "Invalid request",
                {
                  message: `${paramProp} is missing from request url params`,
                }
              );
            }
          }
        }
        if (params.expectedProps?.query?.length) {
          for (const queryProp of params.expectedProps.query) {
            if (!get(req.query, queryProp)) {
              throw new HttpError(
                HttpStatusCode.BAD_REQUEST,
                "Invalid request",
                {
                  message: `${queryProp} is missing from request url query`,
                }
              );
            }
          }
        }
      }
      if (params.zodValidation) {
        for (const validation of params.zodValidation) {
          const zodObject = validation.zodSchema;
          const obj = validation.bodyProp
            ? get(req.body, validation.bodyProp)
            : req.body;
          const result = zodObject.safeParse(obj);
          if (!result.success) {
            throw new HttpError(
              500,
              `System encountered an internal error. Please contact the technical support team.`,
              {
                message: `Failed to validate the request schema for ${
                  validation.bodyProp
                    ? `${validation.bodyProp} in req body`
                    : "req body"
                }`,
                objects: result.error.errors,
              }
            );
          } else {
            // Mutate the body props to remove unwanted parts of the schema such as any extra keys
            if (validation.bodyProp) {
              set(req.body, validation.bodyProp, result.data);
            } else {
              req.body = result.data;
            }
          }
        }
      }
      next();
    } catch (err) {
      sendErrorResponse(err, req, res);
    }
  };
}

function callableWrapper<T>(cF: (req: Request) => Promise<T>) {
  return async (req: Request, res: Response) => {
    try {
      const result = await cF(req);
      //DEV NOTE: commenting logging response because of memory issue
      // if (ApiUtility.isDev()) {
      // 	ApiUtility.logInfo(req, `Successfully completed the operation.`, result ?? { isSuccess: true });
      // }
      res.status(200).send(result ?? { isSuccess: true });
    } catch (err) {
      await sendErrorResponse(err, req, res);
    }
  };
}

export default app;
