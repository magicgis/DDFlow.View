/*
登录页面js
*/
layui.use(['layer', 'form'], function () {
  var layer = layui.layer
    , form = layui.form
    , $ = layui.$;

  //监听提交
  form.on('submit(btn_login)', function (data) {
    $.ajax({
      method: "get",
      url: $.getConfig().apis.process + "/User/Login",
      data: data.field,
      success: function (d) {
        layui.data('application', {
          key: 'ticket'
          , value: d.data.token_type + " " + d.data.access_token
        });
        window.location.href="index.html";
      }
    });

    // layer.alert(JSON.stringify(data.field), {
    //   title: '最终的提交信息'
    // })
    return false;
  });
});
