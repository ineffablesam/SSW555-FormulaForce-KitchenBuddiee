
import { favorites } from '../config/mongoCollections.js';

const createStatusError = (message, status) => {
	const err = new Error(message);
	err.status = status;
	return err;
};

const ensureString = (val, name) => {
	if (val === undefined || val === null) throw createStatusError(`${name} is required`, 400);
	if (typeof val !== 'string') throw createStatusError(`${name} must be a string`, 400);
	return val.trim();
};

const ensureFavorites = (favoritesArr) => {
	if (!Array.isArray(favoritesArr)) throw createStatusError('favorites must be an array', 400);
	favoritesArr.forEach((fav) => {
		if (typeof fav !== 'string') throw createStatusError('each favorite must be a string', 400);
	});
};

export const getFavoritesByUsername = async (username) => {
	const u = ensureString(username, 'username');
	const col = await favorites();
	const doc = await col.findOne({ username: u });
	if (!doc) return { username: u, favorites: [] };
	return { username: doc.username, favorites: doc.favorites || [] };
};

export const upsertFavorites = async (username, favoritesArr) => {
	const u = ensureString(username, 'username');
	ensureFavorites(favoritesArr);
	const col = await favorites();
	const update = {
		$set: {
			username: u,
			favorites: favoritesArr,
			updatedAt: new Date(),
		},
	};
	const opts = { upsert: true };
	const result = await col.updateOne({ username: u }, update, opts);
	if (result.acknowledged === false) throw createStatusError('Could not save favorites', 500);
	return { success: true };
};

export const deleteFavorites = async (username) => {
	const u = ensureString(username, 'username');
	const col = await favorites();
	const result = await col.deleteOne({ username: u });
	if (result.deletedCount === 0) throw createStatusError('No favorites found to delete', 404);
	return { deleted: true };
};

export default {
	getFavoritesByUsername,
	upsertFavorites,
	deleteFavorites,
};

