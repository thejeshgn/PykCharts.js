PykCharts.multiD.areaChart = function (options){
	var that = this;
	var theme = new PykCharts.Configuration.Theme({});

	this.execute = function (){
		that = new PykCharts.multiD.processInputs(that, options, "area");

		if(that.mode === "default") {
			that.k.loading();
		}
		var multiDimensionalCharts = theme.multiDimensionalCharts,
			stylesheet = theme.stylesheet,
			optional = options.optional;
	    that.enableCrossHair = options.enableCrossHair ? options.enableCrossHair : multiDimensionalCharts.enableCrossHair;
		that.curvy_lines = options.line_curvy_lines ? options.line_curvy_lines : multiDimensionalCharts.line_curvy_lines;
		that.color_from_data = options.line_color_from_data ? options.line_color_from_data : multiDimensionalCharts.line_color_from_data;
	  	that.interpolate = PykCharts.boolean(that.curvy_lines) ? "cardinal" : "linear";
		that.w = that.width - that.margin_left - that.margin_right;
		that.h = that.height - that.margin_top - that.margin_bottom;

		d3.json(options.data, function (e, data) {
			that.data = data.groupBy("area");
			that.yAxisDataFormat = options.yAxisDataFormat ? options.yAxisDataFormat : that.k.yAxisDataFormatIdentification(that.data);
    		that.xAxisDataFormat = options.xAxisDataFormat ? options.xAxisDataFormat : that.k.xAxisDataFormatIdentification(that.data);
			that.compare_data = that.data;
			that.data_length = that.data.length;
			$(that.selector+" #chart-loader").remove();
			that.render();
		});
	};

	this.render = function (){
		that.dataLineGroup = [], that.dataLineGroupBorder = [];
		that.multid = new PykCharts.multiD.configuration(that);
		that.fillColor = new PykCharts.Configuration.fillChart(that,null,options);
		if(that.mode === "default") {
			that.transitions = new PykCharts.Configuration.transition(that);
			that.fillColor = new PykCharts.Configuration.fillChart(that,null,options);

			that.k.title()
					.subtitle()
					.liveData(that)
					.makeMainDiv(options.selector,1)
					.tooltip(true,options.selector,1);

			that.optional_feature()
		    		.chartType()
					.svgContainer(1)
					.createChart()
		    		.axisContainer();

		    that.k.crossHair(that.svgContainer,that.new_data_length,that.new_data,that.fillColor);


			that.k.xAxis(that.svgContainer,that.xGroup,that.xScale,that.extra_left_margin,that.xdomain)
					.yAxis(that.svgContainer,that.yGroup,that.yScale,that.ydomain)
					.yGrid(that.svgContainer,that.group,that.yScale)
					.xGrid(that.svgContainer,that.group,that.xScale)
					.xAxisTitle(that.xGroup)
					.yAxisTitle(that.yGroup)
					.createFooter()
	                .lastUpdatedAt()
	                .credits()
	                .dataSource();
		}
		else if(that.mode === "infographics") {
			  that.k.liveData(that)
						.makeMainDiv(options.selector,1);

			  that.optional_feature()
			    		.chartType()
						.svgContainer(1)
						.createChart()
			    		.axisContainer();

		    that.k.xAxis(that.svgContainer,that.xGroup,that.xScale,that.extra_left_margin,that.xdomain)
					.yAxis(that.svgContainer,that.yGroup,that.yScale,that.ydomain)
					.xAxisTitle(that.xGroup)
					.yAxisTitle(that.yGroup);
  		}
  		that.mouseEvent = new PykCharts.Configuration.mouseEvent(that);
  		$(window).on("load", function () { return that.k.resize(that.svgContainer); })
                        .on("resize", function () { return that.k.resize(that.svgContainer); });
	};

	this.refresh = function (){
		d3.json(options.data, function (e,data) {
			that.data = data.groupBy("area");
			that.data_length = that.data.length;
			var compare = that.multid.checkChangeInData(that.data,that.compare_data);
			that.compare_data = compare[0];
			var data_changed = compare[1];

			if(data_changed) {
				that.k.lastUpdatedAt("liveData");
				that.mouseEvent.tooltipHide();
				that.mouseEvent.crossHairHide(that.type);
				that.mouseEvent.axisHighlightHide(that.selector + " .x.axis");
				that.mouseEvent.axisHighlightHide(that.selector + " .y.axis");
			}

			that.optional_feature().createChart("liveData");

			that.k.xAxis(that.svgContainer,that.xGroup,that.xScale,that.extra_left_margin,that.xdomain)
					.yAxis(that.svgContainer,that.yGroup,that.yScale,that.ydomain)
					.yGrid(that.svgContainer,that.group,that.yScale)
					.xGrid(that.svgContainer,that.group,that.xScale)
					.tooltip(true,options.selector);
		});
	};

	this.optional_feature = function (){
		var optional = {
			chartType: function () {
				for(j = 1;j < that.data_length;j++) {
					if(that.data[0].x === that.data[j].x) {
						that.type = "stackedAreaChart";
						break;
					}
				}
				that.type = that.type || "areaChart";
				return this;
			},
			svgContainer: function (i){
				$(that.selector).attr("class","PykCharts-twoD PykCharts-multi-series2D PykCharts-line-chart");
				$(options.selector).css({"background-color":that.bg,"position":"relative"});

				that.svgContainer = d3.select(options.selector+" "+"#tooltip-svg-container-"+i).append("svg:svg")
					.attr("id","svg-"+i)
					.attr("width",that.width)
					.attr("height",that.height)
					.attr("preserveAspectRatio", "xMinYMin")
                    .attr("viewBox", "0 0 " + that.width + " " + that.height);

				that.group = that.svgContainer.append("g")
					.attr("id","chartsvg")
					.attr("transform","translate("+ that.margin_left +","+ that.margin_top +")");

				if(PykCharts.boolean(that.chart_grid_yEnabled)){
					that.group.append("g")
						.attr("id","ygrid")
						.attr("class","y grid-line");
				}
				if(PykCharts.boolean(that.chart_grid_xEnabled)){
					that.group.append("g")
						.attr("id","xgrid")
						.attr("class","x grid-line");
				}

				that.clip = that.svgContainer.append("svg:clipPath")
				    .attr("id","clip" + i + that.selector)
				    .append("svg:rect")
				    .attr("width", that.w)
				    .attr("height", that.h);

				that.chartBody = that.svgContainer.append("g")
					.attr("id","clipPath")
					.attr("clip-path", "url(#clip" + i + that.selector + " )")
					.attr("transform","translate("+ that.margin_left +","+ that.margin_top +")");

				that.stack_layout = d3.layout.stack()
					.values(function(d) { return d.data; });

    			return this;
			},
			axisContainer : function () {
	        	if(PykCharts.boolean(that.axis_x_enable)){
					that.xGroup = that.group.append("g")
							.attr("id","xaxis")
							.attr("class", "x axis");
				}
				if(PykCharts.boolean(that.axis_y_enable)){
					that.yGroup = that.group.append("g")
						.attr("id","yaxis")
						.attr("class","y axis");
				}
	        	return this;
      		},
			createChart : function (evt) {
				that.group_arr = [], that.color_arr = [], that.new_data = [],
				that.legend_text = [];

				if(that.type === "areaChart") {
					that.new_data[0] = {
						name: (that.data[0].name || ""),
						data: [],
						color: (that.data[0].color || "")
					};
					for(j = 0;j < that.data_length;j++) {
						that.new_data[0].data.push({
							x: that.data[j].x,
							y: that.data[j].y,
							tooltip: that.data[j].tooltip,
							color: (that.data[j].color || ""),
							annotation : that.data[j].annotations || ""
						});
					}
				}
				else if(that.type === "stackedAreaChart") {
					for(j = 0;j < that.data_length;j++) {
						that.group_arr[j] = that.data[j].name;
							if(!that.data[j].color) {
								that.color_arr[j] = that.color[j];
							}
							else that.color_arr[j] = that.data[j].color;
					}
					that.uniq_group_arr = that.group_arr.slice();
					that.uniq_color_arr = that.color_arr.slice();
					$.unique(that.uniq_group_arr);
					$.unique(that.uniq_color_arr);
					var len = that.uniq_group_arr.length;

					for (k = 0;k < len;k++) {
						that.new_data[k] = {
								name: that.uniq_group_arr[k],
								data: [],
								color: that.uniq_color_arr[k]
						};
						for (l = 0;l < that.data_length;l++) {
							if (that.uniq_group_arr[k] === that.data[l].name) {
								that.new_data[k].data.push({
										x: that.data[l].x,
										y: that.data[l].y,
										tooltip: that.data[l].tooltip,
										annotation : that.data[l].annotations || ""
	            			 	});
	            			}
	          			}
	        		}
				}
				that.new_data_length = that.new_data.length;
				that.layers = that.stack_layout(that.new_data);

        		var x_domain,x_data = [],y_data,y_range,x_range,y_domain;

				if(that.yAxisDataFormat === "number") {
					max = d3.max(that.layers, function(d) { return d3.max(d.data, function(k) { return k.y0 + k.y; }); });
					min = 0;
         			y_domain = [min,max];
		          	y_data = that.k._domainBandwidth(y_domain,1);
		          	y_range = [that.h, 0];
		          	that.yScale = that.k.scaleIdentification("linear",y_data,y_range);

		        }
		        else if(that.yAxisDataFormat === "string") {
		          	that.new_data[0].data.forEach(function(d) { y_data.push(d.y); });
		          	y_range = [0,that.h];
		          	that.yScale = that.k.scaleIdentification("ordinal",y_data,y_range,0);

		        }
		        else if (that.yAxisDataFormat === "time") {
		          	that.layers.data.forEach(function (k) {
		          		k.y0 = new Date(k.y0);
		          		k.y = new Date(k.y);
		          	});
		          	max = d3.max(that.layers, function(d) { return d3.max(d.data, function(k) { return k.y0 + k.y; }); });
					min = 0;
		         	y_data = [min,max];
		          	y_range = [that.h, 0];
		          	that.yScale = that.k.scaleIdentification("time",y_data,y_range);

		        }
		        if(that.xAxisDataFormat === "number") {
        			max = d3.max(that.new_data, function(d) { return d3.max(d.data, function(k) { return k.x; }); });
					min = d3.min(that.new_data, function(d) { return d3.min(d.data, function(k) { return k.x; }); });
         			x_domain = [min,max];
			        x_data = that.k._domainBandwidth(x_domain,2);
			        x_range = [0 ,that.w];
			        that.xScale = that.k.scaleIdentification("linear",x_data,x_range);
			        that.extra_left_margin = 0;

		        }
		        else if(that.xAxisDataFormat === "string") {
		          	that.new_data[0].data.forEach(function(d) { x_data.push(d.x); });
		          	x_range = [0 ,that.w];
		          	that.xScale = that.k.scaleIdentification("ordinal",x_data,x_range,0);
		          	that.extra_left_margin = (that.xScale.rangeBand() / 2);

		        }
		        else if (that.xAxisDataFormat === "time") {
		        	max = d3.max(that.new_data, function(d) { return d3.max(d.data, function(k) { return new Date(k.x); }); });
					min = d3.min(that.new_data, function(d) { return d3.min(d.data, function(k) { return new Date(k.x); }); });
		         	x_data = [min,max];
		          	x_range = [0 ,that.w];
		          	that.xScale = that.k.scaleIdentification("time",x_data,x_range);
		          	for(i=0;i<that.new_data_length;i++) {
			          	that.new_data[i].data.forEach(function (d) {
			          		d.x = new Date(d.x);
			          	});
			        }
		          	that.data.forEach(function (d) {
		          		d.x = new Date(d.x);
		          	});
		          	that.extra_left_margin = 0;
		        }
		        that.xdomain = that.xScale.domain();
		        that.ydomain = that.yScale.domain();
				that.zoom_event = d3.behavior.zoom()
				    .y(that.yScale)
				    .scaleExtent([1,2])
				    .on("zoom", that.zoomed);

				if(PykCharts.boolean(that.zoom_enable)) {
					that.svgContainer.call(that.zoom_event);
				}

				that.chart_path = d3.svg.area()
				    .x(function(d) { return that.xScale(d.x); })
				    .y0(function(d) { return that.yScale(d.y0); })
    				.y1(function(d) { return that.yScale(d.y0 + d.y); })
				    .interpolate(that.interpolate);
				that.chart_path_border = d3.svg.line()
				    .x(function(d) { return that.xScale(d.x); })
				    .y(function(d) { return that.yScale(d.y0 + d.y); })
				    .interpolate(that.interpolate);

				that.chartPathClass = (that.type === "areaChart") ? "area" : "stacked-area";

        	if(evt === "liveData"){
        		for (var i = 0;i < that.new_data_length;i++) {
        			type = that.chartPathClass + i;
        			that.svgContainer.select("#"+type)
						.datum(that.layers[i].data)
						// .transition()
				      	// .ease(that.transition.transition_type)
			      		// .duration(that.transitions[that.transition.enable]().duration())
						//.attr("transform", "translate("+ that.extra_left_margin +",0)")
					    .attr("d", that.chart_path);

						that.svgContainer.select("#border-stacked-area"+i)
							.datum(that.layers[i].data)
					  		// .transition()
				      		// .ease("linear")
			      			// .duration(that.transitions.duration())
							//.attr("transform", "translate("+ that.extra_left_margin +",0)")
					      	.attr("d", that.chart_path_border);

					}

					if(that.type === "areaChart") {
						that.svgContainer
							.on('mouseout',function (d) {
			          			that.mouseEvent.tooltipHide();
			          			that.mouseEvent.crossHairHide(type);
								that.mouseEvent.axisHighlightHide(options.selector + " .x.axis");
								that.mouseEvent.axisHighlightHide(options.selector + " .y.axis");
		          			})
							.on("mousemove", function(){
								that.mouseEvent.crossHairPosition(that.data,that.new_data,that.xScale,that.yScale,that.dataLineGroup,that.extra_left_margin,that.xdomain,that.type,that.tooltip_mode);
					  		});
					}
				}
				else {
					for (var i = 0;i < that.new_data_length;i++) {
						var data = that.new_data[i].data;
						type = that.chartPathClass + i;
						that.dataLineGroup[i] = that.chartBody.append("path");
						that.dataLineGroup[i]
							.datum(that.layers[i].data)
							.attr("class", that.chartPathClass)
							.attr("id", type)
							.style("fill", function(d) { 

								return that.fillColor.colorPieMS(that.new_data[i]);
							})
							.style("fill-opacity",function() {
								if(that.type === "stackedAreaChart" && that.color_mode === "saturation") {
								return (i+1)/that.new_data.length;
								}
							})
							.attr("transform", "translate("+ that.extra_left_margin +",0)")
							.attr("d",function(d,k) {
							    	return that.chart_path(data[0]);
							 })

						function transition (i) {    
						    that.dataLineGroup[i].transition()		
							    .duration(that.transitions.duration())						    
							    .attrTween("d", function (d) {
							    	var interpolate = d3.scale.quantile()
						                .domain([0,1])
						                .range(d3.range(1, data.length + 1));
									        return function(t) {
									            return that.chart_path(that.new_data[i].data.slice(0, interpolate(t)));
									        };
							    })
						}

						transition(i);

						that.dataLineGroupBorder[i] = that.chartBody.append("path");
						that.dataLineGroupBorder[i]
							.datum(that.layers[i].data)
							.attr("class", "area-border")
							.attr("id", "border-stacked-area"+i)
							.style("stroke", that.borderBetweenChartElements_color)
							.style("stroke-width", that.borderBetweenChartElements_width)
							.style("stroke-dasharray", that.borderBetweenChartElements_style)
							.attr("transform", "translate("+ that.extra_left_margin +",0)")
							.attr("d", that.chart_path_border);

						function borderTransition (i) {    
						    that.dataLineGroupBorder[i].transition()		
							    .duration(that.transitions.duration())						    
							    .attrTween("d", function (d) {
							    	var interpolate = d3.scale.quantile()
						                .domain([0,1])
						                .range(d3.range(1, that.layers[i].data.length + 1));
									        return function(t) {
									            return that.chart_path(that.layers[i].data.slice(0, interpolate(t)));
									        };
							    })
						}
						borderTransition(i);

						// Legend ---- Pending!
					  // that.legend_text[i] = that.svgContainer.append("text")
					  // 		.attr("id",that.chartPathClass+"-"+that.new_data[i].name)
					  // 		.attr("x", 20)
					  // 		.attr("y", 20)
					  // 		.style("display","none")
					  // 		.text(that.new_data[i].name);data

						// that.dataLineGroup[i].on("click",function (d,j) {
						// 		that.curr_line_data = d;
						// 		that.curr_line_data_len = d.length;
						// 		that.deselected = that.selected;
						// 		d3.select(that.deselected).classed({'multi-line-selected':false,'multi-line':true});
						// 		that.selected = this;
						// 		d3.select(that.selected).classed({'multi-line-selected':true,'multi-line':false});

						// 		that.updateSelectedLine();
						// });
					}

					that.svgContainer
						.on('mouseout', function (d) {
							that.mouseEvent.tooltipHide();
							that.mouseEvent.crossHairHide(that.type);
							that.mouseEvent.axisHighlightHide(that.selector + " .x.axis");
							that.mouseEvent.axisHighlightHide(that.selector + " .y.axis");
							
							if(that.type === "stackedAreaChart") {
								for(var a=0;a < that.new_data_length;a++) {
									$(options.selector+" #svg-"+a).trigger("mouseout");
								}
							}
						})
						.on("mousemove", function() {
							if(that.type === "areaChart") {
								that.mouseEvent.crossHairPosition(that.data,that.new_data,that.xScale,that.yScale,that.dataLineGroup,that.extra_left_margin,that.xdomain,that.type,that.tooltip_mode);
							} else if(that.type === "stackedAreaChart") {
								var line = [];
								line[0] = d3.select(options.selector+" #"+this.id+" .stacked-area");
								that.mouseEvent.crossHairPosition(that.data,that.new_data,that.xScale,that.yScale,line,that.extra_left_margin,that.xdomain,that.type,that.tooltipMode,that.color_from_data,"no");
								for(var a=0;a < that.new_data_length;a++) {
									$(options.selector+" #svg-"+a).trigger("mousemove");
								}
							}
						});
				
				}
				that.annotation();
				return this;
			}
		};
		return optional;
	};

	this.zoomed = function() {
		that.k.isOrdinal(that.svgContainer,".x.axis",that.xScale,that.xdomain,that.extra_left_margin);
	    that.k.isOrdinal(that.svgContainer,".x.grid",that.xScale);
	    that.k.isOrdinal(that.svgContainer,".y.axis",that.yScale,that.ydomain);
	    that.k.isOrdinal(that.svgContainer,".y.grid",that.yScale);

	    for (i = 0;i < that.new_data_length;i++) {
	    	type = that.chartPathClass + i;
	  	 	that.svgContainer.select(that.selector+" #"+type)
	        	.attr("class", that.chartPathClass)
		        .attr("d", that.chart_path);
		    that.svgContainer.select(that.selector+" #border-stacked-area"+i)
				.attr("class","area-border")
				.attr("d", that.chart_path_border);
	    }
	};

	that.annotation = function () {
		that.line = d3.svg.line()
                .interpolate('linear-closed')
                .x(function(d,i) { return d.x; })
                .y(function(d,i) { return d.y; });
		if(that.type === "areaChart" && that.mode === "default") {
			var arrow_size = 10,annotation = [];
			that.new_data[0].data.map(function (d) {
				if(d.annotation) {
					annotation.push({
						annotation : d.annotation,
						x : d.x,
						y : d.y 
					})
				}
			});
			var anno = that.svgContainer.selectAll("linechart-arrows")
                .data(annotation)
            anno.enter()
                .append("path")
            anno.attr("class", "linechart-arrows")
                .attr("d", function (d,i) {
                	var a = [
                		{
                			x:parseInt(that.xScale(d.x)-(arrow_size*0.5))+that.extra_left_margin+that.margin_left,
                			y:parseInt(that.yScale(d.y)-(arrow_size)+that.margin_top)
                		},
                		{
                			x:parseInt(that.xScale(d.x)+(arrow_size*0.5))+that.extra_left_margin+that.margin_left,
                			y:parseInt(that.yScale(d.y)-(arrow_size)+that.margin_top)
                		},
                		{
                			x:parseInt(that.xScale(d.x))+that.extra_left_margin+that.margin_left,
                			y:parseInt(that.yScale(d.y)+that.margin_top),
                		}
                	];
                	return that.line(a);
                })
				.attr("fill","#eeeeee")
                .call(that.k.annotation);
            anno.exit()
            	.remove();
		} else if(that.type === "stackedAreaChart" && that.mode === "default") {
			var arrow_size = 10,annotation = [];	
			for(i=0;i<that.new_data_length;i++) {
				that.new_data[i].data.map(function (d) {
					if(d.annotation) {
						annotation.push({
							annotation : d.annotation,
							x : d.x,
							y : d.y,
							y0 : d.y0 
						});
					}
				});
			}
			var anno = that.svgContainer.selectAll("linechart-arrows")
                .data(annotation)
            anno.enter()
                .append("path")
            anno.attr("class", "linechart-arrows")
                .attr("d", function (d,i) {
                	var a = [
                		{
                			x:parseInt(that.xScale(d.x)-(arrow_size*0.5))+that.extra_left_margin+that.margin_left,
                			y:parseInt(that.yScale(d.y0+d.y)-(arrow_size)+that.margin_top)
                		},
                		{
                			x:parseInt(that.xScale(d.x)+(arrow_size*0.5))+that.extra_left_margin+that.margin_left,
                			y:parseInt(that.yScale(d.y0+d.y)-(arrow_size)+that.margin_top)
                		},
                		{
                			x:parseInt(that.xScale(d.x))+that.extra_left_margin+that.margin_left,
                			y:parseInt(that.yScale(d.y0+d.y)+that.margin_top),
                		}
                	];
                	return that.line(a);
                })
				.attr("fill","#eeeeee")
                .call(that.k.annotation);
            anno.exit()
            	.remove();
		}
	}
};
