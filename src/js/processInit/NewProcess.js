/*
功能：发起审批
*/
layui.use(['layer', 'table', 'element', 'laytpl'], function () {
    var element = layui.element,
        $ = layui.$, layer = layui.layer,
        InitPageDataInfo, laytpl = layui.laytpl;
    // tab点击切换事件绑定
    element.on('tab(tab-fromContent)', function (data) {
        var index = data.index;
        var allTab = $(data.elem);
        var selectedTab = allTab.find("li")[index];
        var tabName = $(selectedTab).attr("data-name");
        //content显示切换
        showTabContent(allTab, tabName);
    });

    //页面初始化--start
    $(function () {
        pageInit();
        bindEvent();
    });
    //页面初始化--end

    //tab-content切换--start
    function showTabContent(allTab, tabName) {
        $("div.layui-tab-content div").hide();
        $("#div-" + tabName).show();
    }
    //tab-content切换--end

    // 页面初始化 --start
    function pageInit() {
        var processModelGuid = $.GetUrlParam("processGuid");
        var bizGuid = $.GetUrlParam("bizGuid");
        $.ajax({
            url: $.getConfig().apis.process + '/Process/InitProcess/' + processModelGuid,
            method: 'post',
            data: JSON.stringify({
                processGuid: processModelGuid,
                bizGuid: bizGuid
            }),
            success: function (data) {
                InitPageDataInfo = data.data;
                $("input[name=processName]").val(InitPageDataInfo.processName);
                formInit(InitPageDataInfo.processGuid, InitPageDataInfo.bizGuid, InitPageDataInfo.stepInfo.editDomain);
                processRecordInit(InitPageDataInfo.processGuid);
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                console.log(errorThrown);
            },
        });
    }
    // 页面初始化 --end

    // 表单区域初始化 --start
    function formInit(processGuid, bizGuid, EditDomain) {
        wfutil.formInit(processGuid, bizGuid, EditDomain);
    }
    // 表单区域初始化 --end

    // 按钮组事件绑定
    function bindEvent() {
        $(".layui-btn-group button").on("click", function (e) {
            var btn = $(this);
            switch (btn.attr("data-name")) {
                case "btn-init":
                    oprInit();
                    break;
            }
        });
    }
    //发起按钮事件
    function oprInit() {
        var domain = wfutil.getformjson();
        getRoute(InitPageDataInfo.processGuid, '00000000-0000-0000-0000-000000000000');
    }
    //获取stepPathInfo
    function getRoute(processGuid, stepGuid) {
        $.ajax({
            url: $.getConfig().apis.process + '/Process/GetRoute',
            method: 'post',
            data: JSON.stringify({
                ProcessId: processGuid,
                StepId: stepGuid,
                domainJson: wfutil.getformjson(),
            }),
            success: function (data) {
                laytpl(div_stepPathInfo.innerHTML).render(data.data, function (html) {
                    layer.open({
                        type: 1,
                        title: '请确认流程路径',
                        area: ['800px', '500px'],
                        content: html,
                    });
                });
                initEvent();
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                console.log(errorThrown);
            },
        });
    }
    //注册事件和必填验证
    function initEvent() {
        validate();
        $(".stepClick").on("click", function () {
            NextStep(this);
        });
        var $btnSubmitStep = $("#btnSubmitStep");
        if ($btnSubmitStep.length <= 0) return;
        $btnSubmitStep.click(function () {
            var steps = [];
            var processGuid = $("#dataStep_processGuid").attr("data-id");
            var processName = $("input[name=processName]").val();//流程标题
            var handleText = $("input[name=handle-text]").val();//意见
            var isVailt = true;
            $(".branch-name").each(function (k, item) {
                var $that = $(this);
                var auditors = [];//审批人
                var stepGuid = $that.attr("data-value");
                var stepText = $that.text();
                var id = $that.attr("id");
                if (stepGuid && stepGuid.length > 0) {

                    //开始找所选的审批人
                    var $branchcount = $($that).closest(".branch-r");
                    var filterClass = '.user' + stepGuid;
                    var $userControl = $branchcount.find(filterClass).first();
                    var isMulti = $userControl.attr("data-isMulti");//审批人选取方式，单选，多选，不用选
                    isMulti = isMulti == undefined ? "999" : isMulti;
                    if (isMulti == "1") {
                        var checkboxs = $userControl.find("input[type=checkbox]:checked");
                        if (checkboxs.length == 0) {
                            isVailt = false;
                            tipClass(stepText);

                            return false;

                        }
                        checkboxs.each(function (i, item) {
                            auditors.push(
                                {
                                    auditorGuid: $.trim($(this).attr("data-value")),
                                    auditorName: $.trim($(this).attr("data-name"))
                                })
                        })
                    } else if (isMulti == "0") {
                        var $radio = $userControl.find("input[type=radio]:checked");
                        if ($radio.length == 0) {
                            tipClass(stepText);
                            isVailt = false;
                            return false;
                        }
                        //单选了
                        auditors.push(
                            {
                                auditorGuid: $.trim($radio.attr("data-value")),
                                auditorName: $.trim($radio.attr("data-name"))
                            })
                    }
                    else {
                        var $label = $($userControl.find("label")[1]);
                        auditors.push(
                            {
                                auditorGuid: $.trim($label.attr("data-value")),
                                auditorName: $.trim($label.text())
                            })
                    }
                    steps.push({
                        stepGuid: stepGuid,
                        auditors: auditors
                    })
                } else {
                    tip(id);
                    isVailt = false;
                    return false;
                }
            });
            if (isVailt) {
                var submitJson =
                    {
                        processGuid: processGuid,
                        processName: processName,
                        handleText: handleText,
                        steps: steps,
                        domainJson: wfutil.getformjson(InitPageDataInfo.stepInfo.editDomain),
                    };
                Submit(submitJson);
            }
        })
    }
    //步骤对应选人提示框
    function tipClass(name) {
        layer.msg(name + ':步骤未选审批人', {
            offset: 't',
            anim: 6
        });
    }
    function tip(id) {
        layer.tips('请选步骤', '#' + id, {
            tips: 2
        });
    }
    //添加必填验证提示
    function addError(ev) {
        if ($(ev).val() == '') {
            $(ev).addClass("error").after('<label id="flowtitle-error" class="error" for="flowtitle">这是必填字段</label>');
        }
    }
    //开启验证
    function validate() {
        $("input,textarea").filter(function (i, item) {
            var that = this;
            if ($(that).attr("required")) {
                $(that).blur(function () {
                    if ($(that).val() != '') {
                        $(that).next("label").remove();
                        $(that).removeClass("error");
                    } else {
                        addError("#" + that.id);
                    }
                })
            }
        })
    }
    //点击步骤，进行查询下一步
    function NextStep(e) {

        var result = [];
        var stepId = $(e).attr("data-id");

        $(e).closest(".branch-step").nextAll().remove();

        var processGuid = $("#dataStep_processGuid").attr("data-id");
        var val = $(e).val();//当前点击按钮的value
        var data_title = $(e).attr("data-title");
        var id = $(e).attr("data-id");
        $("#" + data_title).text(val).attr("data-value", id);
        $.ajax({
            url: $.getConfig().apis.process + '/Process/GetRoute',
            method: 'post',
            data: JSON.stringify({
                ProcessId: processGuid,
                StepId: stepId,
                domainJson: wfutil.getformjson(),
            }),
            success: function (data) {
                result = data.data.steps;
                //如果只有一条数据，并且relationSteps 没有数据，说明流程结束
                if (result.length == 1 && result[0].relationSteps.length == 0)
                    return;
                if (result.length > 1) {
                    result = result.splice(1);
                }

                var nextStepHtml = '';

                $.each(result, function (i, item) {
                    var title = item.stepRuteNotUnique ? '' : item.stepName;
                    var id = item.stepRuteNotUnique ? '' : item.stepGuid;
                    nextStepHtml += '<div class="branch-step nextStep">\
                        <div class="branch-r">\
                            <div class="branch-l">\
                                <div class="circle"><div class="branch-name" data-value="'+ id + '"  id="radio' + item.stepGuid + '">' + title + '</div><i class="circle-triangle"></i><span class="circle-cont"></span></div>\
                            </div>\
                            <div class="branch-cont">\
                            <div class="branch-cont-txt">';
                    //判断
                    if (item.stepRuteNotUnique) {
                        //说明有下级
                        $.each(item.relationSteps, function (j, relationSteps) {
                            nextStepHtml += '<div class="branch-list">\
                        <div class="radio">\
                            <label class="fileValue">\
                                <input type="radio" class="stepClick tip'+ item.stepGuid + '"   data-title="radio' + item.stepGuid + '"   data-name="' + relationSteps.stepName + '" data-type="' + relationSteps.stepType + '" data-id="' + relationSteps.stepGuid + '" name="parent' + item.stepGuid + '"   value="' + relationSteps.stepName + '">\
                            '+ relationSteps.stepName + '\
                            </label>\
                         </div>';
                            var isMulti = relationSteps.isMulti == null ? 999 : relationSteps.isMulti
                            nextStepHtml += '<ul data-isMulti="' + isMulti + '" class="user' + relationSteps.stepGuid + '">';
                            $.each(relationSteps.auditors, function (k, auditors) {
                                nextStepHtml += '<li><label data-isMulti="' + relationSteps.isMulti + '">';
                                if (relationSteps.isMulti == "1")
                                    nextStepHtml += ' <input type="checkbox" data-parent="' + relationSteps.stepGuid + '" data-name="' + auditors.auditorName + '" data-value="' + auditors.auditorGuid + '" class="ckb' + relationSteps.stepGuid + '"/>' + auditors.auditorName;
                                else if (relationSteps.isMulti == "0")
                                    nextStepHtml += ' <input type="radio" data-parent="' + relationSteps.stepGuid + '" name="name' + relationSteps.stepGuid + '" data-name="' + auditors.auditorName + '" data-value="' + auditors.auditorGuid + '">' + auditors.auditorName;
                                else
                                    nextStepHtml += '<label data-value="' + auditors.auditorGuid + '">' + auditors.auditorName + '</label>';

                                nextStepHtml += '</label></li>';
                            });
                            nextStepHtml += '</ul>';
                            nextStepHtml += '</div>';
                        });
                    } else {
                        var isMulti = item.isMulti == null ? 999 : item.isMulti
                        nextStepHtml += '<div class="user' + item.stepGuid + '"  data-isMulti="' + isMulti + '">';
                        var ismulti = item.isMulti == null ? 999 : item.isMulti;
                        $.each(item.auditors, function (j, user) {
                            nextStepHtml += '<label data-isMulti="' + ismulti + '">';
                            if (item.isMulti == 1)
                                nextStepHtml += ' <input type="checkbox" data-name="' + user.auditorName + '" data-value="' + user.auditorGuid + '" class="ckb' + item.stepGuid + '"/>' + user.auditorName;
                            else if (item.isMulti == 0)
                                nextStepHtml += ' <input type="radio" data-name="' + user.auditorName + '" name="user' + item.stepGuid + '"   data-value="' + user.auditorGuid + '">' + user.auditorName;
                            else
                                nextStepHtml += '<label data-value="' + user.auditorGuid + '">' + user.auditorName + '</label>';
                            nextStepHtml += '</label></li>';
                        })
                    }
                    nextStepHtml += '</div>';
                    nextStepHtml += '</div>';
                    nextStepHtml += '</div>';
                    nextStepHtml += '</div>';
                });

                $("#dataStep_processGuid").append($(nextStepHtml));
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                console.log(errorThrown);
            },
        });
    }
    //提交流程
    function Submit(data) {
        $.ajax({
            url: $.getConfig().apis.process + '/Process/CreateStepPath',
            method: 'post',
            data: JSON.stringify(data),
            success: function (result) {
                if (result && result.code == 0) {
                    window.location.href = '../processHandle/handleProcess.html?processGuid=' + result.data.processGuid + "&nodeGuid=" + result.data.nodeGuid;
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                console.log(errorThrown);
            },
        });
    }
    //审批记录 --start
    function processRecordInit(processGuid) {
        if ($("div#div-process-status").attr("isReady")) {
            return;
        }
        $.ajax({
            url: $.getConfig().apis.process + '/Process/GetApprovalRecordEx/' + processGuid,
            method: 'get',
            data: {
                processGuid: processGuid
            },
            success: function (data) {
                laytpl(tpl_processRecord.innerHTML).render(data.data.list, function (html) {
                    $("div#div-process-status").html(html);
                    $("div#div-process-status").attr("isReady", true);
                });
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                console.log(errorThrown);
            },
        });
    }
    //审批记录 --end
    //审批记录 --start
    function processRecordInit(processGuid) {
        if ($("div#div-process-status").attr("isReady")) {
            return;
        }
        $.ajax({
            url: $.getConfig().apis.process + '/Process/GetApprovalRecordEx/' + processGuid,
            method: 'get',
            data: {
                processGuid: processGuid
            },
            success: function (data) {
                laytpl(tpl_processRecord.innerHTML).render(data.data.list, function (html) {
                    $("div#div-process-status").html(html);
                    $("div#div-process-status").attr("isReady", true);
                });
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                console.log(errorThrown);
            },
        });
    }
    //审批记录 --end
});