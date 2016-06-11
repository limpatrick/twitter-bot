# twitter-bot

*Application de services web sous forme forme de "robot interactif" réalisé dans le cadre de l'UV LO10 à l'[UTT](http://www.utt.fr).*

twitter-bot est une petite application se comportant comme un robot sur Twitter répondant aux tweets de ses followers qui le mentionnent. Pour générer sa réponse, ce service est également consommateur du service MS Translator par lequel il va passer pour déterminer la langue source du message et tenter de le traduire en français avant de le retweeter à l'expéditeur du message initial.

## Version
1.0.0

## Tech

twitter-bot utilise les technologies suivantes:

* [node.js](https://nodejs.org) - plateforme logicielle évenementielle pour les applications backend
* [twit](https://www.npmjs.com/package/twit) - dépendance NPM pour communiquer avec l'API de Twitter
* [mstranslator](https://www.npmjs.com/package/mstranslator) - dépendance NPM pour communiquer avec l'API de MS Translator

## Web services

twitter-bot utilise les web services suivants:

* [Twitter](https://dev.twitter.com) - Twitter API
* [MS Translator](https://www.microsoft.com/en-us/translator/translatorapi.aspx) - Microsoft Translator API

## Installation

twitter-bot a besoin de [node.js](https://nodejs.org/) pour fonctionner (v5.9.0 utilisé).

Commencez par récupérer le projet:

```sh
$ git clone git@github.com:limpatrick/twitter-bot.git twitter-bot
$ cd twitter-bot
$ npm install
```

## Paramétrage

twitter-bot a besoin pour fonctionner de se connecter à l'API de Twitter et de MS Translator, pour cela il faut paramétrer le fichier config.js:

    config.twitter = {
    	consumer_key: '',
    	consumer_secret: '',
    	access_token: '',
    	access_token_secret: '',
    	timeout_ms: 60 * 1000
    };
    
    config.mstranslator = {
    	client_id: '',
    	client_secret: ''
    };

Une fois le paramétrage fait, vous pouvez maintenant lancer l'application:

```sh
$ node app.js
```

## API

Voir [API Docs](https://github.com/limpatrick/twitter-bot/blob/master/API.md)

License
----

MIT