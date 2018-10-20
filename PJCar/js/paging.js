(function($){
	$.fn.zPaging=function(options){
		console.log("Hi zPaging");
	}
})(jQuery);

$(document).ready(function(e){
	var obj={};
	$("#paging").zPaging(obj);
});