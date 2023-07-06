//SCHEMA

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const gallerySchema = new Schema({
	title: String,
});

const Gallery = mongoose.model('images', gallerySchema);

module.exports = Gallery;