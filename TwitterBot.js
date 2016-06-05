'use strict';

let Twit = require('twit');

function log(data) {
	console.log(JSON.stringify(data, null, 2));
}

/**
 * Classe TwitterBot
 */
class TwitterBot extends Twit {
	/**
	 * Constructeur de TwitterBot
	 * @param  {Object} config Objet de configuration utilisé par la classe Twit
	 */
	constructor(config) {
		super(config);

		/**
		 * Détermine si la récupération des tweets est déjà lancé
		 * @type {Boolean}
		 */
		this.getTweetsInProgress = false;

		/**
		 * Date de référence pour déterminer les nouveaux tweets
		 * @type {Date}
		 */
		this.refDate = null;

		/**
		 * Limite d'utilisation de l'API de Twitter sur la ressource statuses/mentions_timeline
		 * @type {Number}
		 */
		this.remaining = 0;

		/**
		 * Liste des tweets ayant été retweeté par TwitterBot (contient les id_str des tweets)
		 * @type {Array}
		 */
		this.retweets = [];
	}

	/**
	 * Permet de récupérer la limite d'utilisation de l'API de Twitter avec la ressource statuses/mentions_timeline
	 * @param  {Function} callback Fonction de callback exécuté une fois la récupération de la limite effectué
	 */
	getMentionsTimelineLimit(callback) {
		let _this = this;
		log('getMentionsTimelineLimit');

		this.get('application/rate_limit_status', {
			resources: 'statuses'
		}, function(err, data, response) {
			if (typeof err === 'undefined') {
				_this.remaining = data.resources.statuses['/statuses/mentions_timeline'].remaining;

				if (typeof callback === 'function')
					callback();
			} else {
				log('setTimeout getMentionsTimelineLimit');

				setTimeout(function() {
					_this.getMentionsTimelineLimit(callback);
				}, TwitterBot.TIMER);
			}
		});
	}

	/**
	 * Permet de récupérer les tweets du compte
	 */
	getTweets() {
		let _this = this;

		this.getTweetsInProgress = true;

		this.get('statuses/mentions_timeline', {}, function(err, data, response) {
			if (typeof err === 'undefined') {
				for (let tweet of data) {
					if (isNewTweet(tweet))
						_this.retweet(tweet);
				}
			}

			_this.remaining--;
			_this.getTweetsInProgress = false;
		});

		/**
		 * Détermine si le tweet est un nouveau tweet
		 * @param  {Object}  tweet Objet tweet retourné par l'API de Twitter
		 * @return {Boolean}       true si tweet est un nouveau tweet et false sinon
		 */
		function isNewTweet(tweet) {
			return _this.refDate < new Date(tweet.created_at) && _this.retweets.indexOf(tweet.id_str) == -1;
		}
	}

	/**
	 * Permet d'envoyer un tweet à l'expéditeur du tweet donné
	 * @param  {Object} tweet Objet tweet retourné par l'API de Twitter
	 */
	retweet(tweet) {
		let _this = this;
		let retweet = {};

		this.retweets.push(tweet.id_str);

		retweet.status = '@' + tweet.user.screen_name + ' retweet prev tweet : "' + tweet.text + '"';
		retweet.in_reply_to_status_id = tweet.id_str;

		// pour tester
		if (tweet.user.id_str == '727846907037552642') {
			log(retweet);

			this.post('statuses/update', retweet, function(err, data, response) {
				if (typeof err === 'undefined') {
					TwitterBot.RETWEETED++;

					log('TwitterBot.RETWEETED = ' + TwitterBot.RETWEETED);
				} else {
					log('retweet failed');
					log(err);
				}
			});
		}
	}

	/**
	 * Permet de lancer le bot Twitter
	 */
	run() {
		let _this = this;

		this.refDate = new Date();

		this.getMentionsTimelineLimit(function() {
			setInterval(function() {
				log('remaining = ' + _this.remaining);

				if (_this.getTweetsInProgress === false) {
					if (_this.remaining > 0)
						_this.getTweets();
					else
						_this.getMentionsTimelineLimit(function() {
							if (_this.remaining > 0)
								_this.getTweets();
						});
				}
			}, TwitterBot.TIMER);
		});
	}
}

/**
 * Intervalle de temps (1 min) pour exécuter les fonctions périodiques
 * @type {Number}
 */
TwitterBot.TIMER = 1000 * 60;

/**
 * Compte le nombre de retweets effectués
 * @type {Number}
 */
TwitterBot.RETWEETED = 0;

module.exports = TwitterBot;