(function () {
    window.VizTravel = {
        draw: function (p, manager, ai, progress) {
            p.push();
            
            var left = 200;
            var top = 130;
            var barWidth = (manager.width || 600) - 160;
            var barHeight = 6;
            var circleSize = 14;
            
            p.textAlign(p.CENTER);
            p.textFont('Unbounded');
            p.fill(200, 220, 228);
            p.textSize(26);
            p.textStyle(p.BOLD);
            p.text('How We Traveled Then vs. Now', left + barWidth / 2, 40);
            
            p.textFont('Azeret Mono');
            p.fill(200, 220, 228);
            p.textSize(12);
            p.textStyle(p.BOLD);
            p.text('New York City (NYC) to Seattle (SEA) journey time across three centuries', 
                   left + barWidth / 2, 62);
            
            var eras = [
                { 
                    label: '1800s', 
                    time: '4-6 months', 
                    iconPos: 0.15, 
                    icon: '🚢', 
                    color: [100, 180, 230],
                    speed: 0.000005,
                    pattern: 'water'
                },
                { 
                    label: '1900s', 
                    time: '3-4 days', 
                    iconPos: 0.4, 
                    icon: '🚂', 
                    color: [160, 120, 100],
                    speed: 0.0002,
                    pattern: 'rails'
                },
                { 
                    label: '2025',
                    time: '5-6 hours', 
                    iconPos: 0.75, 
                    icon: '✈️', 
                    color: [180, 180, 180],
                    speed: 0.003,
                    pattern: 'clouds'
                }
            ];
            
            var time = p.millis();
            
            eras.forEach(function(era, i) {
                var y = top + i * 130;
                
                p.fill(240);
                p.textAlign(p.RIGHT, p.CENTER);
                p.textSize(24);
                p.textStyle(p.BOLD);
                p.text(era.label, left - 20, y + barHeight / 2);
                
                // 根据不同交通方式绘制不同样式的轨道
                if (era.pattern === 'water') {
                    // 波浪线效果
                    p.noFill();
                    p.stroke(80, 150, 200, 150);
                    p.strokeWeight(2);
                    p.beginShape();
                    for (var x = left; x <= left + barWidth; x += 10) {
                        var waveY = y + barHeight / 2 + p.sin((x - left) * 0.05 + time * 0.001) * 3;
                        p.vertex(x, waveY);
                    }
                    p.endShape();
                    p.noStroke();
                } else if (era.pattern === 'rails') {
                    // 铁轨效果（双线 + 枕木）
                    p.fill(100, 80, 60);
                    p.rect(left, y - 1, barWidth, 2);
                    p.rect(left, y + barHeight - 1, barWidth, 2);
                    // 枕木
                    p.fill(80, 60, 40);
                    for (var tx = left; tx < left + barWidth; tx += 30) {
                        p.rect(tx, y - 4, 4, barHeight + 8);
                    }
                } else if (era.pattern === 'clouds') {
                    // 更简洁的云朵效果 - 固定位置，更自然的形状
                    p.fill(220, 220, 220, 60);
                    p.noStroke();
                    var cloudPositions = [0.15, 0.35, 0.55, 0.75, 0.95];
                    cloudPositions.forEach(function(pos) {
                        var cloudX = left + pos * barWidth;
                        // 画三个重叠的圆形成云朵
                        p.ellipse(cloudX - 12, y - 2, 20, 12);
                        p.ellipse(cloudX, y - 5, 24, 14);
                        p.ellipse(cloudX + 12, y - 2, 20, 12);
                    });
                }
                
                // 基础轨道
                p.noStroke();
                p.fill(80, 80, 80, 100);
                p.rect(left, y, barWidth, barHeight);
                
                p.fill(200);
                p.rect(left - circleSize / 2, y - (circleSize - barHeight) / 2, circleSize, circleSize);
                
                p.fill(200);
                p.ellipse(left + barWidth, y + barHeight / 2, circleSize + 2, circleSize + 2);
                
                p.textAlign(p.CENTER, p.TOP);
                p.textSize(12);
                p.fill(180);
                p.text('NYC', left, y + barHeight + 8);
                p.text('SEA', left + barWidth, y + barHeight + 8);
                
                var animProgress = (time * era.speed) % 1.0;  
                var circleX = left + barWidth * animProgress;
                
                p.fill(era.color[0], era.color[1], era.color[2]);
                p.noStroke();
                p.ellipse(circleX, y + barHeight / 2, circleSize, circleSize);
                
                var iconX = left + era.iconPos * barWidth;
                p.textAlign(p.CENTER, p.CENTER);
                p.textSize(28);
                p.text(era.icon, iconX, y - 30);
                
                p.textSize(14);
                p.fill(200);
                p.textAlign(p.CENTER, p.BOTTOM);
                p.text(era.time, iconX, y - 45);
            });
            
            // 数据源引用 - 更正规的学术格式
            var bottomY = top + (eras.length - 1) * 130 + barHeight + 40;
            
            p.textFont('Azeret Mono');
            p.textAlign(p.CENTER);
            p.textSize(11);  // 固定使用较大字体
            p.fill(200, 220, 228, 255);  // 固定完全不透明
            p.textStyle(p.NORMAL);
            
            // 更正规的citation格式
            p.text('Sources: U.S. Census Bureau (2023); Baldwin & Martin (2004); Bureau of Transportation Statistics (2024)', 
                   left + barWidth / 2, bottomY);
            
            p.pop();
        }
    };
})();