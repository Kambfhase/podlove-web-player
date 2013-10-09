# Podlove Web Player

## About

HTML5 Goodness for Podcasting

Podlove Web Player is a Podcast-optimized, HTML5-based video and audio player. It is used within a WordPress plugin but is also suitable in any HTML context.

The Podlove Web Player supports all current and previous major browser and also does captions, chapters and much more. Thanks to MediaElement.js for providing the foundation.

*NOTE:* version 3 of the player dropped support for IE8 (as it does not support media elements natively).

* [Official Site on podlove.org](http://podlove.org/podlove-web-player/)
* [WordPress Plugin Page](http://wordpress.org/plugins/podlove-web-player/)

## Building

Grunt is used for running several tasks like linting, testing, CSS-preprocessing and JS concatenation and minifying. If you want to make changes to the player you need to run 

    npm install

first.
After that package your new codebase with

    grunt build

Watch for changed styles

    sass --compass --watch sass/podlove-web-player.scss:build/css/pwp.css

## Info

Contributors: [Gerrit van Aaken](https://github.com/gerritvanaaken/), [Simon Waldherr](https://github.com/simonwaldherr/), [Frank Hase](https://github.com/Kambfhase/), [Eric Teubert](https://github.com/eteubert/) and [others](https://github.com/podlove/podlove-web-player/contributors)  
Donate: [podlove.org/donations/](http://podlove.org/donations/)  
Version: 2.0.13 ([Download](http://downloads.wordpress.org/plugin/podlove-web-player.2.0.13.zip))  
License: [BSD 2-Clause License](http://opensource.org/licenses/BSD-2-Clause)  
