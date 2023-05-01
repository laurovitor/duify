var pluginName = "duify";

/**
 * DUify plugin
 *
 * @param {Object} element
 * @param {Array} options
 */
function DUify(element, options) {
    if (!(window.File && window.FileReader && window.FileList && window.Blob)) {
        return;
    }

    var defaults = {
        defaultFile: '',
        maxFileSize: 0,
        minWidth: 0,
        maxWidth: 0,
        minHeight: 0,
        maxHeight: 0,
        showRemove: true,
        showLoader: true,
        showErrors: true,
        errorTimeout: 3000,
        errorsPosition: 'overlay',
        imgFileExtensions: ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'],
        maxFileSizePreview: "5M",
        allowedFormats: ['portrait', 'square', 'landscape'],
        allowedFileExtensions: ['*'],
        messages: {
            'default': 'Drag and drop a file here or click',
            'replace': 'Drag and drop or click to replace',
            'remove':  'Remove',
            'error':   'Ooops, something wrong happended.'
        },
        error: {
            'fileSize': 'The file size is too big ({{ value }} max).',
            'minWidth': 'The image width is too small ({{ value }}}px min).',
            'maxWidth': 'The image width is too big ({{ value }}}px max).',
            'minHeight': 'The image height is too small ({{ value }}}px min).',
            'maxHeight': 'The image height is too big ({{ value }}px max).',
            'imageFormat': 'The image format is not allowed ({{ value }} only).',
            'fileExtension': 'The file is not allowed ({{ value }} only).'
        },
        tpl: {
            wrap:            '<div class="duify-wrapper"></div>',
            loader:          '<div class="duify-loader"></div>',
            message:         '<div class="duify-message"><span class="file-icon" /> <p>{{ default }}</p></div>',
            preview:         '<div class="duify-preview"><span class="duify-render"></span><div class="duify-infos"><div class="duify-infos-inner"><p class="duify-infos-message">{{ replace }}</p></div></div></div>',
            filename:        '<p class="duify-filename"><span class="duify-filename-inner"></span></p>',
            clearButton:     '<button type="button" class="duify-clear">{{ remove }}</button>',
            errorLine:       '<p class="duify-error">{{ error }}</p>',
            errorsContainer: '<div class="duify-errors-container"><ul></ul></div>'
        }
    };

    this.element            = element;
    this.input              = $(this.element);
    this.wrapper            = null;
    this.preview            = null;
    this.filenameWrapper    = null;
    this.settings           = $.extend(true, defaults, options, this.input.data());
    this.errorsEvent        = $.Event('duify.errors');
    this.isDisabled         = false;
    this.isInit             = false;
    this.file               = {
        object: null,
        name: null,
        size: null,
        width: null,
        height: null,
        type: null
    };

    if (!Array.isArray(this.settings.allowedFormats)) {
        this.settings.allowedFormats = this.settings.allowedFormats.split(' ');
    }

    if (!Array.isArray(this.settings.allowedFileExtensions)) {
        this.settings.allowedFileExtensions = this.settings.allowedFileExtensions.split(' ');
    }

    this.onChange     = this.onChange.bind(this);
    this.clearElement = this.clearElement.bind(this);
    this.onFileReady  = this.onFileReady.bind(this);

    this.translateMessages();
    this.createElements();
    this.setContainerSize();

    this.errorsEvent.errors = [];

    this.input.on('change', this.onChange);
}

/**
 * On change event
 */
DUify.prototype.onChange = function()
{
    this.resetPreview();
    this.readFile(this.element);
};

/**
 * Create dom elements
 */
