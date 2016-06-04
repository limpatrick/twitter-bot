'use strict';

var Twit = require('twit');

function log(data) {
	console.log(JSON.stringify(data, null, 2));
}

class TwitterBot extends Twit {
	constructor(config) {
		super(config);

		this.rateLimit = {
			limit: 0,
			remaining: 0
		};
	}

	/**
	 * Permet de récupérer la limite d'utilisation de l'API de Twitter avec la ressource statuses/mentions_timeline
	 * @param  {Function} callback Fonction de callback exécuté une fois la récupération de la limite effectué
	 */
	getRateLimitStatus(callback) {
		var _this = this;
		log('getRateLimitStatus');
		this.get('application/rate_limit_status', {
			resources: 'statuses'
		}, function(err, data, response) {
			if (typeof err === 'undefined') {
				_this.rateLimit = {
					limit: data.resources.statuses['/statuses/mentions_timeline'].limit,
					remaining: data.resources.statuses['/statuses/mentions_timeline'].remaining,
				};

				if (typeof callback === 'function')
					callback();
			} else
				setTimeout(function() {
					_this.getRateLimitStatus(callback, true);
				}, 1000 * 60);
		});
	}

	/**
	 * Lance le mécanisme de récupération des tweets du compte
	 */
	getTweets() {
		var _this = this;
		var progress = false;

		log('getTweets');

		var idInterval = setInterval(function() {
			log(_this.rateLimit.remaining);
			if (_this.rateLimit.remaining > 0)
				_getTweets();
			else
				_this.getRateLimitStatus(function() {
					if (_this.rateLimit.remaining > 0)
						_getTweets();
				});
		}, 1000);

		/**
		 * Permet de récupérer les tweets du compte
		 */
		function _getTweets() {
			if (!progress) {
				progress = true;

				_this.get('statuses/mentions_timeline', {}, function(err, data, response) {
					if (typeof err === 'undefined') {
						log(data[0].text);
					}

					_this.rateLimit.remaining--;
					progress = false;
				});
			}
		}
	}

	onTweet() {

	}

	run() {
		var _this = this;

		this.getRateLimitStatus(function() {
			_this.getTweets();
		});
	}
}

module.exports = TwitterBot;