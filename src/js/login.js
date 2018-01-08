//一般直接写在一个js文件中
layui.use(['layer', 'form'], function () {
  var layer = layui.layer
    , form = layui.form;

  layer.msg($.getConfig().apis.process);
  //监听提交
  form.on('submit(btn_login)', function (data) {
    layer.alert(JSON.stringify(data.field), {
      title: '最终的提交信息'
    })
    return false;
  });
});

// $.ajaxEx(
//   'http://www.baidu.com',
//   'get',
//   "",
//   function (d) { console.log(d) },
//   function (d) { console.log(d) },
// );