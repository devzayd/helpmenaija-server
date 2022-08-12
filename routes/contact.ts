import { Router } from "express";
import { TwitterApi } from "twitter-api-v2";
import { TOKENS } from "../config";
import { asyncWrapOrError } from "../utils/helpers";

const router = Router();

router.get(
  "/followers",
  asyncWrapOrError(async (req, res) => {
    const { accessToken, accessSecret, userId } = req.session;

    console.log({ session: req.session });

    if (!accessToken || !accessSecret || !userId) {
      return res.status(403).send({
        status: "error",
        message: "Authorization credentials are absent.",
      });
    }

    const userClient = new TwitterApi({
      ...TOKENS,
      accessToken,
      accessSecret,
    });

    const data = await userClient.v2.followers(userId);

    return res.status(200).send({
      status: "success",
      data,
    });
  })
);

export default router;
