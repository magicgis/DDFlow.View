//初始化设计流程器
$.fn.FlowValidate = function () {
	//导出数据扩展方法
	//所有节点必须有进出线段
	//必须有开始结束节点（且只能为一个）
	//分流合流节点必须成对出现
	//分流合流节点必须一一对应且中间必须有且只能有一个普通节点
	//分流节点与合流节点之前的审核节点必须有且只能有一条出去和进来节点

	var _data = $(this)[0].exportDataEx();
	var _fromlines = {}, _tolines = {}, _nodes = {}, _fnodes = [], _hnodes = [], _startroundFlag = 0, _endroundFlag = 0;
	for (var i in _data.lines) {
		if (_fromlines[_data.lines[i].from] == undefined) {
			_fromlines[_data.lines[i].from] = [];
		}
		_fromlines[_data.lines[i].from].push(_data.lines[i].to);

		if (_tolines[_data.lines[i].to] == undefined) {
			_tolines[_data.lines[i].to] = [];
		}
		_tolines[_data.lines[i].to].push(_data.lines[i].from);
	}
	for (var j in _data.nodes) {
		var _node = _data.nodes[j];
		var _flag = false;
		switch (_node.type) {
			case "start":
				_startroundFlag++;
				if (_fromlines[_node.id] == undefined) {
					alert("开始节点无法流转到下一个节点");
					return -1;
				}
				break;
			case "end":
				_endroundFlag++;
				if (_tolines[_node.id] == undefined) {
					alert("无法流转到结束节点");
					return -1;
				}
				break;
			case "task":
				_flag = true;
				break;
			case "shuntnode":
				_flag = true;
				_fnodes.push(_node.id);
				break;
			case "confluencenode":
				_hnodes.push(_node.id);
				_flag = true;
				break;
			default:
				alert("节点数据异常,请重新登录下系统！");
				return -1;
		}
		if (_flag) {
			if (_tolines[_node.id] == undefined) {
				alert("【" + _node.name + "】没有进来的连接线段");
				return -1;
			}
			if (_fromlines[_node.id] == undefined) {
				alert("【" + _node.name + "】没有出去的连接线段");
				return -1;
			}
		}
		_nodes[_node.id] = _node;
	}
	if (_startroundFlag == 0) {
		alert("必须有开始节点");
		return -1;
	}

	if (_endroundFlag == 0) {
		alert("必须有结束节点");
		return -1;
	}

	for (var a in _fnodes) {
		var aNondeid = _fnodes[a];
		if (_fromlines[aNondeid].length == 1) {
			//labellingRedNode(aNondeid);

			alert("标注红色的分流节点不允许只有一条【出去】的线段");
			//dialogTop("标注红色的分流节点不允许只有一条【出去】的线段", "error");
			return -1;
		}
		var _hhnodeid = {};
		for (var b in _fromlines[aNondeid]) {
			btoNode = _fromlines[aNondeid][b];
			if (_nodes[btoNode].type == "stepnode") {
				var _nextLine = _fromlines[_nodes[btoNode].id];

				var _nextNode = _nodes[_nextLine[0]];
				if (_nextNode.type != "confluencenode") {
					//labellingRedNode(_nodes[btoNode].id);
					alert("标注红色的普通节点下一个节点必须是合流节点");
					//dialogTop("标注红色的普通节点下一个节点必须是合流节点", "error");
					return -1;
				}
				else {
					_hhnodeid[_nextLine[0]] = 0;
					if (_hhnodeid.length > 1) {
						//labellingRedNode(aNondeid);
						alert("标注红色的分流节点与之对应的合流节点只能有一个");
						//dialogTop("标注红色的分流节点与之对应的合流节点只能有一个", "error");
						return -1;
					}
					if (_tolines[_nextLine[0]].length != _fromlines[aNondeid].length) {
						//labellingRedNode(_nextLine[0]);
						alert("标注红色的合流节点与之对应的分流节点只能有一个");
						//dialogTop("标注红色的合流节点与之对应的分流节点只能有一个", "error");
						return -1;
					}
				}
				if (_nextLine.length > 1) {
					//labellingRedNode(_nodes[btoNode].id);
					alert("标注红色的节点只能有一条出去的线条【分流合流之间】");
					//dialogTop("标注红色的节点只能有一条出去的线条【分流合流之间】", "error");
					return -1;
				}
				else if (_tolines[_nodes[btoNode].id], length > 1) {
					//labellingRedNode(_nodes[btoNode].id);
					alert("标注红色的节点只能有一条进来的线条【分流合流之间】");
					//dialogTop("标注红色的节点只能有一条进来的线条【分流合流之间】", "error");
					return -1;
				}
			}
			else {
				alert("标注红色的分流节点必须经过一个普通节点到合流节点");
				//labellingRedNode(aNondeid);
				//dialogTop("标注红色的分流节点必须经过一个普通节点到合流节点", "error");
				return -1;
			}
		}

	}
	return _data;
}


