'use strict';

let Twit = require('twit');
let Translator = require('./Translator.js');

function log(data) {
	console.log(JSON.stringify(data, null, 2));
}

/**
 * Classe TwitterBot
 */
class TwitterBot {
	/**
	 * Constructeur de TwitterBot
	 * @param  {Object} config Objet de configuration utilisé pour configurer Twit et Translator
	 */
	constructor(config) {
		/**
		 * Détermine si la récupération des tweets est déjà lancé
		 * @type {Boolean}
		 */
		this._getTweetsInProgress = false;

		/**
		 * Date de référence pour déterminer les nouveaux tweets
		 * @type {Date}
		 */
		this._refDate = null;

		/**
		 * Limite d'utilisation de l'API de Twitter sur la ressource statuses/mentions_timeline
		 * @type {Number}
		 */
		this._remaining = 0;

		/**
		 * Liste des tweets ayant été retweeté par TwitterBot (contient les id_str des tweets)
		 * @type {Array}
		 */
		this._retweets = [];

		/**
		 * Instance du module Translator
		 * @type {Translator}
		 */
		this._translator = new Translator(config.mstranslator);

		/**
		 * Instance du module Twit
		 * @type {Twit}
		 */
		this._twit = new Twit(config.twitter);
	}

	/**
	 * Créer le message en réponse à un tweet donné
	 * @param  {Object}   tweet    Objet tweet retourné par l'API de Twitter
	 * @param  {Function} callback Fonction de callback exécuté une fois la génération de la réponse faite
	 */
	createResponseMessage(tweet, callback) {
		let _this = this;
		let response = '@' + tweet.user.screen_name + ' Traduction : ';
		let text = tweet.text.substring(tweet.text.indexOf(' ') + 1); // on retire la mention du compte dans le message

		this._translator.detect(text, function(err, ln) {
			if (err === null)
				_this._translator.translate(ln, 'fr', text, function(err, data) {
					if (err === null) {
						response += data.translation;

						if (typeof callback === 'function')
							callback(response);
					}
				});
		});
	}

	/**
	 * Permet de récupérer la limite d'utilisation de l'API de Twitter avec la ressource statuses/mentions_timeline
	 * @param  {Function} callback Fonction de callback exécuté une fois la récupération de la limite effectuée
	 */
	setRemaining(callback) {
		let _this = this;
		log('Récupération limite d\'utilisation ressource statuses/mentions_timeline');

		this._twit.get('application/rate_limit_status', {
			resources: 'statuses'
		}, function(err, data, response) {
			if (typeof err === 'undefined') {
				_this._remaining = data.resources.statuses['/statuses/mentions_timeline'].remaining;

				if (typeof callback === 'function')
					callback();
			} else
				log(err);
		});
	}

	/**
	 * Permet de récupérer les tweets du compte
	 * @param  {Function} callback Fonction de callback exécuté une fois la récupération des tweets effectuée
	 */
	getTweets(callback) {
		let _this = this;

		this._getTweetsInProgress = true;

		this._twit.get('statuses/mentions_timeline', {}, function(err, data, response) {
			if (typeof callback === 'function')
				callback(err, data, response);

			_this._getTweetsInProgress = false;
		});
	}

	/**
	 * Permet d'envoyer un tweet à l'expéditeur du tweet donné
	 * @param  {Object}   tweet    Objet tweet initial retourné par l'API de Twitter
	 * @param  {Function} callback Fonction de callback exécuté une fois l'envoi du tweet effectué
	 */
	retweet(tweet, callback) {
		let _this = this;

		this._retweets.push(tweet.id_str);

		this.createResponseMessage(tweet, function(response) {
			let retweet = {};

			retweet.status = response;
			retweet.in_reply_to_status_id = tweet.id_str;

			_this._twit.post('statuses/update', retweet, function(err, data, response) {
				if (typeof callback === 'function')
					callback(err, data, response);
			});
		});
	}

	/**
	 * Permet de lancer le bot Twitter
	 * Récupère les derniers tweets du compte et répond aux expéditeurs de ces tweets
	 */
	run() {
		let _this = this;

		this._refDate = new Date();

		this.setRemaining(function() {
			setInterval(function() {
				log('appel ressource statuses/mentions_timeline restant : ' + _this._remaining);

				if (_this._getTweetsInProgress === false) {
					if (_this._remaining > 0)
						_this.getTweets(_onTweets);
					else
						_this.setRemaining(function() {
							if (_this._remaining > 0)
								_this.getTweets(_onTweets);
						});
				}
			}, TwitterBot.TIMER);
		});

		/**
		 * Gère le retour de la récupération des tweets
		 * @param  {Object} err      Erreur retournée par l'API de Twitter
		 * @param  {Object} data     Données retournées par l'API de Twitter
		 * @param  {Object} response Réponse retournée par l'API de Twitter
		 */
		function _onTweets(err, data, response) {
			if (typeof err === 'undefined') {
				for (let tweet of data) {
					if (_isNewTweet(tweet))
						_this.retweet(tweet, _afterRetweet);
				}
			}

			_this._remaining--;
		}

		/**
		 * Gère le retour de l'envoi d'un tweet
		 * @param  {Object} err      Erreur retournée par l'API de Twitter
		 * @param  {Object} data     Données retournées par l'API de Twitter
		 * @param  {Object} response Réponse retournée par l'API de Twitter
		 */
		function _afterRetweet(err, data, response) {
			if (typeof err === 'undefined') {
				TwitterBot.RETWEETED++;

				log('retweet : ' + data.text);
				log('TwitterBot.RETWEETED = ' + TwitterBot.RETWEETED);
			} else {
				log('retweet failed');
				log(err);
			}
		}

		/**
		 * Détermine si le tweet est un nouveau tweet
		 * @param  {Object}  tweet Objet tweet retourné par l'API de Twitter
		 * @return {Boolean}       true si tweet est un nouveau tweet et false sinon
		 */
		function _isNewTweet(tweet) {
			return _this._refDate <= new Date(tweet.created_at) && _this._retweets.indexOf(tweet.id_str) == -1;
		}
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