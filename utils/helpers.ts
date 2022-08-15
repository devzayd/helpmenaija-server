import type { Request, Response, RequestHandler, NextFunction } from "express";
import { TweetV2SingleResult, TwitterApi } from "twitter-api-v2";
import CONFIG, { TOKENS } from "../config";
import client from "../db";

const BEARER_TOKEN = CONFIG.BEARER_TOKEN;
const WEBSITE_LINK = "https://helpmenaija-client.vercel.app";
const BOT_USERNAME = "helpmenaija";

export interface IUser {
  id: string;
  username: string;
  twitter_user_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface IContact extends IUser {
  name: string;
  userId: string;
}

export const oauth1_0Client = new TwitterApi({
  ...TOKENS,
  accessToken: CONFIG.ACCESS_TOKEN,
  accessSecret: CONFIG.ACCESS_SECRET,
});

/**
 * Handle sending a message to any twitter user.
 *
 * @param userId string
 * @param messageToBeSent string
 * @return <void>
 */
export async function sendMessageToTwitterUser(
  userId: string,
  messageToBeSent: string
) {
  console.log("INCOMING_PAYLOAD_TO_BE_SENT", { userId, messageToBeSent });

  await oauth1_0Client.v1.sendDm({
    recipient_id: userId,
    text: messageToBeSent,
  });
}

export function asyncWrapOrError(callback: RequestHandler) {
  return (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(callback(req, res, next)).catch((err) =>
      err ? next(err) : next(new Error("Unknown error."))
    );
  };
}

export const replyToNewUser = async (tweet: TweetV2SingleResult) => {
  try {
    console.log("Replied a tweet");

    await oauth1_0Client.v2.reply(
      `Welcome to Helpmenaija BOT. Please click on the link below to set up your emergency contacts. ${WEBSITE_LINK}`,
      tweet.data.id
    );
  } catch (error) {
    console.log(error);
  }
};

export const checkIfUserIsRegistered = async (
  twitter_user_id: string
): Promise<{ isRegistered: boolean; user: IUser }> => {
  try {
    const { rows } = await client.query(
      "SELECT * FROM users WHERE twitter_user_id = $1",
      [twitter_user_id]
    );

    console.log(rows);

    if (rows.length === 0) {
      return { isRegistered: false, user: null };
    }

    return { isRegistered: true, user: rows[0] as IUser };
  } catch (error) {
    console.log(error);
  }
};

export const getUserEmergencyContact = async (userId: string) => {
  try {
    const { rows } = await client.query(
      "SELECT * FROM contacts WHERE 'contacts.userId' = $1",
      [userId]
    );

    console.log("Emergency Contacts", rows);

    return rows as IContact[];
  } catch (error) {
    console.log(error);
  }
};

export const replyToRegisteredUser = async (
  tweet: TweetV2SingleResult,
  user: IUser
) => {
  try {
    // TODO: Send DM to Users (victim) emergency contacts.
    const emergencyContacts = await getUserEmergencyContact(user.id);

    const requests = emergencyContacts.map((contact) => {
      const message = `Hello @${contact.username}. @${user.username} just messaged us, they're in an emergency situation. Here's the content of the message sent:
      
      "${tweet.data.text}"
      
      from @${BOT_USERNAME}
      `;

      return sendMessageToTwitterUser(contact.twitter_user_id, message).catch(
        (err) => {
          console.log("Error Sending Message to Contact", err);
        }
      );
    });

    await Promise.all(requests);
  } catch (error) {
    console.log(error);
  }
};
