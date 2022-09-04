import "@babel/polyfill";
import dotenv from "dotenv";
import "isomorphic-fetch";
import createShopifyAuth, { verifyRequest } from "@shopify/koa-shopify-auth";
import Shopify, { ApiVersion } from "@shopify/shopify-api";
import Koa from "koa";
import next from "next";
import Router from "koa-router";
import cors from "koa-cors";
import { nextChar } from "../util/sheetUtils";
import Excel from "exceljs";
import { OrderFinancials } from "../util/mapperUtils";
import { format } from "date-fns";

dotenv.config();
const port = parseInt(process.env.PORT ?? "", 10) || 8081;
const dev = process.env.NODE_ENV !== "production";
const app = next({
  dev,
});
const handle = app.getRequestHandler();

Shopify.Context.initialize({
  API_KEY: process.env.SHOPIFY_API_KEY ?? "",
  API_SECRET_KEY: process.env.SHOPIFY_API_SECRET ?? "",
  SCOPES: process.env.SCOPES?.split(",") ?? [],
  HOST_NAME: dev
    ? process.env.DEV_HOST?.replace(/https:\/\/|\/$/g, "") ?? ""
    : process.env.PROD_HOST?.replace(/https:\/\/|\/$/g, "") ?? "",
  API_VERSION: ApiVersion.October20,
  IS_EMBEDDED_APP: true,
  // This should be replaced with your preferred storage strategy
  SESSION_STORAGE: new Shopify.Session.MemorySessionStorage(),
});

// Storing the currently active shops in memory will force them to re-login when your server restarts. You should
// persist this object in your app.
const ACTIVE_SHOPIFY_SHOPS: Record<any, any> = {};

Shopify.Webhooks.Registry.addHandler("APP_UNINSTALLED", {
  path: "/webhooks",
  webhookHandler: async (topic, shop, body) => {
    delete ACTIVE_SHOPIFY_SHOPS[shop];
  },
});

app.prepare().then(async () => {
  const server = new Koa();
  const router = new Router();
  server.keys = [Shopify.Context.API_SECRET_KEY];
  server.use(
    createShopifyAuth({
      async afterAuth(ctx) {
        // Access token and shop available in ctx.state.shopify
        const { shop, accessToken, scope } = ctx.state.shopify;
        const host = ctx.query.host;
        ACTIVE_SHOPIFY_SHOPS[shop] = scope;
        console.log({ accessToken });
        const responses = await Shopify.Webhooks.Registry.register({
          shop,
          accessToken,
          path: "/webhooks",
          topic: "APP_UNINSTALLED",
        });

        if (!responses["APP_UNINSTALLED"].success) {
          console.log(
            `Failed to register APP_UNINSTALLED webhook: ${responses.result}`
          );
        }

        // Redirect to app with shop parameter upon auth
        ctx.redirect(`/?shop=${shop}&host=${host}`);
      },
    })
  );

  const handleRequest = async (
    ctx: Koa.ParameterizedContext<any, Router.IRouterParamContext<any, {}>, any>
  ) => {
    await handle(ctx.req, ctx.res);
    ctx.respond = false;
    ctx.res.statusCode = 200;
  };

  router.post("/webhooks", async (ctx) => {
    try {
      await Shopify.Webhooks.Registry.process(ctx.req, ctx.res);
      console.log(`Webhook processed, returned status code 200`);
    } catch (error) {
      console.log(`Failed to process webhook: ${error}`);
    }
  });

  router.post(
    "/graphql",
    verifyRequest({ returnHeader: true }),
    async (ctx, next) => {
      await Shopify.Utils.graphqlProxy(ctx.req, ctx.res);
    }
  );

  router.post(
    "/rest",
    // verifyRequest({ returnHeader: true }),
    async (ctx, next) => {
      const session = await Shopify.Utils.loadCurrentSession(ctx.req, ctx.res);
      // Create a new client for the specified shop.
      const client = new Shopify.Clients.Rest(
        session.shop,
        session.accessToken
      );
      // Use `client.get` to request the specified Shopify REST API endpoint, in this case `products`.
      const response = await client.get({
        path: "products",
      });

      ctx.body = { t: session.accessToken };
      ctx.status = 201;
      ctx.respond = true;
    }
  );

  router.get("/xls", async (ctx, next) => {
    const data = String(ctx.query.data);
    const parsedData: Record<string, OrderFinancials> = JSON.parse(atob(data));
    const file = __dirname + "/static/Reports.xlsx";
    const workbook = await new Excel.Workbook().xlsx.readFile(file);
    const worksheet = workbook.getWorksheet(1);
    const dataList = Object.entries(parsedData).reverse();
    let currLetter = "E";
    for (let i = 0; i < dataList.length; i++) {
      worksheet.getCell(`${currLetter}2`).value = `${format(
        new Date(dataList[i][0]),
        "LLL"
      )}-${format(new Date(dataList[i][0]), "yyyy")}`;
      worksheet.getCell(`${currLetter}3`).value = dataList[i][1].grossRevenue;
      worksheet.getCell(`${currLetter}4`).value =
        dataList[i][1].shippingRevenue;
      worksheet.getCell(`${currLetter}5`).value = -1 * dataList[i][1].discounts;
      worksheet.getCell(`${currLetter}6`).value = -1 * dataList[i][1].returns;
      worksheet.getCell(`${currLetter}12`).value = dataList[i][1].cogs;
      currLetter = nextChar(currLetter);
    }
    console.log(dataList);
    ctx.body = await workbook.xlsx.writeBuffer();
    ctx.attachment(file);
    ctx.set(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    ctx.set("Content-disposition", "attachment; filename=" + "Report.xlsx");
  });

  router.get("(/_next/static/.*)", handleRequest); // Static content is clear
  router.get("/_next/webpack-hmr", handleRequest); // Webpack content is clear
  router.get("(.*)", async (ctx) => {
    const shop = String(ctx.query.shop);

    // This shop hasn't been seen yet, go through OAuth to create a session
    if (ACTIVE_SHOPIFY_SHOPS[shop] === undefined) {
      ctx.redirect(`/auth?shop=${shop}`);
    } else {
      await handleRequest(ctx);
    }
  });

  server.use(cors({ origin: "*" }));
  server.use(router.allowedMethods());
  server.use(router.routes());
  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
