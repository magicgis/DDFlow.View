//treeSelect组件
layui.define(['layer', 'tree'], function(exports) {
    "use strict";

    var _MOD = 'treeselect',
        layer = layui.layer,
        tree = layui.tree,
        $ = layui.jquery,
        hint = layui.hint(),
        THIS = 'layui-this',
        SHOW = 'layui-show',
        HIDE = 'layui-hide',
        DISABLED = 'layui-disabled',
        dom = $(document),
        win = $(window);
    var TreeSelect = function(options) {
        this.options = options;
        this.v = '1.0.0';
    };
    /**
     * 初始化下拉树选择框
     */
    TreeSelect.prototype.init = function(elem) {
        var that = this,
            TIPS = '请选择',
            CLASS = 'layui-form-select',
            TITLE = 'layui-select-title',
            NONE = 'layui-select-none',
            initValue = '',
            thatInput,
            SELVAL = "<a data-id='{selid}' href='javascript: ;'><span>{seltitle}</span><i></i></a>",
            times = new Date().getTime(),
            treeid = "selecttree_" + times,
            hide = function(e, clear) {
                if (!$(e.target).parent().hasClass(TITLE) || clear) {
                    $('.' + CLASS).removeClass(CLASS + 'ed ' + CLASS + 'up');
                    thatInput && initValue && thatInput.val(initValue);
                }
                thatInput = null;
            },
            events = function(reElem, disabled) {
                var select = $(this),
                    title = reElem.find('.' + TITLE),
                    input = title.find('input'),
                    tree = reElem.find('.layui-tree'),
                    defaultVal = elem.val();

                if (disabled) return;

                //展开下拉
                var showDown = function() {

                        var top = reElem.offset().top + reElem.outerHeight() + 5 - win.scrollTop(),
                            dlHeight = tree.outerHeight();
                        reElem.addClass(CLASS + 'ed');

                        //上下定位识别
                        if (top + dlHeight > win.height() && top >= dlHeight) {
                            reElem.addClass(CLASS + 'up');
                        }
                    },
                    hideDown = function() {
                        reElem.removeClass(CLASS + 'ed ' + CLASS + 'up');
                        input.blur();
                    };

                //点击标题区域
                title.on('click',
                    function(e) {
                        reElem.hasClass(CLASS + 'ed') ?
                            (
                                hideDown()
                            ) :
                            (
                                hide(e, true),
                                showDown()
                            );
                        tree.find('.' + NONE).remove();
                    });

                //点击箭头获取焦点
                title.find('.layui-edge').on('click',
                    function() {
                        input.focus();
                    });

                //键盘事件
                input.on('keyup',
                        function(e) {
                            var keyCode = e.keyCode;
                            //Tab键
                            if (keyCode === 9) {
                                showDown();
                            }
                        })
                    .on('keydown',
                        function(e) {
                            var keyCode = e.keyCode;
                            //Tab键
                            if (keyCode === 9) {
                                hideDown();
                            } else if (keyCode === 13) { //回车键
                                e.preventDefault();
                            }
                        });
                //渲染tree
                layui.tree({
                    check: 'checkbox',
                    elem: "#" + treeid,
                    click: function(obj) {
                        $(that.selectdiv).html(obj.name);
                        $(that.options.elem).val(obj.id);
                        alert($("#treeselecttest").val());
                        hideDown(true);
                        return false;
                    },
                    checked: function(e, item) {
                        var isSel = that.setValItem(item);
                        e.stopPropagation(); //阻止事件冒泡
                        $(e.target).parent().toggleClass("layui-form-checked");
                        if (isSel) {
                            this.$selitem = $(SELVAL.replace('{selid}', item.id).replace('{seltitle}', item.name));
                            this.$selitem.bind("click", "i", function() {
                                $(e.target).parent().toggleClass("layui-form-checked");
                                that.setValItem(item);
                            });
                            $(that.selectdiv).append(this.$selitem);
                        }
                        that.setIptVal();
                    },
                    nodes: that.options.data
                });
                //点击树箭头不隐藏
                tree.find(".layui-tree-spread").on('click', function() {
                    return false;
                });
                //关闭下拉
                $(document).off('click', hide).on('click', hide);
            }

        var othis = $(elem),
            hasRender = othis.next('.' + CLASS),
            disabled = that.disabled,
            value = othis.value,
            placeholder = othis.attr("placeholder") ? othis.attr("placeholder") : TIPS;
        if (typeof othis.attr('lay-ignore') === 'string') return othis.show();
        //隐藏原控件
        othis.hide();
        //替代元素
        var reElem = $([
            '<div class="layui-unselect ' + CLASS + (disabled ? ' layui-select-disabled' : '') + '">',
            '<div class="' +
            TITLE +
            '"><div   placeholder="' +
            placeholder +
            '" value="' +
            (value ? selected.html() : '') +
            '" class="layui-input layui-input-small layui-multiselect' +
            (disabled ? (' ' + DISABLED) : '') +
            '">', '<i class="layui-edge"></i></div>', '<ul id="' + treeid + '" class="layui-anim layui-anim-upbit layui-tree"></ul>', '</div>'
        ].join(''));
        that.selectdiv = reElem.find(".layui-input");
        hasRender[0] && hasRender.remove(); //如果已经渲染，则Rerender
        othis.after(reElem);
        events.call(this, reElem, disabled);
    };
    TreeSelect.prototype.setValItem = function(item) {
        var that = this;
        var result = true;
        var arr = new Array();
        $(that.selectdiv).find("a").each(function(i, itema) {
            var data_id = $(itema).data("id");
            if (data_id == item.id) {
                $(itema).remove();
                result = false;
                return false;
            }
        })
        return result;
    }
    TreeSelect.prototype.setValue = function(val) {

            if (typeof val == "string")
                val = val.split(','); //转换数组
            var that = this;
            $(that.options.elem).next().find("ul li .layui-icon-checkbox").each(function(i, item) {
                if ($.inArray($(this).parent().data("id"), val) != -1) {

                    $(this).click();
                }
            })
        }
        /**
         * 判断是否json
         * @param {any} obj
         */
    function isJson(obj) {
        return typeof(obj) == "object" && obj.length;
    }

    //获取选中值，并且给文本框
    TreeSelect.prototype.setIptVal = function() {
            var that = this;
            var result = new Array();
            $(that.selectdiv).find("a").each(function(i, itema) {
                var data_id = $(itema).data("id");
                result.push(data_id);
            })
            $(that.options.elem).val(result.join(','));
        }
        // 导出组件
        //exports(_MOD, new TreeSelect());
        //暴露接口
    exports(_MOD, function(options, trag) {
        var $this = $(this),
            value,
            treeSelect = $this.data('treeSelect'),
            options = options = options || {};
        var elem = $(options.elem);
        if (!treeSelect) {
            $this.data('treeSelect', (treeSelect = new TreeSelect(options)));
        }
        if (typeof options === "string") {
            value = treeSelect[options](trag);
            return;
        }
        if (!elem[0])
            return hint.error('layui.treeSelect 没有找到' + options.elem + '元素');
        if (!options.data)
            return hint.error('layui.treeSelect 缺少参数 data ,data 可直接指定treedata，也可以是treedata数据url，treedata参见layui tree模块');
        if (isJson(options.data))
            treeSelect.init(elem);
        else {
            $.ajax({
                url: options.data,
                dataType: "json",
                type: !options.method ? "POST" : options.method,
                success: function(d) {
                    options.data = d;
                    treeSelect.init(elem);
                }
            });
        }
        return value;
    });
});