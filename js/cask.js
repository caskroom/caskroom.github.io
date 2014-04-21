document.addEventListener("DOMContentLoaded", function() {
    
    /* HTML5 History API normalization */
    
    var initialUrl = location.href,
        historyCanary = false;
		var brewCasks = [];
    
    window.addEventListener("popstate", function() {
        var fauxPop = !historyCanary && location.href === initialURL;
        historyCanary = true;
        
        if (fauxPop) {
            return;
        } else {
            $("#landing-page").toggleClass("off-canvas");
            $("#search-page").toggleClass("off-canvas");
        }
    });
    
    
    /* Cask data */
    
    var caskList,
        caskSpanId = "n-cask",
        contribSpanId = "n-contrib";
    
    var contribHandler = function contribHandler(data, textStatus, jqXHR) {
        var links = jqXHR.getResponseHeader("Link"),
            pageCount = links.match(/&page=(\d+)>; rel="last"/).pop();
        
        $("#" + contribSpanId).fadeOut(250, function() {
            $(this).text(pageCount).fadeIn(250);
        });
    }
    
    var caskHandler = function caskHandler(data) {
        $("#" + caskSpanId).fadeOut(250, function() {
            $(this).text(data.length.toString()).fadeIn(250);
        });
      
        process(data);
    }
    
    var request = function request(url, handler) {
        $.ajax({
            url: url,
            type: "GET",
            success: function(data, textStatus, jqXHR) {
              handler(data, textStatus, jqXHR);
            }
        });
    }

    request("https://api.github.com/repos/phinze/homebrew-cask/contents/Casks", caskHandler);
    request("https://api.github.com/repos/phinze/homebrew-cask/contributors?per_page=1", contribHandler);
    
    
    /* Search */
    
    $("body").on("click", ".search-button", function(e) {
        history.pushState(null, null, "/");
        historyCanary = true;
        $("html, body").animate({ scrollTop: 0 }, 250).promise().done(function() {
            $("#landing-page").toggleClass("off-canvas");
            $("#search-page").toggleClass("off-canvas");
        });
        $("#search-input").focus();
        e.preventDefault();
    });
    
    var index = lunr(function() {
        this.ref("id");
        this.field("appName", 10);
        this.field("entryName", 7)
    });
   
    var searchTemplate = $("#search-template").html(),
        render = doT.template(searchTemplate);
    
    var process = function process(data) {
        caskList = data.map(function(res, i) {
            var raw = res.name.substr(0, res.name.lastIndexOf(".")) || res.name;
            return {
                id: i,
                caskName: raw,
                appName: raw.replace(/-/g, " "),
                entryName: raw.replace(/[^A-Za-z0-9]/g, ""),
                caskUrl: res.html_url
            };
        });
        
        caskList.forEach(function(item) {
            index.add(item);
        });
    };
    
    var debounce = function debounce(fn) {
        var timeout;
        
        return function () {
            var args = Array.prototype.slice.call(arguments),
                ctx = this;

            clearTimeout(timeout);
            timeout = setTimeout(function () {
                fn.apply(ctx, args);
            }, 200);
        };
    };

    $("#search-input").on("keyup", debounce(function() {
        if ($(this).val() < 1) {
            $("#search-view").html("<div class=\"search-item no-basis delta ale highlight-bg\">Search for an app.</div>");    
        } else {
            var query = $(this).val().replace(/[^A-Za-z0-9]/g, ""),
                results = index.search(query).map(function(result) {
                return caskList.filter(function(q) { return q.id === parseInt(result.ref, 10) })[0]
            });

            $("#search-view").html(render(results));
        }
    }));
  
    $("#search-input").on("keyup keypress", function(e) {
        var key = e.keyCode || e.which;
        
        if (key  === 13) {
          e.preventDefault();
          return false;
        }
    });
	
		$("#search-view").on("click", ".addScriptToBrew", function(e) {
			try{
				var script = $(this).parent().find( "code" ).text();
				if (script != '') {
					var scriptPrefix = script.indexOf( 'brew' );
					var newScript = script.substr( scriptPrefix, script.length - scriptPrefix );
					if ($("#brew-file").html().length == 0) {
						$("#brew-file").append("#!/bin/bash\n");	
					}
					if (brewCasks.indexOf(newScript) >= 0 ) {
						alert("You have already added this script");
					} else {
						brewCasks.push(newScript);
						$("#brew-file").append(newScript + "\n");
					}
				}
			
			} catch( err ) {
				alert("Sorry could not add this script");
			}
			e.preventDefault();
			return false;
		} );
	
		$("#brew-container").buildMbExtruder({
			position:"right",
			width:500,
			extruderOpacity:.8,
			textOrientation:"tb",
			onExtOpen:function(){},
			onExtContentLoad:function(){},
			onExtClose:function(){}
		});
});