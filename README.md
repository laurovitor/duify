![DUify](src/images/logo.png)

DUify
=====

## Dependency

[jQuery](https://github.com/jquery/jquery) é necessário para fazer a mágica.

## Installation

Clone the project in your workspace

	$ git clone git@github.com:laurovitor/duify.git
	$ cd duify

Download packages

	$ npm install

Compile assets

	$ gulp build

## Compilation

	# All compilations and watch. You will have minified and not minified files.
	$ gulp

	# Dev compilation (watch & no-minification)
	$ gulp --dev

    # Prod compilation, you will have minified and not minified files
    $ gulp build

	# Prod compilation, you will have only minified files
	$ gulp build --dev

## Usage

You have to include __[dist/js/duify.js](dist/js/duify.js)__, __[dist/css/duify.css](dist/css/duify.css)__ and __dist/fonts/*__ to your project, then you just have to init the jQuery plugin like that :

```javascript
$('.duify').duify();
```

## Options

## Events

## Logo

[Logo by looka](https://looka.com/s/123838512) cor principal rgb(190, 49, 68)/#be3144.

> Logo colors.
> #be3144 #ffffff #d25062 #952735 #e6e6e6 #dc7986
