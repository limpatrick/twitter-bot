# TwitterBot

Voir [API twit](https://github.com/ttezel/twit#twit-api)

**Paramétres**

-   `config` **Object** Objet de configuration utilisé pour configurer Twit et Translator
    -   `config.twitter` **Object** Objet de configuration pour utiliser Twit
    -   `config.mstranslator` **Object** Objet de configuration pour utiliser Translator

## createResponseMessage

Créer le message en réponse à un tweet donné.

**Paramètres**

-   `tweet` **Object** Objet tweet retourné par l'API de Twitter
-   `callback` **Function** Fonction de callback exécuté une fois la génération de la réponse faite

## setRemaining

Permet de récupérer la limite d'utilisation de l'API de Twitter avec la ressource statuses/mentions_timeline.

**Paramètres**

-   `callback` **Function** Fonction de callback exécuté une fois la récupération de la limite effectuée

## getTweets

Permet de récupérer les tweets du compte.

**Paramètres**

-   `callback` **Function** Fonction de callback exécuté une fois la récupération des tweets effectuée

## retweet

Permet d'envoyer un tweet à l'expéditeur du tweet donné.

**Paramètres**

-   `tweet` **Object** Objet tweet initial retourné par l'API de Twitter
-   `callback` **Function** Fonction de callback exécuté une fois l'envoi du tweet effectué

## run

Permet de lancer le bot Twitter.  
Récupère les derniers tweets du compte et répond aux expéditeurs de ces tweets.

# Translator

Voir [API mstranslator](https://github.com/nanek/mstranslator/blob/master/API.md)

**Paramétres**

-   `config` **Object** Objet de configuration pour utiliser mstranslator

## detect

Permet de détecter la langue source d'un texte.

-   `text` **String** Texte à analyser
-   `callback` **Function** Fonction de callback exécuté une fois la récupération de la langue effectuée

## translate

Traduit un texte d'une langue source vers une langue choisie.

-   `from` **String** Langue source
-   `to` **String** Langue choisie
-   `text` **String** Texte à traduire
-   `callback` **Function** Fonction de callback exécuté une fois la traduction effectuée