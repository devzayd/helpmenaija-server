import { Router } from "express";
import { TwitterApi } from "twitter-api-v2";
import CONFIG, { requestClient, TOKENS } from "../config";
import { asyncWrapOrError } from "../utils/helpers";

const router = Router();

router.get(
  "/login",
  asyncWrapOrError(async (req, res) => {
    const { accessToken, accessSecret, userId } = req.session;

    // User Credentials present
    if (accessToken && accessSecret && userId) {
      const tempClient = new TwitterApi({
        ...TOKENS,
        accessToken,
        accessSecret,
      });

      const { data } = await tempClient.currentUserV2();

      return res.render("callback", {
        accessToken,
        accessSecret,
        screenName: data.username,
        userId,
      });
    }

    const link = await requestClient.generateAuthLink(
      `http://127.0.0.1:${CONFIG.PORT}/auth`
    );

    // Save token secret to use it after callback
    req.session.oauthToken = link.oauth_token;
    req.session.oauthSecret = link.oauth_token_secret;

    return res.render("index", { authLink: link.url, authMode: "callback" });
  })
);

router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (!err) {
      return res.send({ status: "success", message: "User Logged out" });
    }
  });
});

router.get(
  "/auth",
  asyncWrapOrError(async (req, res) => {
    // Invalid request
    if (!req.query.oauth_token || !req.query.oauth_verifier) {
      res.status(400).render("error", {
        error:
          "Bad request, or you denied application access. Please renew your request.",
      });
      return;
    }

    const token = req.query.oauth_token as string;
    const verifier = req.query.oauth_verifier as string;
    const savedToken = req.session.oauthToken;
    const savedSecret = req.session.oauthSecret;

    if (!savedToken || !savedSecret || savedToken !== token) {
      res.status(400).render("error", {
        error:
          "OAuth token is not known or invalid. Your request may have expire. Please renew the auth process.",
      });
      return;
    }

    // Build a temporary client to get access token
    const tempClient = new TwitterApi({
      ...TOKENS,
      accessToken: token,
      accessSecret: savedSecret,
    });

    // Ask for definitive access token
    const { accessToken, accessSecret, screenName, userId } =
      await tempClient.login(verifier);

    // You can store & use accessToken + accessSecret to create a new client and make API calls!
    req.session.accessToken = accessToken;
    req.session.accessSecret = accessSecret;
    req.session.userId = userId;

    return res.render("callback", {
      accessToken,
      accessSecret,
      screenName,
      userId,
    });
  })
);

export default router;
