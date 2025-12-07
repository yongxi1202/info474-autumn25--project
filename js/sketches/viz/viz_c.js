// Vis 3: Not All Airlines Are Equal at Sea-Tac

(function () {
    window.VizC = {
        draw: function (p, manager, ai, progress) {
            p.push();
            
            var offsetX = manager.offsetX || 80;
            var offsetY = manager.offsetY || 60;
            var chartWidth = (manager.width || 600) - 100;
            var chartHeight = (manager.height || 520) - 120;
            
            if (!manager._airlineData) {
                manager._airlineData = {
                    years: [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019],
                    airlines: [
                        {
                            name: 'Delta',
                            color: [138, 107, 255], 
                            data: [15, 20, 35, 45, 55, 60, 65, 70, 100, 123],
                            description: 'Steady growth, leading in 2019',
                            growth: '+720%'
                        },
                        {
                            name: 'Alaska',
                            color: [239, 68, 68], 
                            data: [12, 18, 30, 40, 50, 55, 60, 65, 90, 125],
                            description: 'Fastest growth, top performer',
                            growth: '+941%'
                        },
                        {
                            name: 'United',
                            color: [96, 165, 250], 
                            data: [10, 15, 25, 30, 35, 40, 45, 50, 80, 115],
                            description: 'Consistent expansion',
                            growth: '+1050%'
                        },
                        {
                            name: 'Southwest',
                            color: [251, 191, 36], 
                            data: [8, 12, 20, 25, 30, 35, 40, 45, 65, 90],
                            description: 'Budget carrier, strong presence',
                            growth: '+1025%'
                        }
                    ]
                };
                
                var allValues = [];
                manager._airlineData.airlines.forEach(function(airline) {
                    allValues = allValues.concat(airline.data);
                });
                manager._airlineData.minValue = Math.min.apply(null, allValues);
                manager._airlineData.maxValue = Math.max.apply(null, allValues);
                
                manager._hoveredAirline = -1;
                manager._hoveredPoint = -1;
                manager._selectedAirline = -1; 
                manager._animProgress = 0; 
            }
            
            var data = manager._airlineData;
            
            if (manager._animProgress < 1) {
                manager._animProgress += 0.02;
            }

            p.textAlign(p.LEFT, p.TOP);
            p.textSize(18);
            p.fill(127, 218, 137); 
            p.noStroke();
            p.text('Flight Volume Growth (2010-2019)', offsetX - 50, offsetY - 45);
            
            p.textSize(12);
            p.fill(150, 180, 150);
            p.text('Click on a line to highlight | Hover for details', offsetX - 50, offsetY - 25);
            
            p.stroke(60, 60, 80);
            p.strokeWeight(0.5);
            
            for (var i = 0; i <= 5; i++) {
                var y = offsetY + chartHeight - (i / 5) * chartHeight;
                p.line(offsetX, y, offsetX + chartWidth, y);
                
                p.noStroke();
                p.fill(150);
                p.textAlign(p.RIGHT, p.CENTER);
                p.textSize(12);
                var labelValue = Math.round((data.maxValue / 5) * i);
                p.text(labelValue, offsetX - 10, y);
            }
            
            // Y-axis label
            p.push();
            p.translate(offsetX - 55, offsetY + chartHeight / 2);
            p.rotate(-p.HALF_PI);
            p.textAlign(p.CENTER, p.CENTER);
            p.textSize(13);
            p.fill(150, 180, 150);
            p.noStroke();
            p.text('Flights per Day', 0, 0);
            p.pop();
            
            p.stroke(60, 60, 80);
            p.strokeWeight(0.5);
            for (var j = 0; j < data.years.length; j++) {
                var x = offsetX + (j / (data.years.length - 1)) * chartWidth;
                p.line(x, offsetY, x, offsetY + chartHeight);
            }

            p.noStroke();
            p.fill(150);
            p.textAlign(p.CENTER, p.TOP);
            p.textSize(11);
            for (var k = 0; k < data.years.length; k++) {
                var xLabel = offsetX + (k / (data.years.length - 1)) * chartWidth;
                p.text(data.years[k], xLabel, offsetY + chartHeight + 10);
            }
            
            var mx = p.mouseX;
            var my = p.mouseY;
            var newHoveredAirline = -1;
            var newHoveredPoint = -1;
            var minDist = 25; 
            
            data.airlines.forEach(function(airline, airlineIdx) {
                var isSelected = (manager._selectedAirline === airlineIdx);
                var isHovered = (manager._hoveredAirline === airlineIdx);
                var isHighlighted = isSelected || isHovered;
                
                var hasSelection = manager._selectedAirline >= 0;
                var shouldDim = hasSelection && !isSelected;
                
                p.noFill();
                var alpha = shouldDim ? 50 : (isHighlighted ? 255 : 180);
                p.stroke(airline.color[0], airline.color[1], airline.color[2], alpha);
                p.strokeWeight(isHighlighted ? 4 : 2.5);
                
                p.beginShape();
                airline.data.forEach(function(value, idx) {
                    var animValue = value * manager._animProgress;
                    var x = offsetX + (idx / (data.years.length - 1)) * chartWidth;
                    var y = offsetY + chartHeight - ((animValue - data.minValue) / (data.maxValue - data.minValue)) * chartHeight;
                    p.vertex(x, y);
                    
                    var actualY = offsetY + chartHeight - ((value - data.minValue) / (data.maxValue - data.minValue)) * chartHeight;
                    var d = p.dist(mx, my, x, actualY);
                    if (d < minDist) {
                        minDist = d;
                        newHoveredAirline = airlineIdx;
                        newHoveredPoint = idx;
                    }
                });
                p.endShape();
                
                p.noStroke();
                airline.data.forEach(function(value, idx) {
                    var animValue = value * manager._animProgress;
                    var x = offsetX + (idx / (data.years.length - 1)) * chartWidth;
                    var y = offsetY + chartHeight - ((animValue - data.minValue) / (data.maxValue - data.minValue)) * chartHeight;
                    
                    var isThisPoint = (isHighlighted && manager._hoveredPoint === idx);
                    
                    var dotSize = isThisPoint ? 10 : (isHighlighted ? 6 : 4);
                    
                    if (shouldDim) {
                        dotSize = 2;
                    }
                    
                    var dotAlpha = shouldDim ? 80 : 255;
                    p.fill(airline.color[0], airline.color[1], airline.color[2], dotAlpha);
                    p.ellipse(x, y, dotSize, dotSize);

                    if (isThisPoint) {
                        p.noFill();
                        p.stroke(255);
                        p.strokeWeight(2);
                        p.ellipse(x, y, dotSize + 4, dotSize + 4);
                    }
                });

                var lastIdx = airline.data.length - 1;
                var lastValue = airline.data[lastIdx] * manager._animProgress;
                var lastX = offsetX + (lastIdx / (data.years.length - 1)) * chartWidth;
                var lastY = offsetY + chartHeight - ((lastValue - data.minValue) / (data.maxValue - data.minValue)) * chartHeight;
                
                p.noStroke();
                p.textAlign(p.LEFT, p.CENTER);
                p.textSize(isHighlighted ? 16 : 14);
                var labelAlpha = shouldDim ? 100 : 255;
                p.fill(airline.color[0], airline.color[1], airline.color[2], labelAlpha);
                p.text(Math.round(airline.data[lastIdx]), lastX + 15, lastY);
            });
            
            manager._hoveredAirline = newHoveredAirline;
            manager._hoveredPoint = newHoveredPoint;

            if (p.mouseIsPressed && p.frameCount % 10 === 0) {
                if (manager._hoveredAirline >= 0) {
                    if (manager._selectedAirline === manager._hoveredAirline) {
                        manager._selectedAirline = -1;
                    } else {
                        manager._selectedAirline = manager._hoveredAirline;
                    }
                } else if (mx < offsetX || mx > offsetX + chartWidth || my < offsetY || my > offsetY + chartHeight) {
                    manager._selectedAirline = -1;
                }
            }
            
            var legendY = offsetY + chartHeight + 50;
            var legendSpacing = 110;
            var legendStartX = offsetX + 50;
            
            data.airlines.forEach(function(airline, idx) {
                var legendX = legendStartX + idx * legendSpacing;
                var isSelected = (manager._selectedAirline === idx);
                var isHovered = (manager._hoveredAirline === idx);
                var isActive = isSelected || isHovered;
                
                var hasSelection = manager._selectedAirline >= 0;
                var shouldDim = hasSelection && !isSelected;

                var lineAlpha = shouldDim ? 100 : 255;
                p.stroke(airline.color[0], airline.color[1], airline.color[2], lineAlpha);
                p.strokeWeight(isActive ? 4 : 3);
                p.line(legendX, legendY, legendX + 30, legendY);

                p.noStroke();
                var textAlpha = shouldDim ? 120 : 255;
                p.fill(airline.color[0], airline.color[1], airline.color[2], textAlpha);
                p.textAlign(p.LEFT, p.CENTER);
                p.textSize(isActive ? 14 : 13);
                p.text(airline.name, legendX + 40, legendY);

                if (isSelected) {
                    p.textSize(11);
                    p.fill(150, 200, 150);
                    p.text(airline.growth, legendX + 40, legendY + 15);
                }
            });

            if (manager._hoveredAirline >= 0 && manager._hoveredPoint >= 0) {
                var airline = data.airlines[manager._hoveredAirline];
                var pointIdx = manager._hoveredPoint;
                var value = airline.data[pointIdx];
                var year = data.years[pointIdx];
                
                var tooltipX = mx + 15;
                var tooltipY = my - 60;
                var tooltipW = 180;
                var tooltipH = 70;

                if (tooltipX + tooltipW > offsetX + chartWidth + 80) {
                    tooltipX = mx - tooltipW - 15;
                }
                if (tooltipY < offsetY) {
                    tooltipY = my + 15;
                }

                p.fill(20, 30, 45, 250);
                p.stroke(airline.color[0], airline.color[1], airline.color[2]);
                p.strokeWeight(2);
                p.rect(tooltipX, tooltipY, tooltipW, tooltipH, 5);

                p.noStroke();
                p.textAlign(p.LEFT, p.TOP);
                p.textSize(15);
                p.fill(airline.color[0], airline.color[1], airline.color[2]);
                p.text(airline.name, tooltipX + 10, tooltipY + 8);
                
                p.textSize(12);
                p.fill(180);
                p.text('Year: ' + year, tooltipX + 10, tooltipY + 28);
                p.text('Flights: ' + value, tooltipX + 10, tooltipY + 43);

                p.textSize(10);
                p.fill(150, 180, 150);
                p.text(airline.description, tooltipX + 10, tooltipY + 58);
            }

            if (manager._selectedAirline >= 0) {
                var selectedAirline = data.airlines[manager._selectedAirline];
                var panelX = offsetX - 60;
                var panelY = offsetY + 20;
                var panelW = 50;
                var panelH = 100;

                p.fill(20, 30, 45, 200);
                p.stroke(selectedAirline.color[0], selectedAirline.color[1], selectedAirline.color[2]);
                p.strokeWeight(2);
                p.rect(panelX, panelY, panelW, panelH, 5);

                p.noStroke();
                p.textAlign(p.CENTER, p.TOP);
                p.textSize(11);
                p.fill(selectedAirline.color[0], selectedAirline.color[1], selectedAirline.color[2]);
                p.text('Growth', panelX + panelW/2, panelY + 10);
                
                p.textSize(18);
                p.fill(150, 200, 150);
                p.text(selectedAirline.growth, panelX + panelW/2, panelY + 30);
                
                p.textSize(9);
                p.fill(150);
                p.text('2010-2019', panelX + panelW/2, panelY + 55);

                p.textSize(8);
                p.fill(100);
                p.text('Click to\ndeselect', panelX + panelW/2, panelY + 75);
            }

            if (manager._hoveredAirline < 0 && manager._selectedAirline < 0 && p.frameCount % 120 < 60) {
                p.noStroke();
                p.textAlign(p.CENTER, p.CENTER);
                p.textSize(11);
                var alpha = Math.sin(p.frameCount * 0.05) * 60 + 60;
                p.fill(127, 218, 137, alpha);
                p.text('← Hover over lines for details', offsetX + chartWidth/2, offsetY + chartHeight/2);
            }
            
            p.pop();
        }
    };
})();
