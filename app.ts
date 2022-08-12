import express, { NextFunction, Request, Response } from "express";
import { TypeormStore } from "connect-typeorm";
import session from "express-session";
import authRoutes from "./routes/auth";
import contactRoutes from "./routes/contact";
import CONFIG from "./config";
import { initializeDBConnection } from "./data-source";
import { SessionEntity } from "./entity";
import { beginStreaming } from "./streams";

declare module "express-session" {
  interface SessionData extends Session {
    oauthToken?: string;
    oauthSecret?: string;
    accessToken?: string;
    accessSecret?: string;
    userId?: string;
  }
}

const app = express();

// DB
initializeDBConnection();
// DB

app.use(
  session({
    secret: "twitter-api-v2-test",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true, maxAge: 60 * 60 * 1000 },
    store: new TypeormStore({
      cleanupLimit: 2,
      onError(_, err) {
        throw new Error(err as unknown as string);
      },
    }).connect(SessionEntity as any),
  })
);

app.set("view engine", "ejs");

app.use([authRoutes, contactRoutes]);

// beginStreaming();

app.use((err: any, _: Request, res: Response, __: NextFunction) => {
  console.error(err.data);
  res.status(500).render("error");
});

// Start server
app.listen(Number(CONFIG.PORT), () => {
  console.log(`App is listening on port ${CONFIG.PORT}.`);
});