DUify.prototype.createElements = function()
{
    this.isInit = true;
    this.input.wrap($(this.settings.tpl.wrap));
    this.wrapper = this.input.parent();

    var messageWrapper = $(this.settings.tpl.message).insertBefore(this.input);
    $(this.settings.tpl.errorLine).appendTo(messageWrapper);

    if (this.isTouchDevice() === true) {
        this.wrapper.addClass('touch-fallback');
    }

    if (this.input.attr('disabled')) {
        this.isDisabled = true;
        this.wrapper.addClass('disabled');
    }

    if (this.settings.showLoader === true) {
        this.loader = $(this.settings.tpl.loader);
        this.loader.insertBefore(this.input);
    }

    this.preview = $(this.settings.tpl.preview);
    this.preview.insertAfter(this.input);

    if (this.isDisabled === false && this.settings.showRemove === true) {
        this.clearButton = $(this.settings.tpl.clearButton);
        this.clearButton.insertAfter(this.input);
        this.clearButton.on('click', this.clearElement);
    }

    this.filenameWrapper = $(this.settings.tpl.filename);
    this.filenameWrapper.prependTo(this.preview.find('.duify-infos-inner'));

    if (this.settings.showErrors === true) {
        this.errorsContainer = $(this.settings.tpl.errorsContainer);

        if (this.settings.errorsPosition === 'outside') {
            this.errorsContainer.insertAfter(this.wrapper);
        } else {
            this.errorsContainer.insertBefore(this.input);
        }
    }

    var defaultFile = this.settings.defaultFile || '';

    if (defaultFile.trim() !== '') {
        this.file.name = this.cleanFilename(defaultFile);
        this.setPreview(this.isImage(), defaultFile);
    }
};

/**
 * Read the file using FileReader
 *
 * @param  {Object} input
 */
DUify.prototype.readFile = function(input)
{
    if (input.files && input.files[0]) {
        var reader         = new FileReader();
        var image          = new Image();
        var file           = input.files[0];
        var srcBase64      = null;
        var _this          = this;
        var eventFileReady = $.Event("duify.fileReady");

        this.clearErrors();
        this.showLoader();
        this.setFileInformations(file);
        this.errorsEvent.errors = [];
        this.checkFileSize();
		this.isFileExtensionAllowed();

        if (this.isImage() && this.file.size < this.sizeToByte(this.settings.maxFileSizePreview)) {
            this.input.on('duify.fileReady', this.onFileReady);
            reader.readAsDataURL(file);
            reader.onload = function(_file) {
                srcBase64 = _file.target.result;
                image.src = _file.target.result;
                image.onload = function() {
                    _this.setFileDimensions(this.width, this.height);
                    _this.validateImage();
                    _this.input.trigger(eventFileReady, [true, srcBase64]);
                };

            }.bind(this);
        } else {
            this.onFileReady(false);
        }
    }
};

/**
 * On file ready to show
 *
 * @param  {Event} event
 * @param  {Bool} previewable
 * @param  {String} src
 */
DUify.prototype.onFileReady = function(event, previewable, src)
{
    this.input.off('duify.fileReady', this.onFileReady);

    if (this.errorsEvent.errors.length === 0) {
        this.setPreview(previewable, src);
    } else {
        this.input.trigger(this.errorsEvent, [this]);
        for (var i = this.errorsEvent.errors.length - 1; i >= 0; i--) {
            var errorNamespace = this.errorsEvent.errors[i].namespace;
            var errorKey = errorNamespace.split('.').pop();
            this.showError(errorKey);
        }

        if (typeof this.errorsContainer !== "undefined") {
            this.errorsContainer.addClass('visible');

            var errorsContainer = this.errorsContainer;
            setTimeout(function(){ errorsContainer.removeClass('visible'); }, this.settings.errorTimeout);
        }

        this.wrapper.addClass('has-error');
        this.resetPreview();
        this.clearElement();
    }
};

/**
 * Set file informations
 *
 * @param {File} file
 */
DUify.prototype.setFileInformations = function(file)
{
    this.file.object = file;
    this.file.name   = file.name;
    this.file.size   = file.size;
    this.file.type   = file.type;
    this.file.width  = null;
    this.file.height = null;
};

/**
 * Set file dimensions
 *
 * @param {Int} width
 * @param {Int} height
 */
DUify.prototype.setFileDimensions = function(width, height)
{
    this.file.width  = width;
    this.file.height = height;
};

/**
 * Set the preview and animate it
 *
 * @param {String} src
 */
