layui.use(['layer', 'laytpl', 'table'], function() {
    var $ = layui.$,
        table = layui.table,
        jstree, processTable;
    $(function() {
        LoadKindTree();
        LoadProcessModelList();
        InitEvent();
    });
    //加载流程分类
    function LoadKindTree() {
        $.ajax({
            url: $.getConfig().apis.process + '/CommonKind/GetKindTreeByModuleId/ProcessModule',
            method: 'get',
            success: function(data) {
                var treeData = new Array();
                $.map(data.data.list, function(item) {
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
    //流程模版列表
    function LoadProcessModelList() {
        processTable = table.render({
            elem: '#processModelList',
            height: 540,
            url: $.getConfig().apis.process + '/ProcessModule/GetProcessModuleListEx',
            where: {
                conditionJson: ''
            },
            page: true //开启分页
                ,
            limit: 15,
            limits: [15, 30, 45, 60, 75, 90],
            cols: [
                [ //表头
                    { field: 'processGuid', title: '全选', type: 'checkbox', width: 40, fixed: 'center' },
                    { field: 'processGuid', title: '序号', type: 'numbers', width: 40, fixed: 'left' },
                    {
                        field: 'processName',
                        title: '流程名称',
                        width: '40%',
                        sort: true,
                        fixed: 'left',
                        templet: function(d) {
                            return '<a href="../processModel/processmodelform.html?id=' + d.processDefinitionGuid + '" target="_blank">' + d.processName + '</a>'
                        }
                    },
                    { field: 'processKindName', title: '所属分类', width: 180, sort: true },
                    { field: 'publisherName', title: '修改人', width: 80, sort: true },
                    { field: 'publishDateTime', title: '修改时间', width: 160, sort: true },
                    {
                        field: 'isActive',
                        title: '状态',
                        width: 80,
                        sort: true,
                        templet: function(d) {
                            if (d) {
                                return "启用";
                            } else {
                                return "禁用";
                            }
                        }
                    },
                ]
            ],
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
    };
    //
    function InitEvent() {
        $("button[name=btn_search]").on("click", function() {
            var processName = $("input[name=txt_processName]").val();
            var postData = {};
            postData.processName = processName;
            //表格reload
            processTable.reload({
                where: {
                    conditionJson: JSON.stringify(postData)
                },
                page: {
                    curr: 1 //重新从第 1 页开始
                }
            });
        });
        $(document).on("click", "button[name=btn-add]", function() {
            window.open("../processModel/processmodelform.html");
        });
    }
});