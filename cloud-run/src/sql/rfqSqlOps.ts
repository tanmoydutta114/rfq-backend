import { InsertObject, Kysely, sql } from "kysely";
import { jsonArrayFrom } from "kysely/helpers/postgres";
import { nanoid } from "nanoid";
import { DB, Json, JsonArray, JsonValue } from "../../kysely/db";
import {
  IRfqCommentsReq,
  IRfqStoreReq,
  IRfqVendors,
  IRfqsFetchReqBody,
} from "../utils/types";
import { getSQLClient } from "./database";
import { InsertObjectOrList } from "kysely/dist/cjs/parser/insert-values-parser";
import { createDate, generateId } from "../utils/utils";
import { Log } from "../utils/Log";
import { emailController } from "../controllers/emailController";
import { productsSqlOps } from "./productsSqlOps";
import { HttpError } from "../utils/HttpError";
import { HttpStatusCode } from "../utils/HttpStatusCodes";
import Papa from "papaparse";

export class rfqSqlOps {
  static async storeNewRfqs(
    sqlCLient: Kysely<DB>,
    userId: string,
    reqBody: IRfqStoreReq
  ) {
    const rfqId = reqBody.rfqId;
    const description = reqBody.description;
    const now = createDate();

    // const emailSubject = `Request for a quotation`;
    // const emailSendList: { vendor_email: string; vendorEmailBody: string }[] =
    //   [];

    // const rfqData: InsertObjectOrList<DB, "rfqs"> = vendors.map((vendor) => {
    //   const encodedCode = Buffer.from(
    //     `${rfqId}_${vendor.vendor_id}_${generateId()}`
    //   ).toString("base64");
    //   const uniqueURL = `https://some-base-url/${encodedCode}`;
    //   // TODO : create the custom email here only
    //   const vendorEmailBody = email
    //     .replace("&lt;vendorName&gt;&lt;/vendorName&gt", vendor.vendor_name)
    //     .replace("<customLink></customLink>", uniqueURL);
    //   emailSendList.push({
    //     vendor_email: vendor.vendor_email,
    //     vendorEmailBody: vendorEmailBody,
    //   });
    //   return {
    //     rfq_id: rfqId,
    //     vendor_id: vendor.vendor_id,
    //     email_send: false,
    //     is_responded: false,
    //     vendor_access_url: uniqueURL,
    //     created_on: now,
    //     created_by: userId,
    //     modified_on: now,
    //     modified_by: userId,
    //   };
    // });

    const [storeDataRes] = await sqlCLient
      .insertInto("rfqs")
      .values({
        rfq_id: rfqId,
        description: description,
        created_on: now,
        created_by: userId,
        modified_by: userId,
        modified_on: now,
      })
      .returning("rfq_id")
      .execute();

    Log.i(`RFQ successfully stored ${storeDataRes.rfq_id}`);

    // TODO : Send the email to all the emails list.
    // const emailPromise = emailSendList.map(async (mailBody) => {
    //   console.log(`Sending email to ${mailBody.vendor_email}`);
    //   console.log(mailBody.vendorEmailBody);
    //   await emailController.sendEmail(mailBody.vendorEmailBody, emailSubject, [
    //     mailBody.vendor_email,
    //   ]);
    // });
    // await Promise.all(emailPromise);
    return {
      isSuccess: true,
      message: `RFQ created successfully`!,
    };
  }

  static async storeRfqProducts(
    sqlClient: Kysely<DB>,
    userId: string,
    rfqId: string,
    productsIds: number[],
    brandId: number
  ) {
    const now = createDate();
    const addRfqProducts = productsIds.map(async (productId) => {
      await sqlClient
        .insertInto("rfq_products")
        .values({
          rfq_id: rfqId,
          product_id: productId,
          created_by: userId,
          created_on: now,
          modified_by: userId,
          modified_on: now,
          brand_id: brandId,
        })
        .execute();
    });
    await Promise.all(addRfqProducts);
    Log.i(`Products added to the RFQ!`);
    return {
      iSuccess: true,
      message: `Products added to the category successfully added!`,
    };
  }