DUify.prototype.setPreview = function(previewable, src)
{
    this.wrapper.removeClass('has-error').addClass('has-preview');
    this.filenameWrapper.children('.duify-filename-inner').html(this.file.name);
    var render = this.preview.children('.duify-render');

    this.hideLoader();

    if (previewable === true) {
        var imgTag = $('<img />').attr('src', src);

        if (this.settings.height) {
            imgTag.css("max-height", this.settings.height);
        }

        imgTag.appendTo(render);
    } else {
        $('<i />').attr('class', 'duify-font-file').appendTo(render);
        $('<span class="duify-extension" />').html(this.getFileType()).appendTo(render);
    }
    this.preview.fadeIn();
};

/**
 * Reset the preview
 */
DUify.prototype.resetPreview = function()
{
    this.wrapper.removeClass('has-preview');
    var render = this.preview.children('.duify-render');
    render.find('.duify-extension').remove();
    render.find('i').remove();
    render.find('img').remove();
    this.preview.hide();
    this.hideLoader();
};

/**
 * Clean the src and get the filename
 *
 * @param  {String} src
 *
 * @return {String} filename
 */
DUify.prototype.cleanFilename = function(src)
{
    var filename = src.split('\\').pop();
    if (filename == src) {
        filename = src.split('/').pop();
    }

    return src !== "" ? filename : '';
};

/**
 * Clear the element, events are available
 */
DUify.prototype.clearElement = function()
{
    if (this.errorsEvent.errors.length === 0) {
        var eventBefore = $.Event("duify.beforeClear");
        this.input.trigger(eventBefore, [this]);

        if (eventBefore.result !== false) {
            this.resetFile();
            this.input.val('');
            this.resetPreview();

            this.input.trigger($.Event("duify.afterClear"), [this]);
        }
    } else {
        this.resetFile();
        this.input.val('');
        this.resetPreview();
    }
};

/**
 * Reset file informations
 */
DUify.prototype.resetFile = function()
{
    this.file.object = null;
    this.file.name   = null;
    this.file.size   = null;
    this.file.type   = null;
    this.file.width  = null;
    this.file.height = null;
};

/**
 * Set the container height
 */
DUify.prototype.setContainerSize = function()
{
    if (this.settings.height) {
        this.wrapper.height(this.settings.height);
    }
};

/**
 * Test if it's touch screen
 *
 * @return {Boolean}
 */
DUify.prototype.isTouchDevice = function()
{
    return (('ontouchstart' in window) ||
            (navigator.MaxTouchPoints > 0) ||
            (navigator.msMaxTouchPoints > 0));
};

/**
 * Get the file type.
 *
 * @return {String}
 */
DUify.prototype.getFileType = function()
{
    return this.file.name.split('.').pop().toLowerCase();
};

/**
 * Test if the file is an image
 *
 * @return {Boolean}
 */
DUify.prototype.isImage = function()
{
    if (this.settings.imgFileExtensions.indexOf(this.getFileType()) != "-1") {
        return true;
    }

    return false;
};

/**
* Test if the file extension is allowed
*
* @return {Boolean}
*/
DUify.prototype.isFileExtensionAllowed = function () {

	if (this.settings.allowedFileExtensions.indexOf('*') != "-1" || 
        this.settings.allowedFileExtensions.indexOf(this.getFileType()) != "-1") {
		return true;
	}
	this.pushError("fileExtension");

	return false;
};

/**
 * Translate messages if needed.
 */
DUify.prototype.translateMessages = function()
{
    for (var name in this.settings.tpl) {
        for (var key in this.settings.messages) {
            this.settings.tpl[name] = this.settings.tpl[name].replace('{{ ' + key + ' }}', this.settings.messages[key]);
        }
    }
};

/**
 * Check the limit filesize.
 */
DUify.prototype.checkFileSize = function()
{
    if (this.sizeToByte(this.settings.maxFileSize) !== 0 && this.file.size > this.sizeToByte(this.settings.maxFileSize)) {
        this.pushError("fileSize");
    }
};

/**
 * Convert filesize to byte.
 *
 * @return {Int} value
 */
