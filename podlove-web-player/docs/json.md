# Podlove Web Player - JSON

This file specifies the JSON interface the Podlove Web player uses to create its awesome user experience.

    $("#audio1").podlovewebplayer({
        "title": "PWP001 – Lorem ipsum dolor sit amet",
		"permalink": "http://podlove.github.com/podlove-web-player/standalone.html",
		"chapters": [
			{ "start": "00:00:00.500", "title": "Chapter Two"},
			{ "start": "00:00:00.000", "title": "Chapter One"},
			{ "start": "00:00:01.500", "title": "Chapter Three"},
			{ "start": "00:00:02.000", "title": "Chapter Four"}
		],
		"summary": {
			"metadata" : "foobar"
		},
		"duration": "00:02.500"
    });

This is a more or less complete list of all available options. The more of these options are provided, the better the player will look and feel. Even though all options including the `title` are optional we recommend you to always deliver the best experience for your listeners.

## Simple Metadata

`title`: The title of the current shows episode. Its usually just a few words. (Type:string)

`permalink`: This field must contain a URL to this episode, usually a blog entry. (Type:string/URL)

`duration`: The duration of this episode. Unless the duration is given, the player cannot calculate the length of the last chapter. (Type:string/NPT)

`poster`: A URL to an image that will be displayed as this episodes poster. Often this is the logo of the show. (Type:string/URL)

`subtitle`: This field allows you to add a subtitle to your episode. Do not make this longer than a few words or a sentence. (Type:string)

## Display Options

`width`: The width of the player. Can be any valid CSS width value. (Type:string/CSS, default:"100%")

`alwaysShowHours`: Dunno, what's this? (Type:bool)

`summaryVisible`: If true, the summary is visible, initially. (Type:bool, default:false)

`timecontrolsVisible`: If set to true, the time controls are initially visible. (Type:bool, default:false)

`sharebuttonsVisible`: If set to true, the sharing buttons are initially visible. (Type:bool, default:false)

`chaptersVisible`: If set to true, the chapters are initially visible. (Type:bool, default:false)


## Chapters

Previously to version 2.0.6 the only way to hand the player the chapter information is via a long string. With PWP v2.0.6 the following style with objects was introduced. As of 2.1 the old style is deprecated.

The `chapters` property is an array containing any number of objects. Each object can have the following properties.
	
 * `title`: The current chapters title. (Type:string, mandatory)
 * `start`: The offset time for the beginning of this chapter. (Type:string/NPT, mandatory)
 * `img`: An optional cover image for this chapter. (Type:string/URL)
 * `href`: An optional URL to be associated with this chapter. This could be a link to the article you are discussing. (Type:string/URL)

## Downloads

## Summary

