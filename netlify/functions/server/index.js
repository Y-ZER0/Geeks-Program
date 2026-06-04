import serverless from "serverless-http";
import app from "../../../server/app.js";

export const handler = serverless(app, {
  request: (req) => {
    req.url = `/api${req.url}`;
  }
})