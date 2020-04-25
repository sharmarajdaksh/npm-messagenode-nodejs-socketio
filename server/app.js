const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const uuidv4 = require('uuid/v4');

const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');

const app = express();

// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json

// Handle file uploads
const fileStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		// Store files in the images folder
		cb(null, 'images');
	},
	filename: (req, file, cb) => {
		// Name files via unique ids
		cb(null, uuidv4());
	},
});

// Filter incoming files by mimetype
const fileFilter = (req, file, cb) => {
	if (
		file.mimetype === 'image/png' ||
		file.mimetype === 'image/jpg' ||
		file.mimetype === 'image/jpeg'
	) {
		cb(null, true);
	} else {
		cb(null, false);
	}
};

// Serve static files from the images directory
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use(
	multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
);

// CORS
app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader(
		'Access-Control-Allow-Methods',
		'OPTIONS, GET, POST, PUT, PATCH, DELETE'
	);
	res.setHeader(
		'Access-Control-Allow-Headers',
		'Content-Type, Authorization'
	);
	next();
});

app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);

// Custom global error handling function
app.use((error, req, res, next) => {
	console.log(error);
	const status = error.statusCode || 500;
	const message = error.message;
	const data = error.data;
	res.status(status).json({ message, data });
});

mongoose
	.connect(
		'mongodb+srv://sharmarajdaksh:6znFH8ZJ3bcR@cluster0-djq23.mongodb.net/posts?retryWrites=true&w=majority'
	)
	.then((result) => app.listen(8080))
	.catch((err) => console.log(err));
