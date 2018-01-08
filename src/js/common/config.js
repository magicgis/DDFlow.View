jQuery.extend({
    config: {
        version: "pro",
        pro: {
            apis: {
                process: "http://10.0.1.95:9009/api/",
                form: "http://10.0.1.95:9008/api/",
                object: "http://10.0.1.95:9007/api/",
            }
        },
        dev: {
            apis: {
                process: "http://localhost:9009/api/",
                form: "http://localhost:9008/api/",
                object: "http://localhost:9007/api/",
            }
        },
    },
    getConfig: function () {
        return $.config[$.config.version];
    }
});

jQuery.extend({
    ajaxEx: function (url, type, params, success, error) {
        return jQuery.ajax({
            url: url,
            type: "GET" || type,
            dataType: "json",
            cache: false,
            data: {} || params,
            contentType: "application/json",
            async: false,
            global: false,
            success: success,
            error: error,
            "throws": true
        });
    }
})();