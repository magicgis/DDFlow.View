layui.use(['layer', 'laytpl', 'table'], function () {
    var $ = layui.$, table = layui.table, jstree, processTable;
    $(function () {
        LoadKindTree();
        LoadProcessList();
        InitEvent();
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
                jstree = $('#tree_processkind').jstree({
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
    //加载数据表格
    function LoadProcessList(kindGuid, processName) {
        processTable = table.render({
            elem: '#processList'
            , height: 540
            , url: $.getConfig().apis.process + '/ProcessList/GetProcessListEx'
            , where: {
                conditionJson: '{"nodeStatus":1,"PageName":"mypartflow"}'
            }
            , page: true //开启分页
            , limit: 15
            , limits: [15, 30, 45, 60, 75, 90]
            , cols: [[ //表头
                { field: 'processGuid', title: '序号', type: 'numbers', width: 40, fixed: 'left' },
                {
                    field: 'processName', title: '流程名称', width: '40%', sort: true, fixed: 'left', templet: function (d) {
                        return '<a href="../processHandle/handleProcess.html?nodeGuid=' + d.nodeGuid + '" target="_blank">' + d.processName + '</a>'
                    }
                },
                { field: 'ownerName', title: '发起人', width: 80, sort: true },
                { field: 'initiateDatetime', title: '发起时间', width: 160, sort: true },
                { field: 'stepName', title: '当前步骤', width: 100, sort: true },
                { field: 'sysActiveDatetime', title: '到达时间', width: 160, sort: true, fixed: 'right' },
            ]],
            request: {
                pageName: 'page',
                limitName: 'rows'
            },
            response: {
                pageName: 'current',
                limitName: 'pageSize',
                dataName: 'list',
                countName: 'total'
            },
            loading: false
        });
    }
    //绑定事件
    function InitEvent() {
        $(document).on("click", "div.table-search button", function (e) {
            var that = $(e.target);
            if (that.attr("name") != "btn_search") {
                $("div.float-r button").removeClass("layui-btn-normal").addClass("layui-btn-primary")
                    .attr("selected", false);
                that.addClass("layui-btn-normal").removeClass("layui-btn-primary")
                    .attr("selected", true);
            }
            var kindGuid = $($("#tree_processkind li[aria-selected=true]")[0]).attr("id");
            var postData = {};
            postData.ProcessName = $("input[name=txt_processName]").val();
            postData.PageName = "mypartflow";
            postData.nodeStatus = $("div.float-r button[selected]").attr("data-status");
            postData.kindGuid = kindGuid;
            //表格reload
            processTable.reload({
                where: {
                    conditionJson: JSON.stringify(postData)
                }
                , page: {
                    curr: 1 //重新从第 1 页开始
                }
            });
        });
    }
});