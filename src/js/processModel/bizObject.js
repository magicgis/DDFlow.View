/**
 * 功能：业务对象
 */
layui.use(['layer', 'laytpl', 'table'], function() {
    var $ = layui.$,
        table = layui.table,
        objectTable, thisTT, layer = layui.layer;
    $(function() {
        loadTable();
        // LoadProcessList();
        InitEvent();
    });

    //加载数据列表
    function loadTable() {
        objectTable = $("#bizObjectList").DataTable({
            ajax: {
                url: $.getConfig().apis.object + '/BizObject/GetBizObjList',
                type: "post",
                data: function(d) {
                    d.page = d.start / d.length + 1;
                    d.rows = d.length;
                    return JSON.stringify(d);
                },
                dataFilter: function(data) {
                    var json = jQuery.parseJSON(data);
                    json.recordsTotal = json.data.total;
                    json.recordsFiltered = json.data.total;
                    json.data = json.data.list;
                    return JSON.stringify(json);
                }
            },
            aoColumns: [{
                    title: '序号',
                    data: null,
                    className: 'text-center',
                    render: function(data, type, row, meta) {
                        return meta.row + 1 +
                            meta.settings._iDisplayStart;
                    }
                },
                {
                    "data": "name",
                    title: "名称"
                },
                { "data": "modifiedByName", title: "编辑人" },
                {
                    "data": "modifiedOn",
                    title: "编辑时间"
                }
            ],
            processing: true,
            serverSide: true,
            info: false,
            paging: true, //分页
            ordering: true, //是否启用排序
            searching: true, //搜索
            dom: "<'row'<'col-sm-12'tr>><'row'<'col-sm-5'i><'col-sm-7'p>>",
            language: {
                search: '搜索：', //右上角的搜索文本，可以写html标签
                paginate: { //分页的样式内容。
                    previous: "上一页",
                    next: "下一页",
                    first: "第一页",
                    last: "最后"
                },
                zeroRecords: "没有找到相关内容",
                info: "共_PAGES_页，显示第_START_到第_END_条，筛选后_TOTAL_条", //左下角的信息显示，大写的词为关键字。
                infoEmpty: "0条记录", //筛选为空时左下角的显示。
                infoFiltered: "" //筛选之后的左下角筛选提示，
            },
            bAutoWidth: false,
        });
    }
    //加载数据表格
    function LoadProcessList(kindGuid, processName) {
        processTable = table.render({
            elem: '#bizObjectList',
            height: 540,
            url: $.getConfig().apis.process + '/ProcessList/GetProcessListEx',
            where: {
                conditionJson: '{"nodeStatus":1,"PageName":"mypartflow"}'
            },
            page: true, //开启分页
            limit: 15,
            limits: [15, 30, 45, 60, 75, 90],
            cols: [
                [ //表头
                    { field: 'processGuid', title: '序号', type: 'numbers', width: 40, fixed: 'left' },
                    {
                        field: 'processName',
                        title: '流程名称',
                        width: '40%',
                        sort: true,
                        fixed: 'left',
                        templet: function(d) {
                            return '<a href="../processHandle/handleProcess.html?nodeGuid=' + d.nodeGuid + '" target="_blank">' + d.processName + '</a>'
                        }
                    },
                    { field: 'ownerName', title: '发起人', width: 80, sort: true },
                    { field: 'initiateDatetime', title: '发起时间', width: 160, sort: true },
                    { field: 'stepName', title: '当前步骤', width: 100, sort: true },
                    { field: 'sysActiveDatetime', title: '到达时间', width: 160, sort: true, fixed: 'right' },
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
    }
    //页面事件绑定
    function InitEvent() {
        var form = $("#bizObject-form");
        $('#bizObjectList').on('click', 'tbody>tr', function() {
            selectRow(this);
        });
        $('#bizObjectList').on('dblclick', 'tbody>tr', function() {
            form.attr("data-type", "edit");
            selectRow(this);
            EditForm(selRowId);
        });
        $("#btnSave").on('click', function() {
            getFormData();
        });
        $("#btn_delete").on("click", function() {
            deleteRow();
        });
        // 新增弹框
        $("#btn_add").on('click', function() {
            form.attr("data-type", "add");
            EditForm();
        })
    }
    //业务对象编辑功能
    function EditForm(id) {
        reset();
        if (id != undefined && id.length > 0) {
            //说明是编辑
            loadFormData(id);
        }
        layer.open({
            type: 1,
            title: '编辑业务对象',
            area: ['820px', '400px'],
            content: $('#bizObject-form'),
            zIndex: 999
        });
    }

    function reset() {
        $("#subForm").find('input[type=text],select,input[type=hidden]').each(function() {
            $(this).val('');
        });
    }
    //删除行
    function deleteRow() {
        $.ajax({
            url: $.getConfig().apis.object + '/BizObject/DeleteBizObjDomain/' + selRowId,
            type: 'delete',
            success: function(result) {
                if (result.code == "0") {
                    layer.msg('删除成功', { time: 2000 });
                    setTimeout(function() {
                        layer.closeAll();
                    }, 2000)
                    objectTable.draw(true);
                } else {
                    layer.msg(result.message, { time: 2000 });
                }
                layer.closeAll();
            }
        })
    }
    //选中行
    function selectRow(e) {
        if ($(e).hasClass('rowselected')) {
            $(e).removeClass('rowselected');
        } else {

            $(e).closest("tbody").find("tr.rowselected").removeClass('rowselected');
            $(e).addClass('rowselected');
            var data = objectTable.row(".rowselected").data();
            if (data)
                selRowId = data.id;
        }
    }
    //点击编辑，加载实体
    function loadFormData(id) {
        $.ajax({
            url: $.getConfig().apis.object + '/BizObject/GetBizObjDomainEntity/' + id,
            type: 'get',
            success: function(result) {
                console.log(result);
                var data = result.data;
                if (data) {
                    $("#Id").val(data.id);
                    $("#Name").val(data.name);
                    $("#BeforeInitiateUrl").val(data.beforeInitiateUrl);
                    $("#AfterInitiateUrl").val(data.afterInitiateUrl);
                    $("#BeforeProcessChangeUrl").val(data.beforeProcessChangeUrl);
                    $("#AfterProcessChangeUrl").val(data.afterProcessChangeUrl);
                    loadGridDataInitiate(data.beforeInitiateUrl)
                }
            }
        })
    }
    //获取接口列表
    function loadGridDataInitiate(beforeInitiateUrl) {
        var col_ = [{
                title: '',
                target: 0,
                className: 'treegrid-control',
                width: 20,
                data: function(item) {
                    if (item.children && item.children.length) {
                        return '<span>+</span>';
                    }
                    return '';
                }
            },
            {
                "data": "name",
                target: 1,
                title: "名称"
            },
            {
                "data": "type",
                target: 2,
                title: "类型"
            }
        ]

        if (thisTT) {
            $('#tableInitiate').DataTable().destroy();
        }
        thisTT = $('#tableInitiate').DataTable({
            "ordering": false,
            'lengthChange': false,
            'searching': false,
            paging: false,
            info: false,
            columns: col_,
            ajax: {
                url: $.getConfig().apis.object + '/BizObject/GetBizObjDomainList',
                type: "post",
                data: function(d) {
                    d.hasReapter = true;
                    d.serviceURL = beforeInitiateUrl;
                    d.bizObjGuid = "00000000-0000-0000-0000-000000000000";
                    return JSON.stringify(d);
                },
                contentType: "application/json",
                dataFilter: function(data) {
                    // 返回数据
                    var json = jQuery.parseJSON(data);
                    json.data = json.data.list;
                    return JSON.stringify(json);
                }
            },
            treeGrid: {
                'left': 10,
                'expandIcon': '<span>+</span>',
                'collapseIcon': '<span>-</span>'
            }
        });

    }

    function getFormData() {
        var formJson = {};
        $(".form-horizontal").find("input").each(function(i, item) {
            formJson[$(this).attr("id")] = $(this).val();
        })
        var type = 'post';
        var url = "CreateBizObjDomain";
        var saveType = $("#bizObject-form").attr("data-type");
        if (saveType == "edit") {
            url = "EditBizObjDomain";
            type = 'put';
        }

        $.ajax({
            url: $.getConfig().apis.object + '/BizObject/' + url,
            type: type,
            data: JSON.stringify(formJson),
            contentType: 'application/json',
            success: function(result) {
                if (result.code == "0") {
                    layer.msg('保存成功', { time: 2000 });
                    setTimeout(() => {
                        layer.closeAll();
                    }, 2000)
                    objectTable.draw(true);
                } else {
                    layer.msg(result.message, { time: 2000 });
                }
                objectTable.draw(true);
                layer.closeAll();
            }
        })
    }

});