$(document).ready(function(){
        $('#search').click(function() {
			var search_text = $("input[name=Wikipedia]").val().trim()
			if (search_text === '')
				return;
			$('#search').prop('disabled', true);			
			get_wikipage(search_text);
			get_result_with_thumbnails(search_text);
			$('#search').prop('disabled', false);
        });
    }); 


function WikipediaAPIGetContent(search) {
	console.log(search);
        $.ajax({
            type: "GET",
            url: "http://en.wikipedia.org/w/api.php?action=parse&format=json&prop=text&section=0&page=" + search + "&callback=?",
            contentType: "application/json; charset=utf-8",
            async: false,
            dataType: "json",
            success: function (data, textStatus, jqXHR) {
				console.log(data);
				 

                var markup = data.parse.text["*"];
                var blurb = $('<div></div>').html(markup);

                // remove links as they will not work
                blurb.find('a').each(function () { $(this).replaceWith($(this).html()); });

                // remove any references
                blurb.find('sup').remove();

                // remove cite error
                blurb.find('.mw-ext-cite-error').remove();
                $('#pageload-result').append($(blurb).find('p'));
                $('#pageload-result').append(blurb);

            },
            error: function (errorMessage) {
                alert(errorMessage);
            }
        });
    }

function get_wikipage(search_text){	
	$.ajax({
		type: "GET",
		url: "http://en.wikipedia.org/w/api.php?action=opensearch&search=" + search_text + "&limit=1&format=json&callback=?",
		contentType: "application/json; charset=utf-8",
		async: false,
		dataType: "json",
		success: function (data, textStatus, jqXHR) {
			console.log(data);
			$.each(data, function (i, item) {
				if (i == 1) {
					$('#pageload-result').html('');
					$.each(item, function(i,e){
						if(i==0)
							WikipediaAPIGetContent(e);
					});
					
				}
			});
		},
		error: function (errorMessage) {
			alert(errorMessage);
		}
	});
}

function get_result_with_thumbnails(search_text){
	$.getJSON('https://en.wikipedia.org/w/api.php?format=json&action=query&generator=search&gsrnamespace=0&gsrlimit=10&prop=pageimages|extracts&pilimit=max&exintro&explaintext&exsentences=1&exlimit=max&gsrsearch='+ search_text +'&callback=?',function(data){
  
	$('#query-result').html('');
      for(var key in data.query.pages){
		var titleArt = data.query.pages[key].title;
		var extractArt = data.query.pages[key].extract;
		var linkArt = 'https://en.wikipedia.org/?curid=' + data.query.pages[key].pageid;
		var imgArt;

		if(data.query.pages[key].hasOwnProperty('thumbnail')){
		  imgArt = data.query.pages[key].thumbnail.source;
		} else {
		  imgArt = 'http://www.wallpaperup.com/uploads/wallpapers/2014/04/02/319530/big_thumb_e96d0c33f97706bc093572bc613cb23d.jpg';
		}

		var contentHTML = '<div class="col-md-4"><div class="box-result"><div class="bg-result"></div><a href="' +  linkArt + '" target="_blank"><div class="box-content center-block"><div class="article-thumbnail"><img src="' + imgArt + '" alt="" /></div><h1>'+ titleArt +'</h1><p>' + extractArt + '</p></div></a></div></div>';

		$('#query-result').append(contentHTML);
      }
    });
}