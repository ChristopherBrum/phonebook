const dummy = (postList) => {
	return 1;
};

const totalLikes = (blogs) => {
	if (!Array.isArray(blogs)) return;
	return blogs.reduce((total, blog) => total += blog.likes, 0);
};

module.exports = {
	dummy,
	totalLikes,
};