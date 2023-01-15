require("dotenv").config();
const express = require("express");
const errorHandler = require('errorhandler')
const app = express();
const port = 3000;
const path = require("path");

const Prismic = require("@prismicio/client");
const PrismicDOM = require("prismic-dom");

const handleLinkResolver = (doc) => {
  return "/";
};

const initApi = ({ req }) => {
  return Prismic.getApi(process.env.PRISMIC_ENDPOINT, {
    req: req,
    accessToken: process.env.PRISMIC_ACCESS_TOKEN,
  });
};
app.use((req, res, next) => {
  res.locals.ctx = {
    endpoint: process.env.PRISMIC_ENDPOINT,
    linkResolver: handleLinkResolver,
  };

  res.locals.PrismicDOM = PrismicDOM;

  next();
});

app.use(errorHandler());
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.get("/", (req, res) => {
  res.render("pages/home");
});

app.get("/about", async (req, res) => {
  initApi(req).then((api) => {
    api
      .query(Prismic.predicates.at("document.type", "about"))
      .then((response) => {
        const { results } = response;
        const about = results[0]?.data;

        res.render("pages/about", {
          about,
        });
      });
  });
});

app.get("/detail/:uid", async (req, res) => {
  const api = await initApi(req);
  const product = await api.getByUID("product", req.params.uid, {
    fetchLinks: 'collection.title'
  });
  const collection = product.data.collection.data.title[0].text
 
  res.render("pages/detail", {
    product,
    collection
  });
});

app.get("/collections", async (req, res) => {
  const api = await initApi(req);
  const {results: collections} = await api.query(Prismic.Predicates.at('document.type', 'collection'), {
    fetchLinks: 'product.image'
  })
 
  collections.forEach(collection => {
    console.log(collection.data.title)
  })

  res.render('pages/collections', {
    collections
  })
  
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
