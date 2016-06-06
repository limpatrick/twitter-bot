'use strict';

let MsTranslator = require('mstranslator');

/**
 * Classe Translator
 */
class Translator {
	/**
	 * Constructeur de Translator
	 * @param  {Object} config Objet de configuration utilisé pour configurer MsTranslator
	 */
	constructor(config) {
		this._mstranslator = new MsTranslator(config, true);
	}

	/**
	 * Permet de détecter la langue source d'un texte
	 * @param  {String}   text     Texte à analyser
	 * @param  {Function} callback Fonction de callback exécuté une fois la récupération de la langue effectuée
	 */
	detect(text, callback) {
		this._mstranslator.detect({
			text: text
		}, callback);
	}

	/**
	 * Traduit un texte d'une langue source vers une langue choisie
	 * @param  {String}   from     Langue source
	 * @param  {String}   to       Langue choisie
	 * @param  {String}   text     Texte à traduire
	 * @param  {Function} callback Fonction de callback exécuté une fois la traduction effectuée
	 */
	translate(from, to, text, callback) {
		this._mstranslator.translate({
			from: from,
			to: to,
			text: text
		}, function(err, textTranslated) {
			if (typeof callback === 'function') {
				let response = {
					from: from,
					to: to,
					text: text,
					translation: textTranslated
				};

				callback(err, response);
			}
		});
	}
}

module.exports = Translator;