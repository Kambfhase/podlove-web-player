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

This is a more or less complete list of all available options.

`title`: The title of the current shows episode. (Type:string)

`permalink`: This field must contain an URL to this episode, usually a blog entry. (Type:string/URL)

`duration`: The duration of this episode. (Type:string/time)

