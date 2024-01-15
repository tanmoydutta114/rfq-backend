import { InsertObject, Kysely } from "kysely";
import { DB } from "../../kysely/db";
import { IRfqStoreReq, IRfqsFetchReqBody } from "../utils/types";
import { getSQLClient } from "./database";
import { InsertObjectOrList } from "kysely/dist/cjs/parser/insert-values-parser";
import { createDate, generateId } from "../utils/utils";
import { Log } from "../utils/Log";

export class rfqSqlOps {
  static async storeNewRfqs(
    sqlCLient: Kysely<DB>,
    userId: string,
    reqBody: IRfqStoreReq
  ) {
    const rfqId = reqBody.rfqId;
    const vendors = reqBody.vendors;
    const email = reqBody.emailBody;
    const now = createDate();

    const emailSubject = `Request for a quotation`;
    const emailSendList: { vendorEmail: string; vendorEmailBody: string }[] =
      [];

    const rfqData: InsertObjectOrList<DB, "rfqs"> = vendors.map((vendor) => {
      const encodedCode = Buffer.from(
        `${rfqId}_${vendor.vendorId}_${generateId()}`
      ).toString("base64");
      const uniqueURL = `https://some-base-url/${encodedCode}`;
      // TODO : create the custom email here only
      const vendorEmailBody = email
        .replace("<vendorName></vendorName>", vendor.vendorName)
        .replace("<customLink></customLink>", uniqueURL);
      emailSendList.push({
        vendorEmail: vendor.vendorEmail,
        vendorEmailBody: vendorEmailBody,
      });
      return {
        rfq_id: rfqId,
        vendor_id: vendor.vendorId,
        email_send: false,
        is_responded: false,
        vendor_access_url: uniqueURL,
        created_on: now,
        created_by: userId,
        modified_on: now,
        modified_by: userId,
      };
    });

    const storeDataRes = await sqlCLient
      .insertInto("rfqs")
      .values(rfqData)
      .returning("id")
      .execute();

    Log.i(`Data hase been stored in DB ${storeDataRes}`);

    // TODO : Send the email to all the emails list.
    emailSendList.map((mailBody) => {
      console.log(`Sending email to ${mailBody.vendorEmail}`);
    });
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
      .select(["id", "rfq_id", "created_on"])
      .execute();

    const hasMore = OFFSET + PAGE_SIZE < totalCount ? true : false;
    return {
      rfqs,
      totalCount,
      hasMore,
    };
  }
}