  static async storeRfqVendors(
    sqlClient: Kysely<DB>,
    userId: string,
    rfqId: string,
    productId: Json[],
    brandId: number,
    vendorDetails: {
      name: string;
      id: number;
      email: string;
    }[],
    emailBody: string
  ) {
    const now = createDate();
    const addRfqProducts = vendorDetails.map(async (vendor) => {
      await sqlClient.transaction().execute(async (transaction) => {
        Log.i(`Sending the email to ${vendor.name} (${vendor.email})`);
        const password = generateId();
        const [recordId] = await transaction
          .insertInto("rfq_vendors")
          .values({
            id: password,
            rfq_id: rfqId,
            product_id: productId,
            passcode: password,
            vendor_id: vendor.id,
            brand_id: brandId,
            created_by: userId,
            created_on: now,
            modified_by: userId,
            modified_on: now,
          })
          .returning("id")
          .execute();
        // TODO : Prepare the email body and send the email using the email controller.

        const vendorEmailBody = emailBody
          .replace("##vendorName##", vendor.name)
          .replace(
            "++commentsLink++",
            `http://localhost:8080/rfqComments/${rfqId}/brand/${brandId}/vendors/${vendor.id}/rfqVendorId/${password}`
          );

        await emailController.sendEmail(vendorEmailBody, "RFQ Details", [
          vendor.email,
        ]);
        await transaction
          .updateTable("rfq_vendors")
          .where("rfq_id", "=", rfqId)
          .where("id", "=", recordId.id)
          .where("vendor_id", "=", vendor.id)
          .set({ email_sent_on: createDate() })
          .execute();
        Log.i(`Vendor Email sent successfully! also status updated!`);
        console.log(vendorEmailBody);
      });
    });

    //localhost:8080/rfqComments/undefined/brand/NaN/vendors/:vendorId/rfqVendorId/:rfqVendorId
    http: await Promise.all(addRfqProducts);
    Log.i(`Email sent to all the vendors...`);
    return {
      iSuccess: true,
      message: `Email sent successfully!`,
    };
  }

  static async getRfqs(sqlClient: Kysely<DB>, requestBody: IRfqsFetchReqBody) {
    const PAGE_SIZE =
      requestBody.pageSize ?? Number(process.env.PAGE_SIZE) ?? 40;
    if (!requestBody.sort) {
      requestBody.sort = {
        path: "created_on",
        direction: "desc",
      };
    }
    if (!requestBody.pageNo) {
      requestBody.pageNo = 1;
    }
    const total_rfqs = await sqlClient
      .selectFrom("rfqs as r")
      .leftJoin("rfq_products as rp", "r.rfq_id", "rp.rfq_id")
      .$if(!!requestBody.searchStr, (qb) =>
        qb.where((eb) =>
          eb.or([eb("rfq_id", "ilike", `%${requestBody.searchStr}%` as string)])
        )
      )
      .select((eb) => eb.fn.countAll<number>().as("total_rfqs"))
      .execute();
    const totalCount = total_rfqs[0].total_rfqs;

    const OFFSET = PAGE_SIZE * (requestBody.pageNo - 1);

    const rfqs = await sqlClient
      .selectFrom("rfqs as r")
      .leftJoin("rfq_products as rp", "r.rfq_id", "rp.rfq_id")
      .$if(!!requestBody.searchStr, (qb) =>
        qb.where((eb) =>
          eb.or([eb("rfq_id", "ilike", `%${requestBody.searchStr}%` as string)])
        )
      )
      .orderBy(requestBody.sort.path, requestBody.sort.direction)
      .limit(PAGE_SIZE)
      .offset(OFFSET)
      .select(["r.rfq_id", "r.is_finished", "r.created_on", "rp.brand_id"])
      .execute();

    const hasMore = OFFSET + PAGE_SIZE < totalCount ? true : false;

    return {
      rfqs,
      hasMore,
      isSuccess: true,
    };
  }

