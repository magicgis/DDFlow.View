/**
 功能：流程审批
 */
layui.use(['layer', 'table', 'element', 'laytpl'], function () {
    var element = layui.element,
        $ = layui.$, layer = layui.layer,
        HandlePageDataInfo, laytpl = layui.laytpl;

    // tab点击切换事件绑定
    element.on('tab(tab-fromContent)', function (data) {
        var index = data.index;
        var allTab = $(data.elem);
        var selectedTab = allTab.find("li")[index];
        var tabName = $(selectedTab).attr("data-name");
        //content显示切换
        wfutil.showTabContent(laytpl,allTab, tabName,HandlePageDataInfo.processGuid);
    });
    //页面渲染完成后加载
    $(function () {
        PageInit();
    });

    // PageInit
    function PageInit() {
        var processGuid = $.GetUrlParam("processGuid");
        var nodeGuid = $.GetUrlParam("nodeGuid");

        $.ajax({
            url: $.getConfig().apis.process + '/Process/GetHandlePageInfo/' + nodeGuid,
            type: 'get',
            data: {},
            contentType: 'application/json',
            success: function (data) {
                HandlePageDataInfo = data.data;

                if (HandlePageDataInfo.pageStatus == "View") {//如果不是试图，隐藏 意见文本
                    $("div.div-opinion").hide();
                } else {
                    $("div.div-opinion").show();
                }
                //标题赋值
                $("input[name=processName]").val(HandlePageDataInfo.processName)
                    .attr("readonly", true);
                // 审批表单
                wfutil.formInit(HandlePageDataInfo.processGuid, HandlePageDataInfo.bizGuid, HandlePageDataInfo.stepInfo.editDomain);
                // 渲染按鈕組
                laytpl(tpl_btngroup.innerHTML).render(HandlePageDataInfo.buttonList, function (html) {
                    $("div.btn-group").html(html);
                });
                //按鈕事件綁定
                InitEvent();
            }
        });
    }

    //提交打回
    function oprReturn() {
        var toStepId = $("#FormType").attr("data-id");
        var isAgain = $("#GoAgain").is(':checked');
        var opinion = $("#Opinion").val();
        $.ajax({
            url: $.api.domain + '/Process/ProcessReturn',
            method: 'post',
            data: JSON.stringify({ ProcessId: processGuid, NodeGuid: nodeGuid, ToStepId: toStepId, HandleText: opinion, isAgain: isAgain }),
            success: function (data) {
                if (data.code == 0)
                    window.location.href = 'flowcheck.html?processGuid=' + processGuid + "&nodeGuid=" + nodeGuid;
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                console.log(errorThrown);
            },
        });
    }
    //事件綁定
    function InitEvent() {
        $("div.layui-btn-group button").on("click", function () {
            var that = $(this);
            var oprName = that.attr("data-oprType");
            if (oprName === "approve") {
                //点击同意按钮
                $.ajax({
                    url: $.getConfig().apis.process + '/Process/ProcessHandle',
                    method: 'post',
                    data: JSON.stringify({
                        ProcessGuid: HandlePageDataInfo.processGuid,
                        nodeGuid: HandlePageDataInfo.nodeInfo.nodeGuid,
                        handleText: $("input[name=handle-text]").val(),
                        domainJson: wfutil.getformjson(),
                    }),
                    success: function (data) {
                        if (data.code == 0)
                            window.location.reload();
                    },
                    error: function (XMLHttpRequest, textStatus, errorThrown) {
                        console.log(errorThrown);
                    },
                });

            }
        });
    }
});
