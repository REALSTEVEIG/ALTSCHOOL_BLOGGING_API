const express = require("express");
const morgan = require("morgan");
const userRouter = require("./routes/userRoutes");
const blogRouter = require("./routes/blogRoutes");
const globalErrorHandler = require("./controllers/errorController");
const AppError = require("./utils/AppError");
const hpp = require("hpp");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const app = express();
const cors = require('cors')
const xss = require('xss-clean')
const swaggerUI = require('swagger-ui-express')
const YAML = require('yamljs')
const swaggerDocument = YAML.load('./swagger.yaml')

// Middleware

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(helmet());
app.use(cors())
app.use(xss())

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour",
});

app.use("/api", limiter);

app.use(
  hpp({
    whitelist: ["tags", "author", "state", "timestamp"],
  })
);

app.use(express.json({ limit: "10kb" }));


app.use('/getdocs', (req, res) => {
  res.send('<h1>VISIT MY BLOG API VIA THE LINK BELOW</h1><a href="/api-docs">Documentation</a>')
})


app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument))
app.use("/api/v1/users", userRouter);
app.use("/api/v1/blogs", blogRouter);

app.get("/", (req, res, next) => {
  res.status(200).json({
    status: "success",
    message: "Welcome to Stephen Ignatius' Blog API",
  });
});
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler); // Error handling middleware;

module.exports = app;