  static async getRfqById(sqlClient: Kysely<DB>, rqfId: number) {
    const rfqs = await sql`
      SELECT
          rp.product_id,
          r.rfq_id,
          jsonb_build_object(
              'product_id', rp.product_id,
              'rfq_id', rp.rfq_id,
              'created_on', rp.created_on,
              'created_by', rp.created_by,
              'modified_on', rp.modified_on,
              'modified_by', rp.modified_by,
              'vendors', jsonb_agg(jsonb_build_object(
                  'vendor_id', rv.vendor_id,
                  'custom_link', rv.custom_link,
                  'created_on', rv.created_on,
                  'created_by', rv.created_by,
                  'modified_on', rv.modified_on,
                  'modified_by', rv.modified_by
              ))
          ) AS product_info,
          jsonb_build_object(
              'rfq_id', r.rfq_id,
              'description', r.description,
              'is_finished', r.is_finished,
              'created_on', r.created_on,ß
              'created_by', r.created_by,
              'modified_on', r.modified_on,
              'modified_by', r.modified_by
          ) AS rfq_info
      FROM
          rfq_products rp
      LEFT JOIN
          rfq_vendors rv ON rp.product_id = rv.product_id
      LEFT JOIN
          rfqs r ON rp.rfq_id = r.rfq_id
      WHERE
          rp.rfq_id = ${rqfId}
      GROUP BY
          rp.product_id, rp.rfq_id, rp.created_on, rp.created_by, rp.modified_on, rp.modified_by, r.rfq_id;
    `.execute(sqlClient);

    return {
      rfqs,
    };
  }

  static async getRfqProducts(
    sqlClient: Kysely<DB>,
    rfqId: string,
    brandId: number
  ) {
    const rfqProducts = await sqlClient
      .selectFrom("rfq_products as rp")
      .leftJoin("products as p", "rp.product_id", "p.id")
      .where("rfq_id", "=", rfqId)
      .where("p.brand_id", "=", brandId)
      .select(["product_id"])
      .execute();
    const rfqProductsIds = rfqProducts.map((product) => product.product_id);

    const products = await sqlClient
      .selectFrom("products")
      .where("id", "not in", rfqProductsIds)
      .where("brand_id", "=", brandId)
      .selectAll()
      .execute();

    return {
      isSuccess: true,
      products,
    };
  }

  static async storeRfqComments(
    sqlClient: Kysely<DB>,
    userId: string,
    rqfId: string,
    rfqVendorId: string,
    vendorId: number,
    brandId: number,
    reqBody: IRfqCommentsReq
  ) {
    const now = createDate();
    const comment = reqBody.comments;
    console.log(userId, rqfId, rfqVendorId, vendorId, brandId);
    const [storeComment] = await sqlClient
      .insertInto("rfq_comments")
      .values({
        rfq_id: rqfId,
        rfq_vendor_id: rfqVendorId,
        vendor_id: vendorId,
        brand_id: brandId,
        comment: JSON.stringify(comment),
        file_ref: reqBody.fileRef,
        created_by: userId,
        created_on: now,
        modified_by: userId,
        modified_on: now,
        commenter_type: reqBody.commenterType,
      })
      .returning("id")
      .execute();
    Log.i(
      `${
        reqBody.commenterType === 0 ? `Admin` : `Vendor`
      } comment stored successfully!, Id : ${storeComment.id}`
    );
    return {
      isSuccess: true,
      message: `Comments stored successfully!`,
    };
  }

  static extractTextFromHTML(html: string): string {
    // Regular expression to match HTML tags and extract text content
    return html.replace(/<[^>]*>?/gm, "");
  }

  static async getRfqComments(
    sqlClient: Kysely<DB>,
    rfqId: string,
    rfqVendorId: string,
    vendorId: number,
    brandId: number
  ) {
    console.log(brandId);
    const comments = await sqlClient
      .selectFrom("rfq_comments as rc")
      .leftJoin("vendors as v", "rc.vendor_id", "v.id")
      .leftJoin("users as u", "rc.created_by", "u.firebase_user_id")
      .where("rfq_id", "=", rfqId)
      .where("rc.rfq_vendor_id", "=", rfqVendorId)
      .where("vendor_id", "=", vendorId)
      .where("brand_id", "=", brandId)
      .orderBy("rc.created_on asc")
      .selectAll("rc")
      .select(["v.name"])
      .select(["u.name as commenter_name"])
      .execute();
    return {
      isSuccess: true,
      comments: comments,
    };
  }

