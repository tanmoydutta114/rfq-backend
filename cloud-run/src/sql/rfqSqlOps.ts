import { InsertObject, Kysely } from "kysely";
import { DB } from "../../kysely/db";
import { IRfqStoreReq } from "../utils/types";
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
}
