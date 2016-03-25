# http://caskroom.io
The website of [Homebrew Cask](https://github.com/phinze/homebrew-cask), a command-line interface for the administration of Mac applications.

## Setup

To run the site locally:

```shell
$ git clone https://github.com/caskroom/caskroom.github.io.git
$ cd caskroom.github.io
$ bundle exec jekyll build
$ bundle exec jekyll serve
```

To use this method, please install [Jekyll](https://github.com/jekyll/jekyll). [Bundler](https://github.com/bundler/bundler) is optional, but recommended for managing Jekyll and its related gem dependencies.

The current codebase is not specific to Jekyll. You can test it with your live-reload tool of choice, or host it with a Python server:

`python -m SimpleHTTPServer` (Python 2)

`python -m http.server` (Python 3)
