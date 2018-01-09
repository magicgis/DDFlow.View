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
      url: $.getConfig().apis.process + "/test",
      data: JSON.stringify(data.field),
      success: function (d) {
        console.log(d);
        layui.data('application', {
          key: 'ticket'
          ,value: '1qaz7410'
        });
      }
    });

    // layer.alert(JSON.stringify(data.field), {
    //   title: '最终的提交信息'
    // })
    return false;
  });
});
