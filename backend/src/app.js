// Create and configure the Express application 
// (middlewares, CORS, JSON parsing). This is the core app.

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// create an app instance
const app = express();

// configure cors 
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

// access json data - convert json body into req.body
app.use(express.json({limit: "16kb"}));

// accept data from url forms - parses html form data 
app.use(express.urlencoded({extended: true, limit: "16kb"}));

// serves files like images if needed
app.use(express.static("public"));

// makes cookies available in req.cookies
app.use(cookieParser());

export { app };