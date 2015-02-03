(function(exports) {
  var commitTreeURL = "https://api.github.com/repos/caskroom/homebrew-cask/commits?per_page=1";
  var isCaskFile = function isCaskfile(el) { return /^Casks\/.+\.rb/.test(el.path) };

  var indexCaskData = function indexCaskData(data) {
    var toEntry = function(el, i) {
      var caskFileName = /^Casks\/(.+).rb/.exec(el.path)[1];
      return { id: i,
               caskName: caskFileName,
               appName: caskFileName.replace(/-/g, " "),
               entryName: caskFileName.replace(/[^A-Za-z0-9]/g, ""),
               caskUrl: el.url }
    };

    var casks = data.tree.filter(isCaskFile).map(toEntry);
    return casks;
  }

  var request = function request(url) { return $.ajax({ url: url, type: "GET" })};

  var latestTreeURL = function latestTreeURL(data) {
    return "https://api.github.com/repos/caskroom/homebrew-cask/git/trees/"
            + data[0].sha
            + "?recursive=1";
  }

  var retrieveCaskData = function retrieveCaskData(cb, err) {
    request(commitTreeURL)
      .done(function (commits) {
        request(latestTreeURL(commits))
          .done(function (tree) { cb(tree) })
          .fail(function (jqXHR, _, errorThrown) { err(jqXHR, errorThrown) })})
      .fail(function (jqXHR, _, errorThrown) { err(jqXHR, errorThrown) });
  }

  exports.commitTreeURL = commitTreeURL;
  exports.contribURL = "https://api.github.com/repos/caskroom/homebrew-cask/contributors?per_page=1";
  exports.retrieveCaskData = retrieveCaskData;
  exports.isCaskFile = isCaskFile;
  exports.indexCaskData = indexCaskData;
  exports.request = request;
})(this.pre = {});
