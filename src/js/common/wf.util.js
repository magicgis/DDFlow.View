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
        var from = $("div#div-form");
        inputContr = from.find("input[type=text]");
        radioContr = from.find("input[type=radio]");
        selectContr = from.find("select");
        $.map(inputContr, function (item, n) {
            var inputType = $(item).attr("type");
            var domainId=$(item).attr("id");
            if($(item).attr("disabled")){
                return false;
            }
            if (inputType === "text") {
                htmlContrs.push({
                    name: domainId,
                    value: $(item).val()
                });
            } else if (inputType === "radio") {
                var checkedRadio=radioContr.find("[name="+domainId+"]:checked");
            }
        });
        $.map(selectContr, function (item, n) {
            if($(item).attr("disabled")){
                return false;
            }
            htmlContrs.push({
                name: $(item).attr("id"),
                value: $(item).find("option:selected").val()
            });
        });
        return htmlContrs;
    },
    // 收集表单数据 --end
    // 表单区域初始化 --start
    formInit: function (processGuid, bizGuid, editDomain) {
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
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                console.log(errorThrown);
            },
        });
    },
    // 表单区域初始化 --end
};