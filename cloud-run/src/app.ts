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
  ZFetchProductsByCategoryId,
  ZVendorLogin,
  ZBradsCreateReq,
  ZSubProductStore,
  ZDeleteUserReq,
} from "./utils/types";
import { rolesController } from "./controllers/rolesController";
import { productsController } from "./controllers/productsController";
import { usersController } from "./controllers/usersController";
import { vendorsController } from "./controllers/vendorsController";
import { rfqController } from "./controllers/rfqController";
import multer from "multer";
import { brandController } from "./controllers/brandController";

const app = express();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(cors());
app.use(express.json());

app.set("port", process.env.PORT || 8080);

app.get("/", (req, res) => {
  res.send(`Hello from cloud run!`);
});

app.get(
  "/api/get-user",
  ApiUtility.checkUserAuth({}),
  callableWrapper(usersController.getUser)
);

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
  "/api/products/:productId/sub-product",
  ApiUtility.checkUserAuth({}),
  checkPermissionAndReqSchema({
    zodValidation: [{ zodSchema: ZSubProductStore }],
  }),
  callableWrapper(productsController.storeSubProducts)
);

app.post(
  "/api/query/product-by-category",
  ApiUtility.checkUserAuth({}),
  checkPermissionAndReqSchema({
    zodValidation: [{ zodSchema: ZFetchProductsByCategoryId }],
  }),
  callableWrapper(productsController.getProductsByCategoryId)
);

app.get(
  "/api/brands/:brandId/products",
  ApiUtility.checkUserAuth({}),
  checkPermissionAndReqSchema({}),
  callableWrapper(brandController.getProductsByBrandId)
);

app.get(
  "/api/products/:productId/sub-products",
  ApiUtility.checkUserAuth({}),
  checkPermissionAndReqSchema({}),
  callableWrapper(productsController.getSubProductsByProductId)
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
  "/api/query/product-brands",
  ApiUtility.checkUserAuth({}),
  checkPermissionAndReqSchema({
    zodValidation: [{ zodSchema: ZProductsFetchReqBody }],
  }),
  callableWrapper(productsController.getProductBrands)
);

app.post(
  "/api/query/product-brands/:brandId/products/:productId/vendors/:vendorId",
  ApiUtility.checkUserAuth({}),
  checkPermissionAndReqSchema({}),
  callableWrapper(brandController.addBrandVendor)
);

