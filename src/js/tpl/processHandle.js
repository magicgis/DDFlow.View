<script id="tpl_btngroup" type="text/html">
        <div class="layui-btn-group">
                {{#  layui.each(d, function(index, item){ }}
                <button class="layui-btn layui-btn-normal" data-name="btn-{{ item.id}}" data-oprType="{{ item.id}}">{{ item.name}}</button>
              {{#  }); }}
            </div>
    </script>
<script id="tpl_processRecord" type="text/html">
    {{# layui.each(d,function(index,item){ }}
    <li class="layui-timeline-item">
            {{# if(item.status==0){ }}
                <i class="layui-icon layui-timeline-axis layui-bg-gray"></i>
            {{# } else if(item.status==1){ }}
                <i class="layui-icon layui-timeline-axis layui-bg-orange"></i>
                {{# }else{ }}
                <i class="layui-icon layui-timeline-axis layui-bg-green"></i>
            {{#} }}
            <div class="layui-timeline-content layui-text">
                <div class="record-r">
                <h3 class="layui-timeline-title">{{item.displayName}}</h3>
                <div class="record-handleInfo" style="height:{{item.children.length*30}}px">
                        {{# layui.each(item.children,function(n_index,node){ }}
                        <p class="record-auditor">{{node.displayName}} : {{node.handleText}}</p>
                        <p class="record-time"> {{node.beginDateTime}}</p>
                        {{#  }); }}
                </div>
            </div>
            </div>
        </li>
        {{#  }); }}
    </script>