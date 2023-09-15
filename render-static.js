/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *	This file is for rendering the server to static images for *
 *	the purposes of GitHub and Cloudflare Pages				   *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

// Initiliaze environment variable usage
require('dotenv').config();

// Initialize BackBlaze API library
const backblaze = require('./backblaze.js');

// Initialize Nunjucks library
const nunj = require('nunjucks');
nunj.configure('./views', {autoescape: true});

// Initialize FileStream library
const fs = require('node:fs/promises');

// FS output
const output = (name, input) => {
	fs.writeFile(name, input);
}

// Render each page to a string
// index render
const index = nunj.render('index.njk', {});
output("static-output/index.html", index);

// my-projects render
const myProjects = nunj.render('my-projects.njk', {});
output("static-output/my-projects.html", myProjects);

// gallery render
const galleryRender = async () => {
	const results = await backblaze.getResults();

	let firstImages = [];
	for(values of Object.values(results)) {
		firstImages.push(values[0]);
	}

	const gallery = await nunj.render('gallery.njk', {
		titles: Object.keys(results),
		images: firstImages
	});
	output("static-output/gallery.html", gallery);
}
galleryRender();

// galleries render
const multiRender = async () => {
	const results = await backblaze.getResults();
	const names = Object.keys(results);

	for(item in Object.keys(results)) {
		const galleries = await nunj.render('gallery-images.njk', {
			images: Object.values(results[names.at(item)])
		});
		output(`static-output/gallery/${names.at(item)}.html`, galleries);
	}
};
multiRender();

// Move the CSS file and images to static-output
const moveCSSandImages = async () => {
	const css =	await fs.readFile('./public/css/style.css');
	await fs.writeFile('static-output/css/style.css', css);

	const imagesDirectory = await fs.readdir('./public/images');
	console.log(await imagesDirectory);
	for( item in imagesDirectory ) {
		const image = await fs.readFile(`./public/images/${imagesDirectory.at(item)}`)
		await fs.writeFile(`static-output/images/${imagesDirectory.at(item)}`, image);
	}
};
moveCSSandImages();