import { Request } from "express";
import { Log } from "../utils/Log";
import * as utility from "../utils/ApiUtility";
import * as postmark from "postmark";
import z from "zod";
import { HttpError } from "../utils/HttpError";
import { HttpStatusCode } from "../utils/HttpStatusCodes";

export class emailController {
  // createAndSendEmail is used to test send the email
  static async createAndSendEmail(req: Request) {
    const emailData: IEmailNotifyReqBody = req.body;
    if (!ZEmailNotifyReqBody.safeParse(emailData).success) {
      throw new HttpError(HttpStatusCode.BAD_REQUEST, "Invalid email body");
    }
    await emailController.sendEmail(
      emailData.html,
      emailData.subject,
      emailData.emailIds
    );
    // return html;
  }

  static async sendEmail(
    generatedHtml: string,
    emailSubject: string,
    emailAddresses: string[]
  ) {
    let from: string;
    let ccOReply: string[];
    let to: string[];
    Log.i(`Customer Email Address is ${emailAddresses.join(", ")}') `);

    if (utility.ApiUtility.isDev()) {
      to = ["tanmoy.dutta@gztech.in"];
      from = "tanmoy.dutta@gztech.in";
      ccOReply = ["tanmoy.dutta@gztech.in"];
    } else {
      to = ["tanmoy.dutta@gztech.in"];
      from = "tanmoy.dutta@gztech.in";
      ccOReply = ["tanmoy.dutta@gztech.in"];
    }
    const client = new postmark.Client(process.env.POSTMARK_ID as string);

    const emailParams: postmark.Message = {
      From: from,
      To: to.join(","),
      Cc: ccOReply.join(","),
      ReplyTo: ccOReply.join(","),
      Subject: emailSubject,
      HtmlBody: generatedHtml,
    };
    // return generatedHtml;
    const res = await client.sendEmail(emailParams);
    Log.i("Email sent. Response from postmark: ", res);
    return { isSuccess: true, message: "Email sent successfully!" };
  }
}

const ZEmailNotifyReqBody = z.object({
  html: z.string(),
  subject: z.string(),
  emailIds: z.string().array(),
});

export type IEmailNotifyReqBody = z.infer<typeof ZEmailNotifyReqBody>;
