// layui.use(['layer', 'table'], function () {
// 	var layer = layui.layer, $ = layui.$, table = layui.table;
// 	var table_processModel = table.render({
// 		elem: '#table-processmodel',
// 		height: 600,
// 		url: $.getConfig().apis.process + '/ProcessModule/GetProcessModuleListWithAuthEx', //数据接口
// 		 where: {
// 			processKindGuid: '',
// 			processName: ''
// 		},
// 		page: true, //开启分页
// 		cols: [[ //表头
// 			{ title: '序号', type: "numbers", width: 40 },
// 			{ field: 'processGuid', title: 'processGuid', width: 180 },
// 			{ field: 'processName', title: '模版名称', width: 380 }
// 		]],
// 		request: {
// 			pageName: 'page' //页码的参数名称，默认：page
// 			, limitName: 'rows' //每页数据量的参数名，默认：limit
// 		},
// 		response: {
// 			msgName: 'message', //状态信息的字段名称，默认：msg
// 			countName: 'statistics.total' //数据总数的字段名称，默认：count
// 			// , dataName: 'data.list'//数据列表的字段名称，默认：data
// 		}
// 	});
// });
/**
 * 功能：新建流程页面
 * 
 * 
 */
layui.use(['layer'], function () {
	var $ = layui.$;
	$(function () {
		LoadKindTree();
	});


	//加载流程分类
	function LoadKindTree() {
		$.ajax({
			url: $.getConfig().apis.process + '/CommonKind/GetKindTreeByModuleId/ProcessModule',
			method: 'get',
			success: function (data) {
				var treeData = new Array();
				$.map(data.data.list, function (item) {
					item.pId === "0" && (item.pId = "#");
					treeData.push({
						id: item.id,
						text: item.name,
						parent: item.pId
					});
				});
				$('#tree_processkind').jstree({
					'core': {
						animation: 0,
						check_callback: true,
						themes: { icons: false },
						data: treeData
					}
				});
			}
		});
	}
});