  static async getRfqCommentsExport(
    sqlClient: Kysely<DB>,
    rfqId: string,
    rfqVendorId: string,
    vendorId: number,
    brandId: number
  ) {
    console.log(brandId);
    const comments = await sqlClient
      .selectFrom("rfq_comments as rc")
      .leftJoin("vendors as v", "rc.vendor_id", "v.id")
      .leftJoin("users as u", "rc.created_by", "u.firebase_user_id")
      .where("rfq_id", "=", rfqId)
      .where("rc.rfq_vendor_id", "=", rfqVendorId)
      .where("vendor_id", "=", vendorId)
      .where("brand_id", "=", brandId)
      .orderBy("rc.created_on asc")
      .select(["rc.comment", "rc.created_on", "rc.rfq_id", "rc.commenter_type"])
      .select(["v.name as vendor_name"])
      .select("u.name as commenter_name")
      .execute();
    console.log(comments);
    const flattenedData = comments.map((comment) => {
      console.log(comment.comment);
      const com = comment.comment as { message: string };
      const message =
        comment.comment && rfqSqlOps.extractTextFromHTML(com.message);
      return {
        ...comment,
        comment: message,
        commenter_name:
          comment.commenter_type === 1
            ? comment.vendor_name
            : comment.commenter_name,
      };
    });

    return {
      isSuccess: true,
      comments: flattenedData,
    };
  }

  static async isRfqExists(sqlClient: Kysely<DB>, rfqId: string) {
    const isRfqExists = await sqlClient
      .selectFrom("rfqs")
      .where("rfq_id", "ilike", rfqId)
      .execute();
    if (isRfqExists.length > 0) {
      return { isRfqIdTaken: true };
    }
    return { isRfqIdTaken: false };
  }

  static async storeFile(
    sqlClient: Kysely<DB>,
    fileName: string,
    fileType: string,
    fileData: Buffer,
    rfqId: string,
    rfqVendorId: string,
    vendorId: number,
    brandId: number,
    commenterType: number
  ) {
    const generatedId = nanoid();
    const [storeFile] = await sqlClient
      .insertInto("file_storage")
      .values({
        file_id: generatedId,
        file_name: fileName,
        file_type: fileType,
        file_data: fileData,
        brand_id: brandId,
        rfq_vendor_id: rfqVendorId,
        rfq_id: rfqId,
        commenter_type: commenterType,
        vendor_id: vendorId,
      })
      .returning("file_id")
      .execute();
    Log.i(`File stored successfully!`);
    return {
      isSuccess: true,
      message: "File stored successfully",
      fileId: storeFile.file_id,
    };
  }
  static async getFileList(
    sqlClient: Kysely<DB>,
    rfqId: string,
    rfqVendorId: string,
    vendorId: number,
    brandId: number
  ) {
    const getFile = await sqlClient
      .selectFrom("file_storage")
      .where("brand_id", "=", brandId)
      .where("rfq_id", "=", rfqId)
      .where("vendor_id", "=", vendorId)
      .where("rfq_vendor_id", "=", rfqVendorId)
      .selectAll()
      .execute();
    Log.i(`File fetched successfully!`);
    return {
      isSuccess: true,
      message: "File stored successfully",
      getFile,
    };
  }
  static async deleteFile(sqlClient: Kysely<DB>, fileId: string) {
    await sqlClient
      .deleteFrom("file_storage")
      .where("file_id", "=", fileId)
      .execute();
    return { isSuccess: true, message: `File deleted successful!` };
  }
  static async getFile(sqlClient: Kysely<DB>, fileId: string) {
    const [fileData] = await sqlClient
      .selectFrom("file_storage")
      .where("file_id", "=", fileId)
      .selectAll()
      .execute();
    Log.i(`File download successfully!`);
    return { isSuccess: true, fileData: fileData };
  }
  static async getRfqProductWiseVendors(
    sqlClient: Kysely<DB>,
    rfqId: string,
    productId: number
  ) {
    const vendors = await sqlClient
      .selectFrom("product_vendor_map as pvm")
      .leftJoin("vendors as v", "pvm.vendor_id", "v.id")
      .where("pvm.product_id", "=", productId)
      .select([
        "v.name as vendor_name",
        "v.id",
        "v.email",
        "v.created_on",
        "v.address",
      ])
      .execute(); // Vendor Name needed
    return {
      isSuccess: true,
      vendors,
    };
  }
  static async getRFQAddProductsDropdown(
    sqlClient: Kysely<DB>,
    refqId: string
  ) {
    const allProducts = await sqlClient
      .selectFrom("products")
      .select(["id", "name"])
      .execute();
    const allRFQProducts = await sqlClient
      .selectFrom("rfq_products")
      .where("rfq_id", "=", refqId)
      .select(["product_id"])
      .execute();
    const rfqAlreadyIncludedProductIds = allRFQProducts.map(
      (product) => product.product_id
    );

    const products: { id: number; name: string | null }[] = [];

    allProducts.forEach((product) => {
      if (!rfqAlreadyIncludedProductIds.includes(product.id)) {
        products.push(product);
      }
    });

    return {
      isSuccess: true,
      products,
    };
  }
  static async getVendorByProductIdWhomMailNotYetSent(
    sqlClient: Kysely<DB>,
    productId: number,
    rfqId: string
  ) {
    const vendorDetails = await sqlClient
      .selectFrom("rfq_vendors")
      // .where("product_id", "=", productId)
      .where("rfq_id", "=", rfqId)
      .select("vendor_id")
      .execute();
    const vendorIdsMailAlreadySent = vendorDetails.map(
      (vendor) => vendor.vendor_id
    );

    console.log(vendorIdsMailAlreadySent);

    const vendors = await sqlClient
      .selectFrom("product_vendor_map as pvm")
      .leftJoin("vendors as v", "pvm.vendor_id", "v.id")
      .where("pvm.product_id", "=", productId)
      .$if(vendorIdsMailAlreadySent.length > 0, (eb) =>
        eb.where("pvm.vendor_id", "not in", vendorIdsMailAlreadySent)
      )
      .select([
        "v.id as vendor_id",
        "v.name as vendor_name",
        "v.email as vendor_email",
      ])
      .execute();
    return {
      isSuccess: true,
      vendors,
    };
  }

