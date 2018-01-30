/*
全局通用js
*/
layui.use(['layer'], function () {
    var $ = layui.$;
    ajaxExtension(layui);
    var authorization = $.GetUrlParam("Authorization");
    authorization && (layui.data('application', {
        key: 'ticket'
        , value: authorization
    }));
});
/*
功能：ajax全局设置
1.请求默认启用loading
2.所有请求在headers携带ticket、device信息
TODO:3.后续需要支持参数加密传输
*/
function ajaxExtension(layui) {
    var layer = layui.layer, $ = layui.$;
    var load_index;
    var token = layui.data('application') && layui.data('application').ticket;
    var access_token = "bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IkZDOUFCMTNDOEI1MDgxNjJGRUUwRTNDRDc1M0UwODJFIiwiY2xpZW50X2lkIjoiMTAwMDAwMTYiLCJuYW1lIjoiOTAwOSIsIm5pY2tuYW1lIjoi5bqE5bCR5LicIiwicGhvbmVfbnVtYmVyIjoiMSIsImVtYWlsIjoiIiwicm9sZSI6IlVzZXIiLCJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjE1MzEiLCJhdWQiOiJhcGkiLCJleHAiOjE1MjE3NzQxNjYsIm5iZiI6MTUxNjU5MDE2Nn0.OJVRIXOaLhtGAzgXSS5RcKbUzSxjlos-nMD7hbcw0tA";
    $.ajaxSetup({
        global: false,
        type: "POST",
        contentType: 'application/json;charset=UTF-8',
        cache: false,
        headers: {
            // ticket: token,
            device: JSON.stringify(layui.device()),
            Authorization: token
        },
        beforeSend: function (e, xhr, o) {
            var authorization = (xhr.headers && xhr.headers.Authorization);
            if (!authorization) {
                window.location.href = "../../login.html";
                return;
            }
            load_index = layer.load(2);
        },
        complete: function (e, xhr, o) {
            layer.close(load_index);
            if (e.status != 200) {
                layer.msg('接口异常，请联系管理员。', { icon: 2 }, function () {
                    console.log(e);
                });
            }
        }
    });
    /*
    根据key获取url参数的值
    */
    $.extend({
        GetUrlParam: function (name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
            var r = window.location.search.substr(1).match(reg);
            if (r != null) return unescape(r[2]); return null;
        }
    });
}

