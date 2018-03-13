/**
 * 功能:流程定义详情页
 * 
 */
layui.use(['form', 'element', 'laytpl', 'treeselect'], function() {
    var form = layui.form,
        processDefinedId, dd_gooflow, element = layui.element,
        laytpl = layui.laytpl,
        treeselect = layui.treeselect,
        processModelData, bizObjDomainList;


    //页面初始化
    $(function() {
        processDefinedId = $.GetUrlParam("id");
        PageInit();
        InitEvent();
    });

    //页面初始化
    function PageInit() {
        // 根据页面状态控制tab显示逻辑
        if (!processDefinedId) {
            element.tabDelete("tab_ProcessTab", "process_form");
            element.tabDelete("tab_ProcessTab", "process_stepMap");
            element.tabDelete("tab_ProcessTab", "process_auth");
        }
        StepMapInit();

        InitProcessInfo(processDefinedId);

    }
    //绑定业务对象下拉列表
    function BandBizObject(bizObjectGuid) {
        $.ajax({
            url: $.getConfig().apis.object + "/BizObject",
            type: "get",
            success: function(data) {
                if (data.code == "0") {
                    var objList = data.data.list;
                    var strOptions = '',
                        selected = "";
                    if (objList) {
                        $.each(objList, function(n, item) {
                            selected = "";
                            if (item.id == bizObjectGuid) selected = "selected"
                            strOptions = '<option ' + selected + ' value="' + item.id + '">' + item.name + '</option>';
                            $("select[name=BusinessObjectGuid]").append(strOptions);
                        });
                    }
                    form.render("select", "processInfo");
                } else {
                    layer.msg(data.message);
                }
            }
        });
    }
    //基本信息 页面初始化
    function InitProcessInfo(processDefinedGuid) {
        if (processDefinedGuid) {
            $.ajax({
                url: $.getConfig().apis.process + "/ProcessModule/GetProcessModuleByDefinedId/" + processDefinedGuid,
                type: "get",
                data: {},
                success: function(data) {
                    if (data.code == "0") {
                        processModelData = data.data;
                        $("input[name=ProcessName]").val(processModelData.processName);
                        BandBizObject(processModelData.businessObjectGuid);
                        InitBizObjDamainList(processModelData.businessObjectGuid);
                        InitProcessWatch(processModelData);
                    } else {
                        layer.msg(data.message);
                    }
                }
            });
        }
    }
    //初始化监控人
    function InitProcessWatch(processModelData) {
        $.ajax({
            url: $.getConfig().apis.process + "/User",
            type: "get",
            data: {},
            success: function(data) {
                if (data.code == "0") {
                    treeselect({
                        elem: "#ProcessWatch",
                        data: data.data.list
                    });
                } else {
                    layer.msg(data.message);
                }
            }
        });

    }
    //事件绑定
    function InitEvent() {
        // tab点击切换事件绑定
        element.on('tab(tab-stepDesign)', function(data) {
            var that = $(this);
            var content = that.attr("data-content");
            $("form[name=form-stepDesign]").find("div.layui-row").addClass("layui-hide");
            $("form[name=form-stepDesign]").find("div[name=" + content + "]").removeClass("layui-hide");
            that.attr("isReady", true);
        });
        //步骤信息保存按钮
        form.on('submit(form-stepInfo)', function(data) {
            var stepData = data.field;
            if (stepData.canConsult == "1") {
                stepData.canConsult = 1;
            } else {
                stepData.canConsult = 0;
            }
            if (stepData.canRollBack == "1") {
                stepData.canRollBack = 1;
            } else {
                stepData.canRollBack = 0;
            }
            if (!stepData.isMulti) {
                stepData.isMulti = "0";
            }
            var editDomain = new Array();
            var hiddenDomain = new Array();
            $.each(stepData, function(n, item) {
                if (n.indexOf("domainList.") == 0) {
                    var z = n.split(".")[1];
                    if (item == "edit") editDomain.push(z);
                    if (item == "hiden") hiddenDomain.push(z);
                    delete stepData[n];
                }
            });
            stepData.editDomain = editDomain.join(',');
            stepData.hiddenDomain = hiddenDomain.join(',');
            console.log(stepData);
            dd_gooflow.setName(stepData.nodeId, stepData.stepName, "node");
            dd_gooflow.setNodeAttribute(stepData.nodeId, stepData);
            $("div.tab-stepDesign").addClass("layui-hide");
            return false;
        });
        //基本信息保存
        form.on('submit(process_info)', function(data) {
            var postData = data.field;

            var method = "post";
            if (processDefinedId) {
                method = "put";
                postData.processDefinitionGuid = processDefinedId;
            }
            console.log(data.field);
            $.ajax({
                url: $.getConfig().apis.process + "/ProcessModule",
                type: method,
                data: JSON.stringify(postData),
                success: function(data) {
                    if (data.code == "0") {
                        var moduleData = data.data;
                        window.location.href = 'processmodelform.html?id=' + moduleData.processDefinitionGuid;
                    } else {
                        layer.msg(data.message);
                    }
                }
            });
            return false;
        });

        //步骤定义
        $(document).on("click", "button[name=process_stepMap]", function() {
            var mapData = dd_gooflow.exportDataEx();
            mapData.processDefinitionGuid = processDefinedId;
            $.ajax({
                url: $.getConfig().apis.process + "/StepDesign",
                type: "put",
                data: JSON.stringify(mapData),
                success: function(data) {
                    if (data.code == "0") {
                        layer.msg("保存成功！");
                    } else {
                        layer.msg(data.message);
                    }
                }
            });
        });
        //分支条件添加
        $(document).on("click", "table[name=table_exp] a[name=add]", function(e) {
            var that = $(this);

            var thisRow = that.closest("tr")[0];
            if (thisRow.tagName != "TR") {
                return;
            }
            var newRow = $(thisRow).clone();
            $(newRow).find("select[name=exp] option").removeAttr("disabled");
            $(newRow).find("input[name=compareValue]").val("");
            $(newRow).find("div[class!=layui-btn-group]").remove();

            var table = $("table[name=table_exp]");
            table.append(newRow);

            setTimeout(function() {
                form.render("select", "form_lineInfo");
            }, 200);
            e.stopPropagation();
            return false;
        });
        //分支条件删除
        $(document).on("click", "table[name=table_exp] a[name=delete]", function(e) {
            var that = $(this);
            var rowCount = $("table[name=table_exp]").find("tr").length;
            if (rowCount == 2) {
                return;
            }
            var thisRow = that.closest("tr")[0];
            if (thisRow.tagName != "TR") {
                return;
            }
            thisRow && thisRow.remove();
            e.stopPropagation();
            return false;
        });
        //分支条件字段名称下拉列表切换
        form.on('select(select-DomainName)', function(data) {
            var select = $(data.elem);
            var selectedVal = data.value;
            var selectDom = select.find("option[value='" + selectedVal + "']")[0];
            var dataType = $(selectDom).attr("data-type");
            var expSelect = $(select.closest("tr").find("select[name=exp]")[0]);
            expSelect.find("option").removeAttr("disabled");
            if (dataType == "String") {
                expSelect.find("option[data-for='Number']").attr("disabled", "disabled");
            } else if (dataType == "Number") {
                expSelect.find("option[data-for='String']").attr("disabled", "disabled");
            }
            setTimeout(function() {
                form.render('select', "form_lineInfo");
            }, 200);

            // console.log(selectDom);
        });
        form.on('select(select-Exp)', function(data) {
            // console.log(data.elem);

        });
    }
    //加载步骤基本属性
    function ShowStepBase(stepInfo) {
        // console.log(stepInfo);
        element.tabChange("tab-stepDesign", "div-baseInfo");
        $("input[name=nodeId]").val(stepInfo.id);
        var stepGuid = stepInfo.stepDefinitionGuid;
        stepInfo.name && ($("input[name=stepName]").val(stepInfo.name));
        if (stepInfo.handleType) {
            $("select[name=handleType]").find("option[value=" + stepInfo.handleType + "]").prop("selected", true);
        } else {
            $("select[name=handleType]").find("option[value=" + stepInfo.handleType + "]").removeProp("selected");
        }
        if (stepInfo.isMulti == 1) {
            $("input[name=isMulti]").attr("checked", "checked");
        } else {
            $("input[name=isMulti]").removeAttr("checked");
        }
        stepInfo.approveAttention && ($("textarea[name=approveAttention]").val(stepInfo.approveAttention));
        stepInfo.auditorList && BandAuditor(stepInfo.auditorList);
        if (stepInfo.canRollBack == 1) {
            $("input[name=canRollBack]").attr("checked", "checked");
        } else {
            $("input[name=canRollBack]").removeAttr("checked");
        }
        if (stepInfo.canConsult == 1) {
            $("input[name=canConsult]").attr("checked", "checked");
        } else {
            $("input[name=canConsult]").removeAttr("checked");
        }
        InitStepAuth(stepInfo);
        //layui重新渲染
        form.render(null, "form-stepDesign");
        // $("div.tab-stepDesign").find("li[data-content=div-baseInfo]").click();
        $("div.tab-stepDesign").removeClass("layui-hide");
    }
    //绑定责任人
    function BandAuditor(auditList) {

    }
    //初始化业务对象列表集合
    function InitBizObjDamainList(bizObjectGuid) {
        if (bizObjDomainList) { return; }
        $.ajax({
            url: $.getConfig().apis.object + "/BizObject/GetBizObjDomainList",
            type: "post",
            data: JSON.stringify({ bizObjGuid: bizObjectGuid }),
            success: function(data) {
                if (data.code == "0") {
                    bizObjDomainList = data.data.list;
                } else {

                }
            }
        });
    }
    //加载分支调整
    function ShowLineInfo(lineInfo) {
        var data = { lineInfo: lineInfo, bizObjDomainList: bizObjDomainList };
        laytpl(tpl_stepLine.innerHTML).render(data, function(html) {
            layer.open({
                title: "编辑分支信息",
                anim: 3,
                area: ['600px', '350px'],
                content: html,
                yes: function(index, layero) {
                    var dom = $(layero);
                    var lineName = dom.find("input[name=name]").val();
                    dd_gooflow.setName(lineInfo.id, lineName, "line");
                    // var tableTr = dom.find("table tr")
                    // $.each(tableTr, function(item, n) {
                    //     var domainName = item.find("select:option");
                    // });
                    layer.close(index); //如果设定了yes回调，需进行手工关闭
                }
            });
        });
        form.render(null, "form_lineInfo");
    }

    function StepMapInit() {
        var prop = {
            toolBtns: ["start", "task", "end"],
            haveHead: false,
            headLabel: true,
            haveTool: true,
            haveDashed: true,
            haveGroup: false,
            useOperStack: true
        };
        //取代setNodeRemarks方法，采用更灵活的注释配置
        GooFlow.prototype.remarks.toolBtns = {
            cursor: "选择指针",
            direct: "实线",
            dashed: "虚线",
            start: "发起",
            end: "归档",
            task: "审批"
        };
        GooFlow.prototype.remarks.extendRight = "工作区向右扩展";
        GooFlow.prototype.remarks.extendBottom = "工作区向下扩展";
        dd_gooflow = $.createGooFlow($("#div-step-map"), prop);
        var route = "/StepDesign/GetDefaultStepMapData/";
        processDefinedId && (route = "/StepDesign/GetStepMapByProcessId/");
        dd_gooflow.loadDataAjaxEx({ type: "get", url: $.getConfig().apis.process + route + processDefinedId });
        dd_gooflow.onItemRightClick = function(id, type) {
            return false; //返回false可以阻止浏览器默认的右键菜单事件
        }
        dd_gooflow.onItemDbClick = function(id, type) {
            var Objid = id,
                Objdata;
            if (type == 'node') {
                Objdata = dd_gooflow.$nodeData[id];
                if (Objdata && (Objdata.type == "start" || Objdata.type == "end")) return;
                !Objdata.id && (Objdata.id = Objid);
                ShowStepBase(Objdata);
            } else if (type == 'line') {
                Objdata = dd_gooflow.$lineData[id];
                !Objdata.id && (Objdata.id = Objid);
                ShowLineInfo(Objdata);
            }
            return false; //返回false可以阻止原组件自带的双击直接编辑事件
        }
        dd_gooflow.onPrintClick = function() {
            dd_gooflow.print(0.8);
        }
        document.onkeydown = function(e) {
            var evtobj = window.event ? event : e;
            if (evtobj.keyCode == 90 && evtobj.ctrlKey) {
                dd_gooflow.undo(); //撤销
            }
            if (evtobj.keyCode == 89 && evtobj.ctrlKey) {
                dd_gooflow.redo(); //还原
            }
        }
    }
    //步骤表单域操作权限配置
    function InitStepAuth(stepInfo) {
        var arrayData = new Array();
        $.ajax({
            url: $.getConfig().apis.object + "/BizObject/GetBizObjDomainList",
            type: "post",
            data: JSON.stringify({ bizObjGuid: processModelData.businessObjectGuid }),
            success: function(data) {
                if (data.code == "0") {
                    var list = data.data.list;
                    var editDomain, hiddenDomain;
                    stepInfo.editDomain && (editDomain = stepInfo.editDomain.split(","));
                    stepInfo.hiddenDomain && (hiddenDomain = stepInfo.hiddenDomain.split(","));
                    $.each(list, function(n, item) {
                        var showType = "show";
                        if (editDomain && $.inArray(item.name, editDomain) >= 0) showType = "edit";
                        if (hiddenDomain && $.inArray(item.name, hiddenDomain) >= 0) showType = "hiden";
                        arrayData.push({ key: item.name, value: item.name, showType: showType });
                    });
                    laytpl(tpl_stepAuth.innerHTML).render(arrayData, function(html) {
                        $("div[name=div-formAuth]").html(html);
                        form.render('radio');
                    });
                }
            }
        });
    }
});