DUify.prototype.sizeToByte = function(size)
{
    var value = 0;

    if (size !== 0) {
        var unit  = size.slice(-1).toUpperCase(),
            kb    = 1024,
            mb    = kb * 1024,
            gb    = mb * 1024;

        if (unit === 'K') {
            value = parseFloat(size) * kb;
        } else if (unit === 'M') {
            value = parseFloat(size) * mb;
        } else if (unit === 'G') {
            value = parseFloat(size) * gb;
        }
    }

    return value;
};

/**
 * Validate image dimensions and format
 */
DUify.prototype.validateImage = function()
{
    if (this.settings.minWidth !== 0 && this.settings.minWidth >= this.file.width) {
        this.pushError("minWidth");
    }

    if (this.settings.maxWidth !== 0 && this.settings.maxWidth <= this.file.width) {
        this.pushError("maxWidth");
    }

    if (this.settings.minHeight !== 0 && this.settings.minHeight >= this.file.height) {
        this.pushError("minHeight");
    }

    if (this.settings.maxHeight !== 0 && this.settings.maxHeight <= this.file.height) {
        this.pushError("maxHeight");
    }

    if (this.settings.allowedFormats.indexOf(this.getImageFormat()) == "-1") {
        this.pushError("imageFormat");
    }
};

/**
 * Get image format.
 *
 * @return {String}
 */
DUify.prototype.getImageFormat = function()
{
    if (this.file.width == this.file.height) {
        return "square";
    }

    if (this.file.width < this.file.height) {
        return "portrait";
    }

    if (this.file.width > this.file.height) {
        return "landscape";
    }
};

/**
* Push error
*
* @param {String} errorKey
*/
DUify.prototype.pushError = function(errorKey) {
    var e = $.Event("duify.error." + errorKey);
    this.errorsEvent.errors.push(e);
    this.input.trigger(e, [this]);
};

/**
 * Clear errors
 */
DUify.prototype.clearErrors = function()
{
    if (typeof this.errorsContainer !== "undefined") {
        this.errorsContainer.children('ul').html('');
    }
};

/**
 * Show error in DOM
 *
 * @param  {String} errorKey
 */
DUify.prototype.showError = function(errorKey)
{
    if (typeof this.errorsContainer !== "undefined") {
        this.errorsContainer.children('ul').append('<li>' + this.getError(errorKey) + '</li>');
    }
};

/**
 * Get error message
 *
 * @return  {String} message
 */
DUify.prototype.getError = function(errorKey)
{
    var error = this.settings.error[errorKey],
        value = '';

    if (errorKey === 'fileSize') {
        value = this.settings.maxFileSize;
    } else if (errorKey === 'minWidth') {
        value = this.settings.minWidth;
    } else if (errorKey === 'maxWidth') {
        value = this.settings.maxWidth;
    } else if (errorKey === 'minHeight') {
        value = this.settings.minHeight;
    } else if (errorKey === 'maxHeight') {
        value = this.settings.maxHeight;
    } else if (errorKey === 'imageFormat') {
        value = this.settings.allowedFormats.join(', ');
    } else if (errorKey === 'fileExtension') {
		value = this.settings.allowedFileExtensions.join(', ');
	}

    if (value !== '') {
        return error.replace('{{ value }}', value);
    }

    return error;
};

/**
 * Show the loader
 */
DUify.prototype.showLoader = function()
{
    if (typeof this.loader !== "undefined") {
        this.loader.show();
    }
};

/**
 * Hide the loader
 */
DUify.prototype.hideLoader = function()
{
    if (typeof this.loader !== "undefined") {
        this.loader.hide();
    }
};

/**
 * Destroy duify
 */
DUify.prototype.destroy = function()
{
    this.input.siblings().remove();
    this.input.unwrap();
    this.isInit = false;
};

/**
 * Init duify
 */
DUify.prototype.init = function()
{
    this.createElements();
};

/**
 * Test if element is init
 */
DUify.prototype.isDropified = function()
{
    return this.isInit;
};

$.fn[pluginName] = function(options) {
    this.each(function() {
        if (!$.data(this, pluginName)) {
            $.data(this, pluginName, new DUify(this, options));
        }
    });

    return this;
};

