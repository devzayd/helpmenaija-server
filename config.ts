import fs from "fs";
import dotenv from "dotenv";
import { TwitterApi } from "twitter-api-v2";

export const CONFIG = dotenv.parse(fs.readFileSync(__dirname + "/.env"));

export const TOKENS = {
  appKey: CONFIG.CONSUMER_KEY,
  appSecret: CONFIG.CONSUMER_SECRET,
};

// console.log(TOKENS);

// Create client used to generate auth links only
export const requestClient = new TwitterApi({ ...TOKENS });

export default CONFIG;
