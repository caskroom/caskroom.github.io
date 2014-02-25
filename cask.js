document.addEventListener("DOMContentLoaded", function() {
    
    var initialUrl = location.href,
        historyCanary = false;
    
    var caskList;
    
    var request = function request(url, spanId) {
        $.ajax({
            url: url,
            type: "GET",
            success: function(data) {
                $("#" + spanId).fadeOut(250, function() {
                    $(this).text(data.length.toString()).fadeIn(250);
                });
                
                if (spanId === "n-cask") { process(data); }
            }
        });
    }

    request("https://api.github.com/repos/phinze/homebrew-cask/contents/Casks",
          "n-cask");
  
    request("https://api.github.com/repos/phinze/homebrew-cask/contributors",
          "n-contrib");
    
    $("#search-button").on("click", function(e) {
        history.pushState(null, null, "/");
        historyCanary = true;
        $("html, body").animate({ scrollTop: 0 }, 250).promise().done(function() {
            $("#landing-page").toggleClass("off-canvas");
            $("#search-page").toggleClass("off-canvas");
        });
        $("#search-input").focus();
        e.preventDefault();
    });
    
    window.addEventListener("popstate", function() {
        var fauxPop = !historyCanary && location.href === initialURL
        historyCanary = true;
        if (fauxPop) {
            return;
        } else {
            $("#landing-page").toggleClass("off-canvas");
            $("#search-page").toggleClass("off-canvas");
        }
    });
    
    var index = lunr(function() {
        this.ref("id");
        this.field("name", 10);
    });
    
    var searchTemplate = $("#search-template").html(),
        render = doT.template(searchTemplate);
    
    var process = function process(data) {
        caskList = data.map(function(raw, i) {
            return {
                id: i,
                name: raw.name.replace(/-/g, " ").substr(0, raw.name.lastIndexOf(".")) || raw.name.replace(/-/g, " "),
                rawName: raw.name.replace(/[^A-Za-z0-9]/g, "").substr(0, raw.name.lastIndexOf(".")) || raw.name.replace(/[^A-Za-z0-9]/g, "")
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
            var query = $(this).val().replace(/[^A-Za-z0-9]/g, "");
            var results = index.search(query).map(function(result) {
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
});