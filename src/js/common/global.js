/*
全局通用js
*/
layui.use(['layer'], function () {
    // var layer = layui.layer;
    ajaxExtension(layui.layer);
});
/*
功能：ajax全局设置
1.请求默认启用loading
2.所有请求在headers携带ticket、device信息
TODO:3.后续需要支持参数加密传输
*/
function ajaxExtension(layer){
    var load_index;
    var token= layui.data('application') && layui.data('application').ticket;
    $.ajaxSetup({
        global: false,
        type: "POST",
        contentType: "application/json",
        cache: false,
        headers: {
            ticket: token,
            device:JSON.stringify(layui.device()),
        },
        beforeSend: function (e, xhr, o) {
            var ticket = (xhr.headers && xhr.headers.ticket);
            if (!ticket) {
                //window.location.href = "../login.html";
            }
            load_index = layer.load(2); 
        },
        complete: function (e, xhr, o) {
            layer.close(load_index);
        }
    });
}