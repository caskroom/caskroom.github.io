# http://caskroom.io
The website of [homebrew-cask](https://github.com/phinze/homebrew-cask), a command-line interface for the administration of Mac applications.

## Setup

To run the site locally:

```shell
$ git clone https://github.com/caskroom/caskroom.github.io.git
$ cd caskroom.github.io
$ jekyll server -w
```

The current codebase is not specific to jekyll. You can test it with your live-reload tool of choice, or simply host it with a Python server:
`python -m SimpleHTTPServer` (Python 2)
`python -m http.server` (Python 3)
