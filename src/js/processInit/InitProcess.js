/**
 * 功能：新建流程页面
 * 
 * 
 */
layui.use(['layer', 'laytpl'], function () {
	var $ = layui.$, laytpl = layui.laytpl;
	$(function () {
		LoadKindTree();
		LoadModelCard();
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

	function LoadModelCard(kindGuid, processName) {
		$.ajax({
			url: $.getConfig().apis.process + '/ProcessModule/GetProcessModuleListWithAuth',
			method: 'post',
			data: JSON.stringify({
				processKindGuid: kindGuid,
				processName: processName,
			}),
			success: function (data) {
				laytpl(tpl_processModel.innerHTML).render(data.data.list, function (html) {
					$("div.div_processModel").html(html);
				});
				InitEvent();
			},
			error: function (XMLHttpRequest, textStatus, errorThrown) {
				console.log(errorThrown);
			},
		});

	}

	//綁定事件
	function InitEvent() {
		$("ul.ul-process-card li").on("click", function () {
			var that = $(this);
			var processGuid = that.attr("data-processGuid");
			if (processGuid) {
				window.open("newProcess.html?processGuid=" + processGuid);
			}
		});
	}
});