  static async getRFQBrandsAndProduct(sqlClient: Kysely<DB>, rfqId: string) {
    const productsBrand = await sqlClient
      .selectFrom("rfq_products as rp")
      .leftJoin("brands as b", "b.id", "rp.brand_id")
      .leftJoin("products as p", "p.id", "rp.product_id")
      .where("rp.rfq_id", "=", rfqId)
      .select([
        "b.name as brandName",
        "b.id as brandId",
        "p.name as productName",
        "p.id as productId",
      ])
      .execute();

    return {
      isSuccess: true,
      productsBrand,
    };
  }

  static async getBrandsByRfqId(sqlClient: Kysely<DB>, rfqId: string) {
    const productsBrand = await sqlClient
      .selectFrom("rfq_products as rp")
      .leftJoin("brands as b", "b.id", "rp.brand_id")
      .where("rp.rfq_id", "=", rfqId)
      .select(["b.id"])
      .distinct()
      .execute();
    const productsBrandIds = productsBrand.map((product) => product.id);
    const brands = await sqlClient
      .selectFrom("brands")
      .where("id", "not in", productsBrandIds)
      .selectAll()
      .execute();

    return {
      isSuccess: true,
      brands,
    };
  }
  static async getAddedBrandsByRfqId(sqlClient: Kysely<DB>, rfqId: string) {
    const productsBrand = await sqlClient
      .selectFrom("rfq_products as rp")
      .leftJoin("brands as b", "b.id", "rp.brand_id")
      .where("rp.rfq_id", "=", rfqId)
      .select(["b.id", "b.name"])
      .distinct()
      .execute();
    return {
      isSuccess: true,
      productsBrand,
    };
  }

  static async getRFQVendorsByBrandAndRfq(
    sqlClient: Kysely<DB>,
    rfqId: string
    // brandId: number
  ) {
    const vendors = await sqlClient
      .selectFrom("rfq_vendors as rv")
      .leftJoin("vendors as v", "v.id", "rv.vendor_id")
      .where("rv.rfq_id", "=", rfqId)
      // .where("rv.brand_id", "=", brandId) No need for brand id cause rfq is unique to brand
      .select(["v.name", "v.id", "rv.product_id", "rv.id as rfqVendorId"])
      .execute();

    return {
      isSuccess: true,
      vendors,
    };
  }
  static async getVendorsByRfqIdForAllProductOfBrand(
    sqlClient: Kysely<DB>,
    rfqId: string
  ) {
    const brandId = await sqlClient
      .selectFrom("rfq_products")
      .where("rfq_id", "=", rfqId)
      .select("brand_id")
      .executeTakeFirst();
    if (!brandId || !brandId.brand_id) {
      throw new HttpError(HttpStatusCode.NOT_FOUND, `Brand ID Not Found`);
    }
    // console.log(brandId);
    const vendors = await sqlClient
      .selectFrom("brand_vendor_map as bvm")
      .leftJoin("vendors as v", "v.id", "bvm.vendor_id")
      .where("bvm.brand_id", "=", brandId.brand_id)
      .select(["v.name", "v.id", "bvm.product_id", "v.email"])
      .distinctOn("v.id")
      .execute();

    return {
      isSuccess: true,
      vendors,
    };
  }

