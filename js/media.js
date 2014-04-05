
var methods = {
	time: function(time){
		if (time == null){
			return this.prop('currentTime');
		}

		return this.each(function(){
			var player = $(this),
				old = player.prop('currentTime'), neu;

			if ( typeof time == 'function'){
				neu = time(old);
			}

			if(+neu < 0 ){
				neu = 0;
			}

			if( this.setCurrentTime ){
				// mediaelement.js fallback
				this.setCurrentTime( neu);
			} else {
				player.prop('currentTime', neu);
			}			
		});
	},

	play: function(time){
		return this.each(function () {
			var player = $$(this);

			if( player.prop('readyState') == player.prop('HAVE_ENOUGH_DATA')){
				player.time(time);
				this.play();
			} else {
				player.one('canplay', function(){
					player.play(time);
				});
			}
		});
	},

	pause: function () {
		return this.each(function () {
			this.pause();
		});
	}
};

function $$( arg) {
	return $.extend($(arg),methods);
}

module.exports = {
	wrap: $$
};
