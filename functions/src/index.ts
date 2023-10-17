import {onRequest} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import {BlastEngine, Mail} from "blastengine";

export const sendMail = onRequest(async (request, response) => {
  const {body} = request;
  const userId = process.env.BLASTENGINE_USER_ID;
  const apiKey = process.env.BLASTENGINE_API_KEY;
  if (userId === undefined) {
    logger.error("BLASTENGINE_USER_ID is undefined");
    return;
  }
  if (apiKey === undefined) {
    logger.error("BLASTENGINE_API_KEY is undefined");
    return;
  }
  new BlastEngine(userId, apiKey);
  const mail = new Mail();
  const text = `__USERNAME__様
  お問い合わせいただきありがとうございます。内容を確認し、追ってご連絡いたします。
  
  会社名：
  __COMPANY__
  お名前：
  __USERNAME__
  お問い合わせ内容：
  __MESSAGE__
  `;
  mail
    .setFrom("info@opendata.jp", "管理者")
    .setSubject("お問い合わせありがとうございます")
    .addTo(body.email, {
      USERNAME: body.name,
      COMPANY: body.company,
      MESSAGE: body.message})
    .setText(text)
    .setEncode("UTF-8");
  await mail.send();
  response.status(200).json({delivery_id: mail.deliveryId || ""});
});
