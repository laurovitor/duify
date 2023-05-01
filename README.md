![Duify](src/images/logo.png)

Duify
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

* __defaultFile:__ If there is a default file on the input. You can use options when you use the plugin or directly __data-default-file="url_of_your_file"__ on you DOM element (it's recommended).

```html
<input type="file" class="duify" data-default-file="url_of_your_file" />
```


* __height:__  Set the height of your duify element. For exemple you want 300px height, you have to add the attribute __data-height="300"__ on your DOM element.

```html
<input type="file" class="duify" data-height="300" />
```


* __maxFileSize:__  Set the max filesize of the uploaded document. An error will be display if the file size is bigger than the option. You can use unit like K, M and G.

```html
<input type="file" class="duify" data-max-file-size="3M" />
```


* __minWidth:__  Set the min width allowed. An error will be display if the width is smaller than the option.

```html
<input type="file" class="duify" data-min-width="400" />
```


* __maxWidth:__  Set the max width allowed. An error will be display if the width is bigger than the option.

```html
<input type="file" class="duify" data-max-width="1000" />
```


* __minHeight:__  Set the min height allowed. An error will be display if the height is smaller than the option.

```html
<input type="file" class="duify" data-min-height="400" />
```


* __maxHeight:__  Set the max height allowed. An error will be display if the height is bigger than the option.

```html
<input type="file" class="duify" data-max-height="1000" />
```


* __disabled:__  You can disable the input if you add the attr __disabled="disabled"__.

```html
<input type="file" class="duify" disabled="disabled" />
```


* __showRemove:__  You can hide the remove button if you add the attr __data-show-remove="false"__. Default: true.

```html
<input type="file" class="duify" data-show-remove="false" />
```


* __showLoader:__  You can hide the loader if you add the attr __data-show-loader="false"__. Default: true.

```html
<input type="file" class="duify" data-show-loader="false" />
```


* __showErrors:__  You can hide errors if you add the attr __data-show-loader="false"__. Default: true.

```html
<input type="file" class="duify" data-show-errors="true" />
```


* __errorsPosition:__  You can choose where you want to display the errors, overlay or outside. Default: overlay.

```html
<input type="file" class="duify" data-errors-position="outside" />
```


* __allowedFormats:__  You can allow/deny pictures formats. If you add the attr __data-allowed-formats="portrait square"__ only portrait and square picture will be allowed. Default: ['portrait', 'square', 'landscape'].

```html
<input type="file" class="duify" data-allowed-formats="portrait square" />
```


* __allowedFileExtensions:__  You can allow only some file extensions. If you add the attr __data-allowed-file-extensions="pdf png psd"__ only PDF, PNG and PSD files will be allowed. By default, everything is allowed. Default: ['*'].

```html
<input type="file" class="duify" data-allowed-file-extensions="pdf png psd" />
```


* __maxFileSizePreview:__  Set the max filesize of the previewed document (if it's an image). If the file size is bigger than the option, it will be only the file icon and disabled the preview. You can use unit like K, M and G.

```html
<input type="file" class="duify" data-max-file-size-preview="3M" />
```


* __messages:__  You can translate default messages. You just have to add an options array when you init the plugin. This messages will be replaced in the __tpl__ option.

```javascript
$('.duify').duify({
    messages: {
        'default': 'Drag and drop a file here or click',
        'replace': 'Drag and drop or click to replace',
        'remove':  'Remove',
        'error':   'Ooops, something wrong happended.'
    }
});
```


* __error:__  You can translate default errors messages. You just have to add an options array when you init the plugin. __{{ value }}__ text will be replaced by the option.

```javascript
$('.duify').duify({
    error: {
        'fileSize': 'The file size is too big ({{ value }} max).',
        'minWidth': 'The image width is too small ({{ value }}}px min).',
        'maxWidth': 'The image width is too big ({{ value }}}px max).',
        'minHeight': 'The image height is too small ({{ value }}}px min).',
        'maxHeight': 'The image height is too big ({{ value }}px max).',
        'imageFormat': 'The image format is not allowed ({{ value }} only).'
    }
});
```


* __tpl:__  You can update default template. You just have to add an options array when you init the plugin.

```javascript
$('.duify').duify({
    tpl: {
        wrap:            '<div class="duify-wrapper"></div>',
        loader:          '<div class="duify-loader"></div>',
        message:         '<div class="duify-message"><span class="file-icon" /> <p>{{ default }}</p></div>',
        preview:         '<div class="duify-preview"><span class="duify-render"></span><div class="duify-infos"><div class="duify-infos-inner"><p class="duify-infos-message">{{ replace }}</p></div></div></div>',
        filename:        '<p class="duify-filename"><span class="file-icon"></span> <span class="duify-filename-inner"></span></p>',
        clearButton:     '<button type="button" class="duify-clear">{{ remove }}</button>',
        errorLine:       '<p class="duify-error">{{ error }}</p>',
        errorsContainer: '<div class="duify-errors-container"><ul></ul></div>'
    }
});
```

## Events

* __duify.beforeClear:__  This event is called when you click on the "remove" button, just before clearing the Duify. You can access to all the Duify object properties using __element.xxxx__. See how to use it.

```javascript
var drEvent = $('.duify').duify();

drEvent.on('duify.beforeClear', function(event, element){
    return confirm("Do you really want to delete \"" + element.filename + "\" ?");
});
```


* __duify.afterClear:__  This event is called after the Duify is clear. You can access to all the Duify object properties using __element.xxxx__. See how to use it.

```javascript
var drEvent = $('.duify').duify();

drEvent.on('duify.afterClear', function(event, element){
    alert('File deleted');
});
```


* __duify.errors:__  This event is called when there is one or more error during process. See how to use it.

```javascript
var drEvent = $('.duify').duify();

drEvent.on('duify.errors', function(event, element){
    alert('Has Errors!');
});
```


* __duify.error.xxxxx:__  In addition to the event __duify.errors:__, you can bind errors events one by one. See how to use it.

```javascript
var drEvent = $('.duify').duify();

drEvent.on('duify.error.fileSize', function(event, element){
    alert('Filesize error message!');
});
drEvent.on('duify.error.minWidth', function(event, element){
    alert('Min width error message!');
});
drEvent.on('duify.error.maxWidth', function(event, element){
    alert('Max width error message!');
});
drEvent.on('duify.error.minHeight', function(event, element){
    alert('Min height error message!');
});
drEvent.on('duify.error.maxHeight', function(event, element){
    alert('Max height error message!');
});
drEvent.on('duify.error.imageFormat', function(event, element){
    alert('Image format error message!');
});
```


## Logo

[Logo by looka](https://looka.com/s/123838512) cor principal rgb(190, 49, 68)/#be3144.

> Logo colors.
> #be3144 #ffffff #d25062 #952735 #e6e6e6 #dc7986
