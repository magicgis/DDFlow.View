/*
登录页面js
*/
layui.use(['layer', 'form'], function() {
    var layer = layui.layer,
        form = layui.form,
        $ = layui.$;
    // $(document).on("click", "a[name=btn_login]", function(e) {
    //     e.stopPropagation();
    //     var data = {
    //         userCode: $("input[name=userCode]").val(),
    //         password: $("input[name=password]").val(),
    //     };
    //     $.ajax({
    //         method: "get",
    //         url: $.getConfig().apis.process + "/User/Login",
    //         data: data,
    //         success: function(d) {
    //             if (d.code == "0") {
    //                 setTimeout(function() {
    //                     layui.data('application', {
    //                         key: 'ticket',
    //                         value: d.data.token_type + " " + d.data.access_token
    //                     });
    //                     window.location.href = "index.html";
    //                 }, 500);
    //             } else {
    //                 layer.msg(d.message, { time: 2000 });
    //             }
    //         }
    //     });
    // });
    //监听提交
    form.on('submit(btn_login)', function(data) {
        $.ajax({
            method: "get",
            url: $.getConfig().apis.process + "/User/Login",
            data: data.field,
            success: function(d) {
                if (d.code == "0") {
                    setTimeout(function() {
                        layui.data('application', {
                            key: 'ticket',
                            value: d.data.token_type + " " + d.data.access_token
                        });
                        window.location.href = "index.html";
                    }, 500);
                } else {
                    layer.msg(d.message, { time: 2000 });
                }
            }
        });
        return false;
    });
});