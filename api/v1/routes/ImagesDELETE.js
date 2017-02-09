const fs = require('fs'),
	RateLimiter = require('../../../structures/RateLimiter');

class ImagesDELETE {
	constructor(controller) {
		this.path = '/images/:id';
		this.router = controller.router;
		this.database = controller.database;
		this.authorize = controller.authorize;

		this.rateLimiter = new RateLimiter({ max: 10 }); // 10/10

		this.router.delete(
			this.path,
			this.rateLimiter.limit.bind(this.rateLimiter),
			this.authorize.bind(this),
			this.run.bind(this)
		);
	}

	async run(req, res) {
		let image = await this.database.Image.findOne({ id: req.params.id });
		if (!image)
			return res.status(404).send({ message: 'Image not found' });

		if (req.user.username !== image.uploader)
			return res.status(403).send({ message: 'You are not the uploader of this image' });

		// Delete image from MongoDB
		await this.database.Image.remove({ id: image.id });
		req.user.uploads--;
		await req.user.save();
		// TODO: Remove from likes and favorites of users

		fs.unlinkSync(`${__dirname}/../../../image/${image.id}.jpg`);

		return res.sendStatus(204);
	}
}

module.exports = ImagesDELETE;