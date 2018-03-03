const Mongoose = require('mongoose'),
	Schema = Mongoose.Schema;

Mongoose.Promise = global.Promise;

const userSchema = new Schema({
	id: { type: String, unique: true, index: { unique: true } },
	email: { type: String, maxlength: 70, trim: true, select: false },
	password: { type: String, maxlength: 70, select: false },
	username: { type: String, maxlength: 35, trim: true, unique: true, index: { unique: true } },
	token: { type: String, select: false, unique: true, index: { unique: true } },
	verified: { type: Boolean, default: false },
	roles: [{ type: String, enum: ['admin', 'approver', 'reviewReports', 'editPosts'] }],
	uploads: { type: Number, default: 0 },
	likes: [String],
	favorites: [String],
	likesReceived: { type: Number, default: 0 },
	favoritesReceived: { type: Number, default: 0 },
	createdAt: { type: Date, default: Date.now }
});

const verifyKeySchema = new Schema({
	userId: { type: String, unique: true, index: { unique: true } },
	key: String
});

const imageSchema = new Schema({
	id: { type: String, unique: true, index: { unique: true } },
	originalHash: { type: String, unique: true, index: { unique: true }, select: false },
	createdAt: { type: Date, default: Date.now },
	uploader: { type: Object, required: true },
	approver: { type: Object },
	nsfw: { type: Boolean, default: false },
	tags: [{ type: String, index: "text" }],
	artist: String,
	likes: { type: Number, default: 0 },
	favorites: { type: Number, default: 0 },
	comments: [{
		user: String,
		text: String
	}]
});

const pendingImageSchema = new Schema({
	id: { type: String, unique: true, index: { unique: true } },
	originalHash: { type: String, select: false },
	createdAt: { type: Date, default: Date.now },
	uploader: { type: Object, required: true },
	nsfw: { type: Boolean, default: false },
	tags: [{ type: String, index: "text" }],
	artist: String
});

class Database {
	constructor(settings) {
		this.db = Mongoose.createConnection(`mongodb://localhost:${settings.port}/${settings.db}`, {
			user: settings.user,
			pass: settings.pass,
			auth: { authdb: 'admin' }
		});
		this.User = this.db.model('User', userSchema);
		this.VerifyKey = this.db.model('VerifyKey', verifyKeySchema);
		this.Image = this.db.model('Image', imageSchema);
		this.PendingImage = this.db.model('PendingImage', pendingImageSchema);

		this.db.on('error', console.error.bind(console, 'Mongoose error:'));
		this.db.on('open', async () => {
			console.log('Mongoose Connected');
		});
	}
}

module.exports = Database;
