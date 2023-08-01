/* eslint-disable no-unused-vars */
require('dotenv').config();
const fetch = require('node-fetch');
const logger = require('morgan');
const path = require('path');
const express = require('express');
const errorHandler = require('errorhandler');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const app = express();
const port = process.env.PORT || 8080;
const Prismic = require('@prismicio/client');
const PrismicH = require('@prismicio/helpers');
const { application } = require('express');
const UAParser = require('ua-parser-js');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(errorHandler());
app.use(methodOverride());
app.use(express.static(path.join(__dirname, 'public')));


// Initialize the prismic.io api
const initApi = (req) => {
  return Prismic.createClient(process.env.PRISMIC_ENDPOINT, {
    accessToken: process.env.PRISMIC_ACCESS_TOKEN,
    req,
    fetch,
  });
};

// Link Resolver
const HandleLinkResolver = (doc) => {
  if (doc.type === 'product') {
    return `/detail/${doc.slug}`;
  }


  if (doc.type === 'about') {
    return `/about`;
  }

  if (doc.type === 'thenegrospaceprogram') {
    return `/thenegrospaceprogram`;
  }


  if (doc.type === 'places') {
    return '/places';
  }

  if (doc.type === 'thepark') {
    return `/thepark`;
  }


  if (doc.type === 'inlab_schibsted') {
    return `/inlabschibsted`;
  }
  // Default to homepage
  return '/';
};

// Middleware to inject prismic context

app.use((req, res, next) => {
  const ua = UAParser(req.headers['user-agent']);

  res.locals.isDesktop = ua.device.type === undefined;
  res.locals.isPhone = ua.device.type === 'mobile';
  res.locals.isTablet = ua.device.type === 'tablet';

  res.locals.processType = res.locals.isPhone ? 'process_intro_text_mobile': 'process_intro_text';
  res.locals.textType = res.locals.isPhone ? 'manifesto_text_mobile' : 'manifesto_text';
  res.locals.character1Type = res.locals.isPhone ? 'character1_text_mobile' : 'character1_text';
  res.locals.character2Type = res.locals.isPhone ? 'character2_text_mobile' : 'character2_text';
  res.locals.capsuleType = res.locals.isPhone ? 'space_capsule_text_mobile' : 'space_capsule_text';

  res.locals.poemType = res.locals.isPhone ? 'poem_mobile' : 'poem';

  res.locals.Link = HandleLinkResolver;
  res.locals.PrismicH = PrismicH;
  res.locals.Numbers = (index) => {
    return index === 0
    ? 'One'
    : index === 1
    ? 'Two'
    : index === 2
    ? 'Three'
    : index === 3
      ? 'Four'
      : index === 4
      ? 'Five'
      : '';
  };

  next();
});

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.locals.basedir = app.get('views');

const handleRequest = async (api) => {
  // eslint-disable-next-line camelcase
  const [meta, preloader, navigation, home, about, thenegrospaceprogram, thepark, places, inlab_schibsted] =
  await Promise.all([
    api.getSingle('metadata'),
    api.getSingle('preloader'),
    api.getSingle('navigation'),
    api.getSingle('home'),
    api.getSingle('about'),
    api.getSingle('thenegrospaceprogram'),
    api.getSingle('thepark'),
    api.getSingle('places'),
    api.getSingle('inlab_schibsted')

  ]);

  const quotes = preloader.data.quotes1.map(item => item.quotes); // Extracts quotes array
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];


  console.log(about, about.data.body , home, home.data.body, thenegrospaceprogram.data.body);

  const assets = [];

  home.data.gallery.forEach((item) => {
    assets.push(item.image.url);
  });

  about.data.gallery.forEach((item) => {
    assets.push(item.image.url);
  });

  about.data.body.forEach((section) => {
    if (section.slice_type === 'gallery') {
      section.items.forEach((item) => {
        assets.push(item.image.url);
      });
    }
  });

  // collections.forEach((collection) => {
    //   collection.data.list.forEach((item) => {
      //     assets.push(item.product.data.image.url);
      //   });
      // });


      return {
        assets,
        meta,
        randomQuote,
        home,
        about,
        navigation,
        preloader,
        thenegrospaceprogram,
        thepark,
        places,
        inlab_schibsted,
        // Pass randomQuote in the object you return
      };
    };


app.get('/', async (req, res) => {
  const api = await initApi(req);
  const defaults = await handleRequest(api);

  res.render('pages/home', {
    ...defaults,
    quote: defaults.randomQuote
  });
});



app.get('/thenegrospaceprogram', async (req, res) => {
  const api = await initApi(req);
  const defaults = await handleRequest(api);


  res.render('pages/thenegrospaceprogram', {
    ...defaults, quote: defaults.randomQuote
  });
});


app.get('/thepark', async (req, res) => {
  const api = await initApi(req);
  const defaults = await handleRequest(api);


  res.render('pages/thepark', {
    ...defaults, quote: defaults.randomQuote
  });
});

app.get('/inlab_schibsted', async (req, res) => {
  const api = await initApi(req);
  const defaults = await handleRequest(api);


  res.render('pages/inlabschibsted', {
    ...defaults, quote: defaults.randomQuote
  });
});




app.get('/about', async (req, res) => {
  const api = await initApi(req);
  const defaults = await handleRequest(api);

  res.render('pages/about', {
    ...defaults, quote: defaults.randomQuote
  });
});

app.get('/places', async (req, res) => {
  const api = await initApi(req);
  const defaults = await handleRequest(api);

  res.render('pages/places', {
    ...defaults, quote: defaults.randomQuote
  });
});


app.use('*', (req, res) => {
  res.status(404).send('Page not found');
});

// app.get('/detail/:uid', async (req, res) => {
  //   const api = await initApi(req);
  //   const defaults = await handleRequest(api);

  //   const product = await api.getByUID('product', req.params.uid, {
    //     fetchLinks: 'collection.title',
    //   });

    //   if (product) {
      //     res.render('pages/detail', {
        //       product,
        //       ...defaults,
        //     });
        //   } else {
          //     res.status(404).send('Page not found');
          //   }
          // });


          app.listen(port, () => {
            console.log(`Example app listening at http://localhost:${port}`);
          });

          // "start": "concurrently --kill-others \"npm run backend:development\" \"npm run frontend:development\""
