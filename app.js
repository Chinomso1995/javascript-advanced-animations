require("dotenv").config();
const express = require("express");
const logger = require('morgan')
const errorHandler = require('errorhandler')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const app = express();
const port = 3000;
const path = require("path");

const Prismic = require("@prismicio/client");
const PrismicDOM = require("prismic-dom");


app.use(logger('dev'));
app.use(bodyParser.json())
app.use(errorHandler());
app.use(bodyParser.urlencoded({extended: false}))
app.use(methodOverride())
app.use(express.static(path.join(__dirname, 'public')))

const handleLinkResolver = doc => {
  if(doc.type == 'product'){
    return `/detail/${doc.slug}`
  }

  if(doc.type == 'collections'){
    return `/collections`
  }


  if(doc.type == 'about'){
    return `/about`
  }

  return "/";
};

const initApi = ({ req }) => {
  return Prismic.getApi(process.env.PRISMIC_ENDPOINT, {
    req: req,
    accessToken: process.env.PRISMIC_ACCESS_TOKEN,
  });
};
app.use((req, res, next) => {
  // res.locals.ctx = {
  //   endpoint: process.env.PRISMIC_ENDPOINT,
  //   linkResolver: handleLinkResolver,
  // };

  res.locals.Link = handleLinkResolver

  res.locals.PrismicDOM = PrismicDOM;

  next();
});


app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.get("/", async(req, res) => {
  const api = await initApi(req);
  const home = await api.getSingle('home')
  const preloader = await api.getSingle('preloader')
  const navigation = await api.getSingle('navigation')
  const {results: collections} = await api.query(Prismic.Predicates.at('document.type', 'collection'), {
    fetchLinks: 'product.image'
  })
 
 
  res.render("pages/home", {
    collections,
    home,
    preloader,
    navigation
  });
});

app.get("/about", async (req, res) => {
  const api = await initApi(req)
  const preloader = await api.getSingle('preloader')
  const navigation = await api.getSingle('navigation')
  initApi(req).then((api) => {
    api
      .query(Prismic.predicates.at("document.type", "about"))
      .then((response) => {
        const { results } = response;
        const about = results[0]?.data;

        res.render("pages/about", {
          about,
          preloader,
          navigation
        });
      });
  });
});

app.get("/detail/:uid", async (req, res) => {
  const api = await initApi(req);
  const preloader = await api.getSingle('preloader')
  const navigation = await api.getSingle('navigation')
  const product = await api.getByUID("product", req.params.uid, {
    fetchLinks: 'collection.title'
  });
  const collection = product.data.collection.data.title[0].text
 
  res.render("pages/detail", {
    product,
    collection,
    preloader,
    navigation
  });
});

app.get("/collections", async (req, res) => {
  const api = await initApi(req);
  const home = await api.getSingle('home')
  const navigation = await api.getSingle('navigation')
  const preloader = await api.getSingle('preloader')
  const {results: collections} = await api.query(Prismic.Predicates.at('document.type', 'collection'), {
    fetchLinks: 'product.image'
  })
 


  res.render('pages/collections', {
    collections,
    home,
    preloader,
    navigation
  })
  
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
