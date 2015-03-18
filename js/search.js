document.addEventListener("DOMContentLoaded", function() {
  var initialUrl = location.href,
      queryURL = window.location.search;

  var searchFromURL = function searchFromURL(queryURL) {
    var matchQueryOnly = /^\?q=(.+)/,
        decoded = decodeURIComponent(queryURL.replace(/\+/g, " ")),
        query = matchQueryOnly.exec(decoded)[1];

    $("#search-input").val(query);

    renderResults(query);
  }

  var notifyUnavailable = function notifyUnavailable(jqXHR, errorThrown) {
    var disable = function (r, d) {
      $("#search-view").html(r(d));
      $("#search-input").prop("disabled", true);
    }

    if  (jqXHR.status === 403 && jqXHR.getResponseHeader("X-RateLimit-Remaining") <= 0) {
      var resetTime = jqXHR.getResponseHeader("X-RateLimit-Reset"),
          minutesLeft = Math.ceil((resetTime - Math.floor(Date.now() / 1000)) / 60);

      disable(renderers.searchRateLimited, { timeLeftInMinutes: minutesLeft });
    } else {
      disable(renderers.searchUnavailable);
    }
  }

  var loadCasks = function loadCasks(data) {
    caskList = pre.indexCaskData(data)
    if (queryURL) searchFromURL(queryURL);
  }

  var caskList;
  pre.retrieveCaskData(loadCasks, notifyUnavailable);

  /* Rendering */

  var renderers = { search: doT.template($("#search").html()),
                    searchPrompt: doT.template($("#search-prompt").html()),
                    searchUnavailable: doT.template($("#search-unavailable-error").html()),
                    searchRateLimited: doT.template($("#search-rate-limited-error").html()) };

  var search = function search(q) {
    var queryString = q.replace(/[^A-Za-z0-9]/g, ""),
        regexp = new RegExp(queryString, "i");

    var results = caskList.filter(function(el) { return regexp.test(el.entryName) })
    return results;
  }

  var renderResults = function renderResults(q) {
    var results = search(q);

    $("#search-view").html(renderers.search(results));
  }

  /* Input */

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
    var fieldedQuery = $(this).val();
    if (fieldedQuery < 1)
      $("#search-view").html(renderers.searchPrompt);
    else renderResults(fieldedQuery);
  }));

  $("#search-input").on("keyup keypress", function(e) {
    var key = e.keyCode || e.which;
    if (key === 13) {
      e.preventDefault();
      return false;
    }
  });
});
