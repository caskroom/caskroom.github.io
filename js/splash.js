document.addEventListener("DOMContentLoaded", function() {
  var caskSpanId = "#n-cask",
      contribSpanId = "#n-contrib";

  var fadeSpan = function fadeSpan(id, content) {
    $(id).fadeOut(250, function() { $(this).text(content).fadeIn(250) });
  }

  var updateCaskCount = function updateCaskCount(data) {
    var count = data.tree.filter(pre.isCaskFile).length;
    fadeSpan(caskSpanId, count);
  }

  pre.request(pre.contribURL)
    .done(function (data, _, jqXHR) {
      var links = jqXHR.getResponseHeader("Link"),
          pageCount = links.match(/&page=(\d+)>; rel="last"/).pop();

      fadeSpan(contribSpanId, pageCount);
    })
    .fail(function () {});

  pre.retrieveCaskData(updateCaskCount, function () {});
});
