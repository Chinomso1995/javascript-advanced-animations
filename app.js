require('dotenv').config()
const express = require('express')
const app = express()
const port = 3000
const path = require('path')

const Prismic = require('@prismicio/client')
const PrismicDOM = require('prismic-dom')


const handleLinkResolver  = (doc) => {
  return '/'
}


const initApi = ({req}) => {
  return Prismic.getApi(process.env.PRISMIC_ENDPOINT, {
    req: req,
    accessToken: process.env.PRISMIC_ACCESS_TOKEN
  })
}
app.use((req, res, next) => {
  res.locals.ctx = {
    endpoint: process.env.PRISMIC_ENDPOINT,
    linkResolver: handleLinkResolver
  }

  res.locals.PrismicDOM = PrismicDOM

  next()
})

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

app.get('/', (req, res) => {
  res.render('pages/home')
})

app.get('/about', async (req, res) => {
  initApi(req).then(api => {
    api.query(
      Prismic.predicates.at('document.type', 'about')
    ).then(response => {
      const {results} = response
      const about = results[0]?.data

    
      res.render('pages/about', {
       about
      })
    })
  })
    
})

  
app.get('/detail/:uid', (req, res) => {
    res.render('pages/detail')
})

  
app.get('/collections', (req, res) => {
    res.render('pages/collections')
})
  
  

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})