  static async getRFQProductsByBrandAndRfq(
    sqlClient: Kysely<DB>,
    rfqId: string,
    brandId: number
  ) {
    const vendors = await sqlClient
      .selectFrom("rfq_products as rp")
      .leftJoin("products as p", "rp.product_id", "p.id")
      .where("rp.rfq_id", "=", rfqId)
      .where("rp.brand_id", "=", brandId)
      .select(["p.name", "p.id"])
      .execute();

    return {
      isSuccess: true,
      vendors,
    };
  }

  static async makeRFQDone(sqlClient: Kysely<DB>, rfqId: string) {
    await sqlClient
      .updateTable("rfqs")
      .where("rfq_id", "=", rfqId)
      .set({
        is_finished: true,
      })
      .execute();
    Log.i(`Rfq updated successfully!`);
    return {
      isSuccess: true,
      message: `RFQ set as completed!`,
    };
  }

  static async getRfqCount(sqlClient: Kysely<DB>) {
    const [finishedRfqCount] = await sqlClient
      .selectFrom("rfqs")
      .where("is_finished", "=", true)
      .select((eb) => eb.fn.countAll<number>().as("total_finished_rfqs"))
      .execute();

    const [notFinishedRfqCount] = await sqlClient
      .selectFrom("rfqs")
      .where("is_finished", "=", false)
      .select((eb) => eb.fn.countAll<number>().as("total_not_finished_rfqs"))
      .execute();

    const [totalRfqCount] = await sqlClient
      .selectFrom("rfqs")
      .select((eb) => eb.fn.countAll<number>().as("total_rfqs"))
      .execute();

    return {
      isSuccess: true,
      data: {
        finishedRfqCount,
        notFinishedRfqCount,
        totalRfqCount,
      },
    };
  }

  static async getVendorsForProductNotAssignedYet(
    sqlClient: Kysely<DB>,
    brandId: number,
    productId: number
  ) {
    console.log(`Here`);
    const getVendorsAlreadyMapped = await sqlClient
      .selectFrom("brand_vendor_map")
      .where("brand_id", "=", brandId)
      .where("product_id", "=", productId)
      .select("vendor_id")
      .execute();
    const vendorsIdAlreadyMapped = getVendorsAlreadyMapped
      .filter((v) => v.vendor_id !== null) // Filter out null values
      .map((v) => v.vendor_id);
    console.log(vendorsIdAlreadyMapped);

    const vendors = await sqlClient
      .selectFrom("vendors")
      .$if(vendorsIdAlreadyMapped.length > 0, (eb) =>
        eb.where("id", "not in", vendorsIdAlreadyMapped)
      )
      .selectAll()
      .execute();

    return {
      isSuccess: true,
      vendors,
    };
  }

  static async rfqBrandWiseCount(sqlClient: Kysely<DB>) {
    const rfqData = await sql<RfqCountSql>`
     SELECT
    b.name AS brand_name,
    b.id AS brand_id,
    COUNT(rp.rfq_id) AS total_rfq,
    COUNT(CASE WHEN r.is_finished = true THEN 1 END) AS finished_rfq_count,
    COUNT(CASE WHEN r.is_finished = false THEN 1 END) AS not_finished_rfq_count,
    jsonb_agg(jsonb_build_object('is_finished', r.is_finished, 'rfq_id', r.rfq_id)) AS rfq_details
    FROM
        rfq_products AS rp
    LEFT JOIN
        brands AS b ON rp.brand_id = b.id
    LEFT JOIN
        rfqs AS r ON rp.rfq_id = r.rfq_id
    GROUP BY
        b.name, b.id;;
    `.execute(sqlClient);
    return rfqData.rows;
  }
}

interface RfqCountSql {
  brand_name: string | null;
  brand_id: string | null;
  total_rfq: number | null;
  finished_rfq_count: number | null;
  not_finished_rfq_count: number | null;
  rfq_details: { rfq_id: string; is_finished: boolean }[];
}
