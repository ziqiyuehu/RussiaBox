(function(){
	
	function Tetris(){};
	
	//原型
	Tetris.prototype = {
		
		//游戏初始化方法
		init : function(opts) {
			this.width = opts && opts.width || 12;
			this.height = opts && opts.height || 10;
			this.score = 0;
			//六种初始形状
			this.shapes = [
				[{x:0,y:4},{x:0,y:5},{x:1,y:5},{x:1,y:6}],
				[{x:0,y:4},{x:0,y:5},{x:0,y:6},{x:0,y:7}],
				[{x:0,y:6},{x:1,y:6},{x:2,y:6},{x:3,y:6}],
				[{x:0,y:4},{x:0,y:5},{x:0,y:6},{x:1,y:5}],
				[{x:0,y:4},{x:0,y:5},{x:0,y:6},{x:1,y:6}],
				[{x:0,y:5},{x:0,y:6},{x:1,y:5},{x:1,y:6}]
			];
//			this.shapes = new Array();
//			this.shapes.push([{x:0,y:4},{x:0,y:5},{x:1,y:5},{x:1,y:6}]);
			//形状变换
			this.rotateShapes = {
				"0" : [
					[{x:-1,y:2},{x:0,y:1},{x:-1,y:0},{x:0,y:-1}],
					[{x:2,y:0},{x:1,y:-1},{x:0,y:0},{x:-1,y:-1}],
					[{x:0,y:-1},{x:-1,y:0},{x:0,y:1},{x:-1,y:2}],
					[{x:-1,y:-1},{x:0,y:0},{x:1,y:-1},{x:2,y:0}]
				],
				"1" : [
					[{x:-1,y:2},{x:0,y:1},{x:1,y:0},{x:2,y:-1}],
					[{x:2,y:1},{x:1,y:0},{x:0,y:-1},{x:-1,y:-2}],
					[{x:2,y:-1},{x:1,y:0},{x:0,y:1},{x:-1,y:2}],
					[{x:-1,y:-2},{x:0,y:-1},{x:1,y:0},{x:2,y:1}]
				],
				"2" : [
					[{x:2,y:1},{x:1,y:0},{x:0,y:-1},{x:-1,y:-2}],
					[{x:2,y:-1},{x:1,y:0},{x:0,y:1},{x:-1,y:2}],
					[{x:-1,y:-2},{x:0,y:-1},{x:1,y:0},{x:2,y:1}],
					[{x:-1,y:2},{x:0,y:1},{x:1,y:0},{x:2,y:-1}]
				],
				"3" : [
					[{x:-1,y:1},{x:0,y:0},{x:1,y:-1},{x:-1,y:-1}],
					[{x:1,y:1},{x:0,y:0},{x:-1,y:-1},{x:-1,y:1}],
					[{x:1,y:-1},{x:0,y:0},{x:-1,y:1},{x:1,y:1}],
					[{x:-1,y:-1},{x:0,y:0},{x:1,y:1},{x:1,y:-1}]
				],
				"4" : [
					[{x:-1,y:1},{x:0,y:0},{x:1,y:-1},{x:0,y:-2}],
					[{x:1,y:1},{x:0,y:0},{x:-1,y:-1},{x:-2,y:0}],
					[{x:1,y:-1},{x:0,y:0},{x:-1,y:1},{x:0,y:2}],
					[{x:-1,y:-1},{x:0,y:0},{x:1,y:1},{x:2,y:0}]
				],
				"5" : [
					[{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0}]
				]
			};
			this.rotateIndex = 0;
			this.copyShape = new Array();
			this.gameTimer = null;
			/*
			 * runningGameFlag
			 * 0 : 未开始
			 * 1 : 开始
			 * 2 : 暂停
			 * 3 : 结束 
			 */
			this.runningGameFlag = 0;
			this.currShape = new Array();
			this.initGameBox();
			this.initEvent();
		},
		
		//初始化游戏面板
		initGameBox : function(){
			var html = '<div id="newRow"></div>';
			for(var i=0; i<this.height; i++){
				html += this.getSingleRow();
			}
			$("#gameDesk").empty().html(html).css({width:30*this.width+"px",height:30*this.height+"px"});
			$("#gameDesk .box-row").css("width",30*this.width+"px");
		},
		
		//获取一行html
		getSingleRow : function(){
			var html = '<div class="box-row">';
			for(var j=0; j<this.width; j++){
				html += '<div class="single-box"></div>';
			}
			html += '</div>';
			return html;
		},
		
		//随机一个形状
		randomShape : function(){
			var arrayIndex = Math.floor(Math.random()*this.shapes.length);
			shape = this.shapes[arrayIndex];
			this.currShape = this.deepCopy(shape);
			debugger
			rotateShape = this.rotateShapes[arrayIndex];
			this.rotateIndex = 0;
			var returnFlag = true;
			$(".box-shape .example-row .example-cell").removeClass("box-fill");
			for(var i=0; i<4; i++){
				if($("#gameDesk .box-row:eq("+shape[i].x+") .single-box:eq("+shape[i].y+")").hasClass("box-static")){
					returnFlag = false;
					$("#gameDesk .box-row:eq("+shape[i].x+") .single-box:eq("+shape[i].y+")").addClass("box-red");
				}else{
					$("#gameDesk .box-row:eq("+shape[i].x+") .single-box:eq("+shape[i].y+")").addClass("box-fill");
					$(".box-shape .example-row:eq("+shape[i].x+") .example-cell:eq("+(shape[i].y-4)+")").addClass("box-fill");
				}
			}
			return returnFlag;
		},
		
		//左移
		moveLeft : function(){
			copyShape = this.deepCopy(shape);
			var flag = 0;
			for(var i=0; i<4; i++){
				var shapeX = copyShape[i].x;
				var shapeY = copyShape[i].y-- - 1;
				//shapeY--;copyShape[i].y--;
				if(!this.checkConflict(shapeX,shapeY)){
					flag = 2;break;
				}
			} 
			this.rewrite(flag);
		},
		
		//右移
		moveRight : function(){
			copyShape = this.deepCopy(shape);
			var flag = 0;
			for(var i=0; i<4; i++){
				var shapeX = copyShape[i].x;
				var shapeY = copyShape[i].y++ + 1;
				//shapeY++;copyShape[i].y++;
				if(!this.checkConflict(shapeX,shapeY)){
					flag = 2;break;
				}
			}
			this.rewrite(flag);
		},
		
		//下移
		moveBottom : function(){
			copyShape = this.deepCopy(shape);
			var flag = 0;
			for(var i=0; i<4; i++){
				var shapeX = copyShape[i].x++ + 1;
				var shapeY = copyShape[i].y;
				//shapeX++;copyShape[i].x++;
				if(!this.checkConflict(shapeX,shapeY)){
					flag = 1;break;
				}
			}
			this.rewrite(flag);
			return flag;
		},
		
		//旋转
		rotate : function(){
			copyShape = this.deepCopy(shape);
			var shapeTransf = rotateShape[this.rotateIndex];
			var flag = 0;
			for(var i=0; i<4; i++){
				copyShape[i].x += shapeTransf[i].x;
				copyShape[i].y += shapeTransf[i].y;
				if(!this.checkConflict(copyShape[i].x,copyShape[i].y)){
					flag = 2;break;
				}
			}
			if(flag == 0){
				$(".box-shape .example-row .example-cell").removeClass("box-fill");
				var arrX = new Array();
				var arrY = new Array();
				debugger
				for(var i=0; i<4; i++){
					this.currShape[i].x += shapeTransf[i].x;
					this.currShape[i].y += shapeTransf[i].y;
					arrX.push(this.currShape[i].x);
					arrY.push(this.currShape[i].y);
				}
				var minX = Math.min.apply(null,arrX),
					minY = Math.min.apply(null,arrY);
				for(var i=0; i<4; i++){
					$(".box-shape .example-row:eq("+(this.currShape[i].x-minX)+") .example-cell:eq("+(this.currShape[i].y-minY)+")").addClass("box-fill");
				}
				this.rotateIndex++;
				this.rotateIndex>=rotateShape.length && (this.rotateIndex = 0);
			}
			this.rewrite(flag);
		},
		
		//重绘
		rewrite : function(flag){
			if(flag==0){
				//抹掉原有的形状，填上变换后的图像
				for(var i=0; i<4; i++)
					$("#gameDesk .box-row:eq("+shape[i].x+") .single-box:eq("+shape[i].y+")").removeClass("box-fill");
				for(var i=0; i<4; i++)
					$("#gameDesk .box-row:eq("+copyShape[i].x+") .single-box:eq("+copyShape[i].y+")").addClass("box-fill");
				shape = this.deepCopy(copyShape);
			}else if(flag == 1){
				for(var i=0; i<4; i++)
					$("#gameDesk .box-row:eq("+shape[i].x+") .single-box:eq("+shape[i].y+")").removeClass("box-fill").addClass("box-static");
				this.distoryRow();
				this.startGame();
			}
		},
		
		//开始游戏
		startGame : function(){
			var _this = this;
			if(_this.runningGameFlag == 0 || _this.runningGameFlag == 2){
				_this.runningGameFlag = 1;
			}else if(_this.runningGameFlag == 1){
				_this.runningGameFlag == 2;
			}else{
				return;
			}
			var shapeFlag = true;
			if($("#gameDesk .box-row .box-fill").length == 0){
				shapeFlag = _this.randomShape();
			}
			if(shapeFlag){
				clearInterval(this.gameTimer);
				_this.gameTimer = setInterval(function(){
					var downFlag = _this.moveBottom();
					if(downFlag){
						console.log("there is bottom,can't move down again!");
						//一次方块到底部，清除定时器并重新生成形状
						clearInterval(_this.gameTimer);
						_this.startGame();
					}
				},600);
			}else{
				_this.endGame();
				alert("Game Over!");
			}
		},
		
		//检查冲突
		checkConflict : function(x,y){
			if(y<0 || y>this.width-1 || x<0 || x>this.height-1){
				return false;
			}
			if($("#gameDesk .box-row:eq("+x+") .single-box:eq("+y+")").hasClass("box-static")){
				return false;
			}
			return true;
		},
		
		//暂停游戏
		shutGame : function(){
			this.runningGameFlag = 2;
			clearInterval(this.gameTimer);
		},
		
		//结束游戏
		endGame : function(){
			this.runningGameFlag = 3;
			$("#startEndGame").val("游戏结束")
			clearInterval(this.gameTimer);
		},
		
		//摧毁排满的一行箱子
		distoryRow : function(){
			for(var i=this.height-1; i>=0; i--){
				if($("#gameDesk .box-row:eq("+i+") .box-static").length == this.width){
					//第i行所有格子去掉颜色，然后所有大于i行都下移
					$("#gameDesk .box-row:eq("+i+")").toggleClass("box-row").fadeOut().remove();
					//更新分数
					this.score += 10;
					$(".box-score span").text(this.score);
					//补全被销毁的行
					$("#newRow").after(this.getSingleRow());
					i++;
				}
			}
		},
		
		//初始化事件
		initEvent : function() {
			//切换开始和暂停游戏
			var _this = this;
			$("#startEndGame").click(function(){
				var value = $(this).val();
				if(_this.runningGameFlag == 0 || _this.runningGameFlag == 2){
					_this.startGame();
					$(this).val("暂停游戏");
				}else if(_this.runningGameFlag == 1){
					_this.shutGame();
					$(this).val("开始游戏");
				}
			})
			
			//键盘事件，控制游戏
			$(document).keydown(function(event){
				if(!_this.runningGameFlag == 3){return ;}
				switch(event.keyCode){
					case 32: $("#startEndGame").click();break;
					case 37: _this.moveLeft();break;
					case 38: _this.rotate();break;
					case 39: _this.moveRight();break;
					case 40: _this.moveBottom();break;
				}
				return false;
			})
		},
		
		//js数组深度拷贝
		deepCopy : function(o) {
		    if (o instanceof Array) {
		        var n = [];
		        for (var i = 0; i < o.length; ++i) {
		            n[i] = this.deepCopy(o[i]);
		        }
		        return n;
		
		    } else if (o instanceof Object) {
		        var n = {}
		        for (var i in o) {
		            n[i] = this.deepCopy(o[i]);
		        }
		        return n;
		    } else {
		        return o;
		    }
		}
	}
	
	window.Tetris = new Tetris();
	
})()

Tetris.init({"width":"20","height":"15"});