app.get(
  "/api/query/brands/:brandId/products/:productId",
  ApiUtility.checkUserAuth({}),
  checkPermissionAndReqSchema({}),
  callableWrapper(brandController.getVendorsByBrandAndProductId)
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
  "/api/vendor/login",
  ApiUtility.checkUserAuth({}),
  checkPermissionAndReqSchema({
    zodValidation: [{ zodSchema: ZVendorLogin }],
  }),
  callableWrapper(vendorsController.vendorLogin)
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

app.put(
  "/api/rfqs/:rfqId/done",
  ApiUtility.checkUserAuth({}),
  checkPermissionAndReqSchema({}),
  callableWrapper(rfqController.makeRFQDone)
);

app.get(
  "/api/rfqs/count",
  ApiUtility.checkUserAuth({}),
  checkPermissionAndReqSchema({}),
  callableWrapper(rfqController.rfqCount)
);
app.get(
  "/api/rfqs/brand/count",
  ApiUtility.checkUserAuth({}),
  checkPermissionAndReqSchema({}),
  callableWrapper(rfqController.rfqBrandWiseCount)
);

// Deprecated
app.post(
  "/api/rfqs/:rfqId/products",
  ApiUtility.checkUserAuth({}),
  checkPermissionAndReqSchema({
    zodValidation: [{ zodSchema: ZRfqProducts }],
  }),
  callableWrapper(rfqController.addRFQProducts)
);

app.post(
  "/api/rfqs/:rfqId/brands/:brandId/products",
  ApiUtility.checkUserAuth({}),
  checkPermissionAndReqSchema({
    zodValidation: [{ zodSchema: ZRfqProducts }],
  }),
  callableWrapper(rfqController.addRFQProducts)
);

app.post(
  "/api/rfqs/:rfqId/brands/:brandId/send-mail-vendors",
  ApiUtility.checkUserAuth({}),
  checkPermissionAndReqSchema({
    zodValidation: [{ zodSchema: ZRfqVendors }],
  }),
  callableWrapper(rfqController.sendMailToVendorsForRFQ)
);

app.get(
  "/api/rfqs/:rfqId/brand-products",
  ApiUtility.checkUserAuth({}),
  checkPermissionAndReqSchema({}),
  callableWrapper(rfqController.getBrandsProductsByRfqId)
);

app.get(
  "/api/brandId/:brandId/products/:productId/vendors", // NEW API for get only the vendors not yet mapped to vendors -> products
  ApiUtility.checkUserAuth({}),
  checkPermissionAndReqSchema({}),
  callableWrapper(rfqController.getVendorsForProductNotAssignedYet)
);

// NOT NEEDED
app.get(
  "/api/rfqs/:rfqId/new-brands",
  ApiUtility.checkUserAuth({}),
  checkPermissionAndReqSchema({}),
  callableWrapper(rfqController.getRFQBrandsByRfqId) // New Api to add Brand to existing RFQ
);

app.get(
  "/api/rfqs/:rfqId/brands",
  ApiUtility.checkUserAuth({}),
  checkPermissionAndReqSchema({}),
  callableWrapper(rfqController.getRFQAddedBrandsByRfqId) // New Api to Fetch already added brands of an API
);

app.get(
  "/api/rfqs/:rfqId/vendors", // New Api to get the list of vendors for comments
  ApiUtility.checkUserAuth({}),
  checkPermissionAndReqSchema({}),
  callableWrapper(rfqController.getVendorsByRfqIdAndBrand)
);

app.get(
  "/api/rfqs/:rfqId/brands/all-vendors", // New Api to get the list of vendors for all product of a brand.
  ApiUtility.checkUserAuth({}),
  checkPermissionAndReqSchema({}),
  callableWrapper(rfqController.getVendorsByRfqIdForAllProductOfBrand)
);

app.get(
  "/api/rfqs/:rfqId/products/:productId/vendors",
  ApiUtility.checkUserAuth({}),
  checkPermissionAndReqSchema({
    expectedProps: { params: ["rfqId", "productId"] },
  }),
  callableWrapper(rfqController.getRfqProductWiseVendors)
);

app.get(
  "/api/rfqs/:rfqId/brands/:brandId/products",
  ApiUtility.checkUserAuth({}),
  checkPermissionAndReqSchema({
    expectedProps: { params: ["rfqId", "brandId"] },
  }),
  callableWrapper(rfqController.getRfqProducts)
);

app.get(
  "/api/rfqs/:rfqId/products/:productId/vendors-dropdown",
  ApiUtility.checkUserAuth({}),
  checkPermissionAndReqSchema({
    expectedProps: { params: ["rfqId", "productId"] },
  }),
  callableWrapper(rfqController.getProductVendorsWhomEmailNotSent)
);

app.post(
  "/api/rfqs/:rfqId/rfqVendorId/:rfqVendorId/vendors/:vendorId/brands/:brandId/comment",
  ApiUtility.checkUserAuth({ accessType: "external" }),
  checkPermissionAndReqSchema({
    zodValidation: [{ zodSchema: ZRfqCommentsReq }],
  }),
  callableWrapper(rfqController.storeComment)
);

app.get(
  "/api/rfqs/:rfqId/rfqVendorId/:rfqVendorId/vendors/:vendorId/brands/:brandId/comments",
  ApiUtility.checkUserAuth({ accessType: "external" }),
  checkPermissionAndReqSchema({}),
  callableWrapper(rfqController.getComments)
);

app.get(
  "/api/rfqs/:rfqId/rfqVendorId/:rfqVendorId/vendors/:vendorId/brands/:brandId/comments/export",
  upload.single("file"),
  ApiUtility.checkUserAuth({ accessType: "external" }),
  checkPermissionAndReqSchema({}),
  rfqController.getCommentsCSV
);

app.post(
  "/api/rfqs/:rfqId/rfqVendorId/:rfqVendorId/vendors/:vendorId/brands/:brandId/:commenterType/file-upload",
  upload.single("file"),
  ApiUtility.checkUserAuth({ accessType: "external" }),
  checkPermissionAndReqSchema({}),
  callableWrapper(rfqController.storeFile)
);

app.get(
  "/api/rfqs/:rfqId/rfqVendorId/:rfqVendorId/vendors/:vendorId/brands/:brandId/file-list",
  ApiUtility.checkUserAuth({ accessType: "external" }),
  checkPermissionAndReqSchema({}),
  callableWrapper(rfqController.getFiles)
);

app.get(
  "/api/rfqs/file/:fileId",
  upload.single("file"),
  ApiUtility.checkUserAuth({ accessType: "external" }),
  checkPermissionAndReqSchema({}),
  rfqController.downloadFile
);

app.delete(
  "/api/rfqs/file/:fileId",
  ApiUtility.checkUserAuth({ accessType: "external" }),
  callableWrapper(rfqController.deleteFile)
);

app.get(
  "/api/rfqs/:rfqId/brands/:brandId/products/unique", // NEW api to get the products for RFQ
  ApiUtility.checkUserAuth({}),
  checkPermissionAndReqSchema({}),
  callableWrapper(rfqController.getRfqProducts)
);

app.get(
  "/api/rfqs/:rfqId/products-dropdown",
  ApiUtility.checkUserAuth({}),
  checkPermissionAndReqSchema({}),
  callableWrapper(rfqController.getRFQAddProductsDropdown)
);

app.post(
  "/api/query/rfq",
  ApiUtility.checkUserAuth({}),
  checkPermissionAndReqSchema({
    zodValidation: [{ zodSchema: ZRfqsFetchReqBody }],
  }),
  callableWrapper(rfqController.getRfqs)
);

app.post(
  "/api/query/rfqId",
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

app.get(
  "/api/users",
  ApiUtility.checkUserAuth({}),
  checkPermissionAndReqSchema({}),
  callableWrapper(usersController.getUsers)
);

app.post(
  "/api/delete-user",
  ApiUtility.checkUserAuth({}),
  checkPermissionAndReqSchema({
    zodValidation: [{ zodSchema: ZDeleteUserReq }],
  }),
  callableWrapper(usersController.deleteUser)
);

// ========================= BRANDS =============================

app.post(
  "/api/brands",
  ApiUtility.checkUserAuth({}),
  checkPermissionAndReqSchema({
    zodValidation: [{ zodSchema: ZBradsCreateReq }],
  }),
  callableWrapper(brandController.createBrand)
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
