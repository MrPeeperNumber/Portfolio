// Initialize ENV
// npm install dotenv
// npm install koa-methodoverride
// npm install koa-bodyparser
require('dotenv').config();
const override = require('koa-methodoverride');
const parser = require('koa-bodyparser');

// Backblaze
const backblaze = require('./backblaze.js');

// // Connect to database
// // require mongoose
// const mongoose = require('mongoose');
// const db = mongoose.connection;
// const host = process.env.CLUSTER;
// const dbupdate = {
// 	useNewUrlParser: true,
// 	useUnifiedTopology:true,
// };
// mongoose.connect(host, dbupdate);

// db.on('error', (err) => console.log('Error, DB not connected'));
// db.on('connected', () => console.log('Connected to Mongo'));
// db.on('disconnected', () => console.log('Mongo is Disconnected'));
// db.on('open', () => console.log('Connection made!'));

// //Model Schema
// const Gallery = require('./models/gallery.js');

// Create Koa server
const koa = require ('koa');
const server = new koa();

// Create static folder (for front end stuff)
// require koa-static
const static = require('koa-static');

// Create router
// require koa-router
const Router = require('koa-router');
const route = new Router();

// Creating views
// require koa-views
// require nunjucks
const views = require('koa-views');
const nunj = require('nunjucks');
nunj.configure('./views', {autoescape: true});

// Routes
// route.get() 		used when requesting information or files from a server 
// route.post() 	used when sending information or files to a server
// route.patch() 	used when changing a part of data
// route.put() 		used when replacing entire data piece
// route.delete() 	used when removing data 
// All included is CRUD - Create, Read, Update, and Delete
// ctx				context parameter, combination of request and response			

// root route
route.get('/', async (ctx) => {
	console.log('connected to root route');

	await ctx.render('index.njk', {});

});

// My Projects
route.get('/my-projects', async (ctx) => {
	console.log('connected to root route');

	await ctx.render('my-projects.njk', {});

});

// Gallery
route.get('/gallery', async (ctx) => {
	console.log('connected to gallery route');
	const results = await backblaze.getResults();

	console.log(Object.keys(results));

	let firstImages = [];
	for(values of Object.values(results)) {
		firstImages.push(values[0]);
	}

	await ctx.render('gallery.njk', {
		titles: Object.keys(results),
		images: firstImages
	});

});

// Individual Galleries
route.get('/gallery/:name', async (ctx) => {
	const results = await backblaze.getResults();
	const name = ctx.params.name;

	console.log(results);
	await ctx.render('gallery-images.njk', {
		images: Object.values(results[name])
	})
});

// Middleware
// Everything that happens between the request and the response\
server.use(override('_method'));
server.use(parser());
server.use(views('./views', {map: {njk: 'nunjucks'}}));
server.use(route.routes());
server.use(static('./public'));

// Port to listen on
server.listen(4001, 'localhost', () => console.log('Listening on port 4001'));