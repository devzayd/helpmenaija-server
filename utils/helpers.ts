import type { Request, Response, RequestHandler, NextFunction } from "express";
import { TweetV2SingleResult, TwitterApi } from "twitter-api-v2";
import CONFIG, { TOKENS } from "../config";

const BEARER_TOKEN = CONFIG.BEARER_TOKEN;
const WEBSITE_LINK = "https://abdulyusuf.me";

export const oauth1_0Client = new TwitterApi({
  ...TOKENS,
  accessToken: CONFIG.ACCESS_TOKEN,
  accessSecret: CONFIG.ACCESS_SECRET,
});

export function asyncWrapOrError(callback: RequestHandler) {
  return (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(callback(req, res, next)).catch((err) =>
      err ? next(err) : next(new Error("Unknown error."))
    );
  };
}

export const replyTweet = async (tweet: TweetV2SingleResult) => {
  try {
    console.log("Repleid a tweet");

    await oauth1_0Client.v2.reply(
      `Welcome to Helpmenaija BOT. Please click on the link below to set up your emergency contact. Click here ${WEBSITE_LINK}`,
      tweet.data.id
    );
  } catch (error) {
    console.log(error);
  }
};
