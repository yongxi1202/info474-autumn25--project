// Visualization showing flight pricing patterns to Seattle
(function () {
    window.VizPricing = {
        draw: function (p, manager, ai, progress) {
            p.push();
            
            var offsetX = manager.offsetX || 80;
            var offsetY = manager.offsetY || 30;
            var chartWidth = (manager.width || 600) - 100;
            var chartHeight = (manager.height || 520) - 60;
            
            // Initialize data if not exists
            if (!manager._pricingData) {
                // 3-color system inspired by Disney crowd calendars
                var greenColor = [90, 220, 130];    // Low/Cheap
                var yellowColor = [230, 200, 90];   // Moderate
                var redColor = [240, 110, 90];      // High/Expensive
                
                manager._pricingData = {
                    // Simplified 3-tier pricing
                    months: [
                        { name: 'Jan', tier: 'low', color: greenColor },
                        { name: 'Feb', tier: 'low', color: greenColor },
                        { name: 'Mar', tier: 'moderate', color: yellowColor },
                        { name: 'Apr', tier: 'moderate', color: yellowColor },
                        { name: 'May', tier: 'moderate', color: yellowColor },
                        { name: 'Jun', tier: 'high', color: redColor },
                        { name: 'Jul', tier: 'high', color: redColor },
                        { name: 'Aug', tier: 'high', color: redColor },
                        { name: 'Sep', tier: 'low', color: greenColor },
                        { name: 'Oct', tier: 'low', color: greenColor },
                        { name: 'Nov', tier: 'moderate', color: yellowColor },
                        { name: 'Dec', tier: 'high', color: redColor }
                    ],
                    weekdays: [
                        { name: 'Sun', tier: 'high', color: redColor },
                        { name: 'Mon', tier: 'moderate', color: yellowColor },
                        { name: 'Tue', tier: 'low', color: greenColor },
                        { name: 'Wed', tier: 'low', color: greenColor },
                        { name: 'Thu', tier: 'moderate', color: yellowColor },
                        { name: 'Fri', tier: 'high', color: redColor },
                        { name: 'Sat', tier: 'moderate', color: yellowColor }
                    ],
                    tierInfo: {
                        low: { label: 'Low Price', save: 'Save 15-30%' },
                        moderate: { label: 'Moderate', save: 'Average price' },
                        high: { label: 'High Price', save: 'Peak pricing' }
                    }
                };
                manager._hoveredMonth = -1;
                manager._hoveredDay = -1;
                manager._animProgress = 0;
            }
            
            var data = manager._pricingData;
            
            // Smooth animation
            if (manager._animProgress < 1) {
                manager._animProgress += 0.03;
            }
            
            // Main Title
            p.textAlign(p.CENTER, p.TOP);
            p.textSize(22);
            p.fill(127, 218, 137);
            p.noStroke();
            p.text('When to Find the Best Flight Prices to Seattle', 
                offsetX + chartWidth / 2, offsetY);
            
            // ============ PART 1: MONTHLY GRID (3x4) ============
            var monthY = offsetY + 45;
            
            // Section header
            p.textSize(17);
            p.fill(230, 246, 157);
            p.textAlign(p.LEFT, p.TOP);
            p.text('📅 Best Months to Book', offsetX - 10, monthY);
            
            var monthStartY = monthY + 35;
            var boxSize = 80;
            var boxSpacing = 15;
            
            // Calculate centering for 4 columns
            var monthGridWidth = 4 * (boxSize + boxSpacing) - boxSpacing;  // 365px
            var monthStartX = offsetX + (chartWidth - monthGridWidth) / 2;  // Center the grid
            
            var mx = p.mouseX;
            var my = p.mouseY;
            var newHoveredMonth = -1;
            
            // Draw 3x4 grid of months
            for (var i = 0; i < 12; i++) {
                var month = data.months[i];
                var row = Math.floor(i / 4);
                var col = i % 4;
                var x = monthStartX + col * (boxSize + boxSpacing);
                var y = monthStartY + row * (boxSize + boxSpacing);
                
                // Check hover
                if (mx > x && mx < x + boxSize && my > y && my < y + boxSize) {
                    newHoveredMonth = i;
                }
                
                var isHovered = (newHoveredMonth === i);
                var scale = manager._animProgress;
                if (isHovered) scale = 1.05;
                
                var currentSize = boxSize * scale;
                var currentX = x + (boxSize - currentSize) / 2;
                var currentY = y + (boxSize - currentSize) / 2;
                
                // Shadow
                p.noStroke();
                p.fill(0, 0, 0, 40);
                p.rect(currentX + 3, currentY + 3, currentSize, currentSize, 8);
                
                // Main box
                p.fill(month.color[0], month.color[1], month.color[2], 
                    isHovered ? 255 : 230);
                p.stroke(255, 255, 255, isHovered ? 150 : 80);
                p.strokeWeight(isHovered ? 3 : 2);
                p.rect(currentX, currentY, currentSize, currentSize, 8);
                
                // Month label
                p.noStroke();
                p.fill(isHovered ? 20 : 30, isHovered ? 30 : 40, isHovered ? 40 : 50);
                p.textAlign(p.CENTER, p.CENTER);
                p.textSize(isHovered ? 18 : 16);
                p.textStyle(p.BOLD);
                p.text(month.name, x + boxSize / 2, y + boxSize / 2);
                p.textStyle(p.NORMAL);
            }
            
            manager._hoveredMonth = newHoveredMonth;
            
            // Month tooltip
            if (manager._hoveredMonth >= 0) {
                var month = data.months[manager._hoveredMonth];
                var tierData = data.tierInfo[month.tier];
                var tooltipX = mx + 15;
                var tooltipY = my - 70;
                var tooltipW = 160;
                var tooltipH = 75;
                
                if (tooltipX + tooltipW > offsetX + chartWidth + 80) {
                    tooltipX = mx - tooltipW - 15;
                }
                if (tooltipY < offsetY) {
                    tooltipY = my + 15;
                }
                
                // Shadow
                p.noStroke();
                p.fill(0, 0, 0, 80);
                p.rect(tooltipX + 3, tooltipY + 3, tooltipW, tooltipH, 6);
                
                // Background
                p.fill(15, 25, 38, 250);
                p.stroke(month.color[0], month.color[1], month.color[2]);
                p.strokeWeight(2.5);
                p.rect(tooltipX, tooltipY, tooltipW, tooltipH, 6);
                
                p.noStroke();
                p.textAlign(p.LEFT, p.TOP);
                p.textSize(16);
                p.fill(month.color[0], month.color[1], month.color[2]);
                p.textStyle(p.BOLD);
                p.text(month.name, tooltipX + 12, tooltipY + 10);
                p.textStyle(p.NORMAL);
                
                p.textSize(13);
                p.fill(200);
                p.text(tierData.label, tooltipX + 12, tooltipY + 33);
                
                p.textSize(12);
                p.fill(140, 180, 160);
                p.text(tierData.save, tooltipX + 12, tooltipY + 53);
            }
            
            // ============ PART 2: WEEKDAY BOXES (1x7) ============
            var dayY = monthStartY + 3 * (boxSize + boxSpacing) + 40;
            
            // Section header
            p.textSize(17);
            p.fill(230, 246, 157);
            p.textAlign(p.LEFT, p.TOP);
            p.text('📆 Best Days of the Week to Fly', offsetX - 10, dayY);
            
            var dayStartY = dayY + 35;
            var dayBoxWidth = 65;
            var dayBoxHeight = 60;
            var dayBoxSpacing = 12;
            
            // Calculate centering for 7 columns
            var dayGridWidth = 7 * (dayBoxWidth + dayBoxSpacing) - dayBoxSpacing;  // 527px
            var dayStartX = offsetX + (chartWidth - dayGridWidth) / 2;  // Center the grid
            
            var newHoveredDay = -1;
            
            // Draw 1x7 row of weekdays
            for (var j = 0; j < 7; j++) {
                var day = data.weekdays[j];
                var x = dayStartX + j * (dayBoxWidth + dayBoxSpacing);
                var y = dayStartY;
                
                // Check hover
                if (mx > x && mx < x + dayBoxWidth && my > y && my < y + dayBoxHeight) {
                    newHoveredDay = j;
                }
                
                var isHovered = (newHoveredDay === j);
                var scale = manager._animProgress;
                if (isHovered) scale = 1.08;
                
                var currentW = dayBoxWidth * scale;
                var currentH = dayBoxHeight * scale;
                var currentX = x + (dayBoxWidth - currentW) / 2;
                var currentY = y + (dayBoxHeight - currentH) / 2;
                
                // Shadow
                p.noStroke();
                p.fill(0, 0, 0, 40);
                p.rect(currentX + 2, currentY + 2, currentW, currentH, 6);
                
                // Main box
                p.fill(day.color[0], day.color[1], day.color[2], 
                    isHovered ? 255 : 230);
                p.stroke(255, 255, 255, isHovered ? 150 : 80);
                p.strokeWeight(isHovered ? 3 : 2);
                p.rect(currentX, currentY, currentW, currentH, 6);
                
                // Day label
                p.noStroke();
                p.fill(isHovered ? 20 : 30, isHovered ? 30 : 40, isHovered ? 40 : 50);
                p.textAlign(p.CENTER, p.CENTER);
                p.textSize(isHovered ? 15 : 13);
                p.textStyle(p.BOLD);
                p.text(day.name, x + dayBoxWidth / 2, y + dayBoxHeight / 2);
                p.textStyle(p.NORMAL);
            }
            
            manager._hoveredDay = newHoveredDay;
            
            // Day tooltip
            if (manager._hoveredDay >= 0) {
                var day = data.weekdays[manager._hoveredDay];
                var tierData = data.tierInfo[day.tier];
                var tooltipX = mx + 15;
                var tooltipY = my - 65;
                var tooltipW = 150;
                var tooltipH = 70;
                
                if (tooltipX + tooltipW > offsetX + chartWidth + 80) {
                    tooltipX = mx - tooltipW - 15;
                }
                
                // Shadow
                p.noStroke();
                p.fill(0, 0, 0, 80);
                p.rect(tooltipX + 3, tooltipY + 3, tooltipW, tooltipH, 6);
                
                // Background
                p.fill(15, 25, 38, 250);
                p.stroke(day.color[0], day.color[1], day.color[2]);
                p.strokeWeight(2.5);
                p.rect(tooltipX, tooltipY, tooltipW, tooltipH, 6);
                
                p.noStroke();
                p.textAlign(p.LEFT, p.TOP);
                p.textSize(15);
                p.fill(day.color[0], day.color[1], day.color[2]);
                p.textStyle(p.BOLD);
                p.text(day.name, tooltipX + 12, tooltipY + 10);
                p.textStyle(p.NORMAL);
                
                p.textSize(12);
                p.fill(200);
                p.text(tierData.label, tooltipX + 12, tooltipY + 32);
                
                p.textSize(11);
                p.fill(140, 180, 160);
                p.text(tierData.save, tooltipX + 12, tooltipY + 50);
            }
            
            // ============ LEGEND ============
            var legendY = dayStartY + dayBoxHeight + 35;
            
            // Calculate total legend width: 3 items with spacing
            var legendItemSpacing = 100;
            var totalLegendWidth = legendItemSpacing * 2;  // Space between 3 items
            var legendCenterX = offsetX + chartWidth / 2;
            var legendStartX = legendCenterX - totalLegendWidth / 2;
            
            p.textAlign(p.CENTER, p.TOP);
            p.textSize(12);
            p.fill(180);
            p.textStyle(p.BOLD);
            p.text('Price Level Guide:', legendCenterX, legendY);
            p.textStyle(p.NORMAL);
            
            var legendItemY = legendY + 20;
            
            // Low
            p.fill(90, 220, 130);
            p.noStroke();
            p.rect(legendStartX - 12, legendItemY + 2, 18, 18, 4);
            p.fill(180);
            p.textAlign(p.LEFT, p.CENTER);
            p.textSize(11);
            p.text('Low', legendStartX + 12, legendItemY + 11);
            
            // Moderate
            p.fill(230, 200, 90);
            p.noStroke();
            p.rect(legendStartX + legendItemSpacing - 12, legendItemY + 2, 18, 18, 4);
            p.fill(180);
            p.text('Moderate', legendStartX + legendItemSpacing + 12, legendItemY + 11);
            
            // High
            p.fill(240, 110, 90);
            p.noStroke();
            p.rect(legendStartX + legendItemSpacing * 2 - 12, legendItemY + 2, 18, 18, 4);
            p.fill(180);
            p.text('High', legendStartX + legendItemSpacing * 2 + 12, legendItemY + 11);
            
            // Data source
            p.textAlign(p.CENTER, p.TOP);
            p.textSize(10);
            p.fill(120, 140, 120);
            p.text('Data sources: KAYAK, Google Flights, Expedia (2022-2025 average)', 
                   legendCenterX, legendItemY + 35);
            
            p.pop();
        }
    };
})();
