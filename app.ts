import express, { NextFunction, Request, Response } from "express";
import session from "express-session";
import { router } from "./routes/auth";
import CONFIG from "./config";
import { beginStreaming } from "./streams";

declare module "express-session" {
  interface SessionData extends Session {
    oauthToken?: string;
    oauthSecret?: string;
    accessToken?: string;
    accessSecret?: string;
  }
}

const app = express();

app.use(
  session({
    secret: "twitter-api-v2-test",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);

app.set("view engine", "ejs");

app.use(router);

beginStreaming();

app.use((err: any, _: Request, res: Response, __: NextFunction) => {
  console.error(err.data);
  res.status(500).render("error");
});

// Start server
app.listen(Number(CONFIG.PORT), () => {
  console.log(`App is listening on port ${CONFIG.PORT}.`);
});
