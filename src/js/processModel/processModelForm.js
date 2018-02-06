/**
 * 功能:流程定义详情页
 * 
 */
layui.use(['form', 'element', 'laytpl'], function() {
    var form = layui.form,
        processDefinedId, dd_gooflow, element = layui.element,
        laytpl = layui.laytpl;

    //监听提交
    form.on('submit(form-stepInfo)', function(data) {
        console.log(data.field);

        layer.msg(JSON.stringify(data.field));
        dd_gooflow.setName(data.field.nodeId, data.field.stepName, "node");
        dd_gooflow.setNodeAttribute(data.field.nodeId, data.field);
        $("div.tab-stepDesign").addClass("layui-hide");
        return false;
    });
    //页面初始化
    $(function() {
        processDefinedId = $.GetUrlParam("id");
        PageInit();
        InitEvent();
    });

    //页面初始化
    function PageInit() {
        StepMapInit();
        InitStepAuth();
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
    }
    //加载步骤基本属性
    function ShowStepBase(stepInfo) {
        $("input[name=nodeId]").val(stepInfo.id);
        var stepGuid = stepInfo.stepDefinitionGuid;
        stepInfo.name && ($("input[name=stepName]").val(stepInfo.name));
        if (stepInfo.handleType) {
            $("select[name=handleType]").find("option[value=" + stepInfo.handleType + "]").prop("selected", true);
        }
        if (stepInfo.isMulti == 1) {
            $("input[name=isMulti]").prop("checked", "checked");
        } else {
            $("input[name=isMulti]").removeAttr("checked");
        }
        stepInfo.description && ($("textarea[name=ApproveAttention]").val(stepInfo.description));
        stepInfo.auditorList && BandAuditor(stepInfo.auditorList);
        if (stepInfo.canRollBack == 1) {
            $("input[name=canRollBack]").prop("checked", "checked");
        } else {
            $("input[name=canRollBack]").removeAttr("checked");
        }
        if (stepInfo.canConsult == 1) {
            $("input[name=canConsult]").prop("checked", "checked");
        } else {
            $("input[name=canConsult]").removeAttr("checked");
        }
        //layui重新渲染
        form.render();
        $("div.tab-stepDesign").find("li[data-content=div-baseInfo]").click();
        $("div.tab-stepDesign").removeClass("layui-hide");
    }
    //绑定责任人
    function BandAuditor(auditList) {

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
                //显示信息框体
                // formshow(Objdata);
                ShowStepBase(Objdata);
            } else if (type == 'line') {
                Objdata = dd_gooflow.$lineData[id];
                // lineshow(Objdata);
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

    function InitStepAuth() {
        var data = new Array();
        data.push({
            key: 1,
            value: 1
        });
        data.push({
            key: 2,
            value: 2
        });
        laytpl(tpl_stepAuth.innerHTML).render(data, function(html) {
            $("div[name=div-formAuth]").html(html);
            form.render('radio');
        });
    }
});