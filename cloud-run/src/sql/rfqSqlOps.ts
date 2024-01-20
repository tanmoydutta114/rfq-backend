import { InsertObject, Kysely } from "kysely";
import { DB } from "../../kysely/db";
import {
  IRfqCommentsReq,
  IRfqStoreReq,
  IRfqsFetchReqBody,
} from "../utils/types";
import { getSQLClient } from "./database";
import { InsertObjectOrList } from "kysely/dist/cjs/parser/insert-values-parser";
import { createDate, generateId } from "../utils/utils";
import { Log } from "../utils/Log";
import { emailController } from "../controllers/emailController";

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
    productsIds: number[]
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
    productId: number,
    vendorIds: { name: string; email: string; id: number }[],
    emailBody: string
  ) {
    const now = createDate();
    const addRfqProducts = vendorIds.map(async (vendor) => {
      Log.i(`Sending the email to ${vendor.name} (${vendor.email})`);
      const encodedCode = Buffer.from(
        `${rfqId}_${vendor.id}_${generateId()}`
      ).toString("base64");
      const uniqueURL = `https://some-base-url/${encodedCode}`;
      await sqlClient
        .insertInto("rfq_vendors")
        .values({
          rfq_id: rfqId,
          product_id: productId,
          custom_link: uniqueURL,
          vendor_id: vendor.id,
          created_by: userId,
          created_on: now,
          modified_by: userId,
          modified_on: now,
        })
        .execute();
      // TODO : Prepare the email body and send the email using the email controller.
    });
    await Promise.all(addRfqProducts);
    Log.i(`Products added to the RFQ!`);
    return {
      iSuccess: true,
      message: `Products added to the category successfully added!`,
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
      .selectFrom("rfqs")
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
      .selectFrom("rfqs")
      .$if(!!requestBody.searchStr, (qb) =>
        qb.where((eb) =>
          eb.or([eb("rfq_id", "ilike", `%${requestBody.searchStr}%` as string)])
        )
      )
      .orderBy(requestBody.sort.path, requestBody.sort.direction)
      .limit(PAGE_SIZE)
      .offset(OFFSET)
      .select(["rfq_id", "is_finished", "created_on"])
      .execute();

    const hasMore = OFFSET + PAGE_SIZE < totalCount ? true : false;
    return {
      rfqs,
      totalCount,
      hasMore,
    };
  }

  static async getRfqById(sqlClient: Kysely<DB>, rqfId: number) {}

  static async storeRfqComments(
    sqlClient: Kysely<DB>,
    userId: string,
    rqfId: string,
    productId: number,
    vendorId: number,
    reqBody: IRfqCommentsReq
  ) {
    const now = createDate();
    const comment = reqBody.comments;
    const [storeComment] = await sqlClient
      .insertInto("rfq_comments")
      .values({
        rfq_id: rqfId,
        product_id: productId,
        vendor_id: vendorId,
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
}
