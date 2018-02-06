/*
全局通用js
*/
layui.use(['layer'], function() {
    var $ = layui.$;
    //JQuery扩展
    JQueryExtentsion();
    var authorization = $.GetUrlParam("Authorization");
    authorization && (layui.data('application', {
        key: 'ticket',
        value: "bearer " + authorization
    }));
    ajaxExtension(layui);
});
/*
功能：ajax全局设置
1.请求默认启用loading
2.所有请求在headers携带ticket、device信息
TODO:3.后续需要支持参数加密传输
*/
function ajaxExtension(layui) {
    var layer = layui.layer,
        $ = layui.$;
    var load_index;
    var token = layui.data('application') && layui.data('application').ticket;
    $.ajaxSetup({
        global: false,
        type: "POST",
        contentType: 'application/json;charset=UTF-8',
        cache: false,
        headers: {
            device: JSON.stringify(layui.device()),
            Authorization: token
        },
        beforeSend: function(e, xhr, o) {
            var authorization = (xhr.headers && xhr.headers.Authorization);
            if (!authorization) {
                window.top.location.href = "../../login.html";
                return;
            }
            load_index = layer.load(2);
        },
        complete: function(e, xhr, o) {
            layer.close(load_index);
            if (e.status != 200) {
                layer.msg('接口异常，请联系管理员。', { icon: 2 }, function() {
                    console.log(e);
                });
            }
        }
    });
}

function JQueryExtentsion() {
    /*
    根据key获取url参数的值
    */
    $.extend({
        GetUrlParam: function(name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
            var r = window.location.search.substr(1).match(reg);
            if (r != null) return unescape(r[2]);
            return null;
        }
    });
}