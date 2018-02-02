/*
 功能：工作流业务公用js
 */
var wfutil = {
    // 收集表单数据 --start
    getformjson: function (editDomain) {
        var editArray, formJson, inputContr, selectContr, radioContr, htmlContrs = new Array();
        if (editDomain) {
            editArray = editDomain.split(',');
        }
        var form = $("div#div-form");
        inputContr = form.find("input[type=text]");
        radioContr = form.find("input[type=radio]");
        selectContr = form.find("select");
        $.map(inputContr, function (item, n) {
            var domainId = $(item).attr("id");
            if ($(item).attr("disabled") || !domainId) {
                return false;
            }
            htmlContrs.push({
                name: domainId,
                value: $(item).val()
            });
        });
        $.map(radioContr, function (item, n) {
            var domainId = $(item).attr("name");
            if ($(item).attr("disabled")) {
                return false;
            }
            var checkedRadio = form.find("input[type=radio][name=" + domainId + "]:checked:first");
            var radioData = {
                name: domainId,
                value: checkedRadio.val()
            };
            var inArray = $.grep(htmlContrs, function (item) { return item.name == domainId });
            if (checkedRadio && inArray.length == 0)
                htmlContrs.push(radioData);
        });
        $.map(selectContr, function (item, n) {
            var name=$(item).attr("id");
            if ($(item).attr("disabled")) {
                return false;
            }
            htmlContrs.push({
                name: name,
                value: $(item).find("option:selected").val()
            });
        });
        return htmlContrs;
    },
    // 收集表单数据 --end

    // 表单区域初始化 --start
    formInit: function (processGuid, bizGuid, editDomain,callBack) {
        $.ajax({
            url: $.getConfig().apis.form + '/Form/GetFormContent',
            method: 'get',
            data: {
                processGuid: processGuid,
                bizGuid: bizGuid,
                editDomain: '' || editDomain
            },
            success: function (data) {
                $("div#div-form").html(data.data.list);
                if(typeof(callBack)=="function"){
                    callBack();
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                console.log(errorThrown);
            },
        });
    },
    // 表单区域初始化 --end

    //审批记录 --start
    processRecordInit: function (laytpl, processGuid) {
        $.ajax({
            url: $.getConfig().apis.process + '/Process/GetApprovalRecordEx/' + processGuid,
            method: 'get',
            data: {
                processGuid: processGuid
            },
            success: function (data) {
                laytpl(tpl_processRecord.innerHTML).render(data.data.list, function (html) {
                    $("div#div-process-status").html(html);
                });
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                console.log(errorThrown);
            },
        });
    },
    //审批记录 --end

    //tab-content切换--start
    showTabContent: function (that, laytpl, allTab, tabName, processGuid) {
        $("div.layui-tab-content>div").hide();
        //判斷是否已經加載過
        if (!that.attr("isReady")) {
            if (tabName == "process-status") {
                this.processRecordInit(laytpl, processGuid);
            } else if (tabName == "step-map") {
                this.stepMapInit(processGuid);
            }
        }
        $("#div-" + tabName).show();
    },
    //tab-content切换--end

    //步骤定义--start
    stepMapInit: function (processGuid) {
        $("#div-step-map").html("");
        var prop = {
            toolBtns: [],
            haveHead: false,
            headLabel: false,
            haveTool: false,
            haveDashed: false,
            haveGroup: false,
            useOperStack: true
        };
        stepMap = $.createGooFlow($("#div-step-map"), prop);
        stepMap.$editable = false;
        stepMap.loadDataAjaxEx({ type: "get", url: $.getConfig().apis.process + "/Process/GetProcessMapByProcessId/" + processGuid });

    }
    //步骤定义--end
};