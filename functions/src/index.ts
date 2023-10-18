// 必要なモジュールやライブラリをインポート
import {onRequest} from "firebase-functions/v2/https";
// loggerのインポートがコメントアウトされています。現在は使用していません。
// import * as logger from "firebase-functions/logger";
import {BlastEngine, Mail} from "blastengine";

// 環境変数からBlastEngineのユーザーIDとAPIキーを取得
const userId = process.env.BLASTENGINE_USER_ID!;
const apiKey = process.env.BLASTENGINE_API_KEY!;

// BlastEngineの設定を初期化
new BlastEngine(userId, apiKey);

// メールを送信する関数をエクスポート（公開）します。
export const sendMail = onRequest(async (request, response) => {
  // リクエストから本文を取得
  const {body} = request;
  
  // 新しいメールのインスタンスを作成
  const mail = new Mail();

  // 送信するメールのテキスト内容を定義
  const text = `__USERNAME__様
  お問い合わせいただきありがとうございます。内容を確認し、追ってご連絡いたします。
  
  会社名：
  __COMPANY__
  お名前：
  __USERNAME__
  お問い合わせ内容：
  __MESSAGE__
  `;

  // メールの各設定を行います。
  mail
    .setFrom("info@opendata.jp", "管理者")  // 送信者のアドレスと名前を設定
    .setSubject("お問い合わせありがとうございます")  // メールの件名を設定
    .addCc("atsushi@moongift.co.jp")  // CC（同報送信）のアドレスを追加
    .addTo(body.email, { // 宛先と、テキスト内のプレースホルダを設定
      USERNAME: body.name,
      COMPANY: body.company,
      MESSAGE: body.message})
    .setText(text)  // 上で定義したテキスト内容をセット
    .setEncode("UTF-8");  // 文字エンコードをUTF-8に設定

  // メールを送信
  await mail.send();

  // レスポンスとして、配信IDをJSON形式で返します。
  response.status(200).json({delivery_id: mail.deliveryId || ""});
});
