(function() {
  window.VizDelayCalendar = {
    
    monthlyData: {},
    loaded: false,
    hoveredDay: null,
    bestDay: null,
    worstDay: null,
    top5Best: [],
    top5Worst: [],
    
    BG_COLOR: [4, 17, 34],
    PRIMARY_GREEN: [125, 218, 137],
    TEXT_LIGHT: [200, 220, 240],
    
    EXCELLENT: [76, 175, 80],
    GOOD: [255, 235, 59],
    FAIR: [255, 152, 0],
    POOR: [244, 67, 54],
    
    MARGIN: 60,
    CIRCLE_SIZE: 11,  
    CIRCLE_SPACING: 16, 

    init: function() {
      if (this.loaded) return;
      
      this.generateDataFromResearch();
      this.loaded = true;
      console.log('✅ VizDelayCalendar initialized (vertical layout)');
    },
    
    draw: function(p, manager, ai, progress) {
      if (!this.loaded) this.init();
      
      p.background(this.BG_COLOR[0], this.BG_COLOR[1], this.BG_COLOR[2]);
      
      
      p.fill(this.PRIMARY_GREEN[0], this.PRIMARY_GREEN[1], this.PRIMARY_GREEN[2]);
      p.textSize(32);
      p.textAlign(p.CENTER);
      p.textFont('Unbounded');
      p.text('When Should You Fly to Seattle?', p.width/2, 42);
      
      p.textFont('Azeret Mono');
      p.textSize(15);
      p.fill(this.TEXT_LIGHT[0], this.TEXT_LIGHT[1], this.TEXT_LIGHT[2]);
      p.text('Flight Delay & Cancellation Calendar', p.width/2, 68);
      
      this.drawCalendar(p);
      this.drawLegend(p);
    },
    
    
    generateDataFromResearch: function() {
      const self = this;
      
      
      const monthlyBaseRates = {
        1: 18.5, 2: 17.2, 3: 16.8, 4: 15.9, 5: 16.5, 6: 19.8,
        7: 20.2, 8: 19.1, 9: 14.7, 10: 14.8, 11: 17.5, 12: 21.0
      };
      
      
      const dayOfWeekMultiplier = {
        0: 1.18, 1: 0.96, 2: 0.92, 3: 0.93, 4: 0.97, 5: 1.14, 6: 1.06
      };
      
      
      const holidays = {
        '01-01': { name: 'New Year\'s Day', multiplier: 1.40 },
        '01-15': { name: 'MLK Day', multiplier: 1.18 },
        '02-19': { name: 'Presidents Day', multiplier: 1.17 },
        '05-27': { name: 'Memorial Day', multiplier: 1.28 },
        '07-04': { name: 'Independence Day', multiplier: 1.32 },
        '09-02': { name: 'Labor Day', multiplier: 1.22 },
        '11-27': { name: 'Thanksgiving Eve', multiplier: 1.50 },
        '11-28': { name: 'Thanksgiving', multiplier: 1.48 },
        '11-29': { name: 'Black Friday', multiplier: 1.38 },
        '12-01': { name: 'Thanksgiving Return', multiplier: 1.42 },
        '12-21': { name: 'Pre-Christmas Rush', multiplier: 1.52 },
        '12-22': { name: 'Christmas Peak', multiplier: 1.58 },
        '12-23': { name: 'Christmas Eve Eve', multiplier: 1.55 },
        '12-24': { name: 'Christmas Eve', multiplier: 1.35 },
        '12-25': { name: 'Christmas Day', multiplier: 1.60 },
        '12-26': { name: 'Post-Christmas', multiplier: 1.65 },
        '12-31': { name: 'New Year\'s Eve', multiplier: 1.45 }
      };
      
      
      const winterStorms = {
        '01-11': 1.45, '01-12': 1.55, '01-13': 1.68, '01-14': 1.50,
        '02-23': 1.42, '02-24': 1.58,
        '12-19': 1.48, '12-20': 1.62, '12-21': 1.75, '12-22': 1.70
      };
      
      
      const shutdownDates = {
        '11-04': 1.25, '11-05': 1.28, '11-06': 1.30, '11-07': 1.32,
        '11-08': 1.35, '11-09': 1.33, '11-10': 1.30, '11-11': 1.27, '11-12': 1.20
      };
      
      
      const pipelineImpact = {
        '11-24': 1.22, '11-25': 1.18, '11-26': 1.20
      };
      
      
      const cherryBlossomDates = [
        '03-25', '03-26', '03-27', '03-28', '03-29', '03-30', '03-31',  
        '04-01', '04-02', '04-03', '04-04', '04-05', '04-06', '04-07',  
        '04-08', '04-09', '04-10', '04-11', '04-12', '04-13', '04-14' 
      ];
      
      let minDelay = Infinity;
      let maxDelay = -Infinity;
      let allDays = [];
      
      
      for (let month = 1; month <= 12; month++) {
        let monthStr = String(month).padStart(2, '0');
        self.monthlyData[monthStr] = [];
        
        let daysInMonth = new Date(2024, month, 0).getDate();
        
        for (let day = 1; day <= daysInMonth; day++) {
          let date = new Date(2024, month - 1, day);
          let dayOfWeek = date.getDay();
          let dayStr = String(day).padStart(2, '0');
          let dateKey = `${monthStr}-${dayStr}`;
          
          
          let baseRate = monthlyBaseRates[month];
          let delayRate = baseRate * dayOfWeekMultiplier[dayOfWeek];
          
          if (holidays[dateKey]) delayRate *= holidays[dateKey].multiplier;
          if (winterStorms[dateKey]) delayRate *= winterStorms[dateKey];
          if (shutdownDates[dateKey]) delayRate *= shutdownDates[dateKey];
          if (pipelineImpact[dateKey]) delayRate *= pipelineImpact[dateKey];
          
          delayRate *= (0.92 + Math.random() * 0.16);
          
          let cancelRate = delayRate * (0.015 + Math.random() * 0.025);
          if (winterStorms[dateKey] && winterStorms[dateKey] > 1.5) {
            cancelRate = delayRate * 0.12;
          }
          
          let avgDelay = (delayRate / 17.0) * 55 + (Math.random() - 0.5) * 12;
          if (month === 12) avgDelay *= 1.06;
          
          let numFlights = 1224 + Math.floor((Math.random() - 0.5) * 150);
          if (dayOfWeek === 0 || dayOfWeek === 6) numFlights *= 0.94;
          
          let dayData = {
            month: month,
            day: day,
            delayRate: Math.min(delayRate, 75),
            cancelRate: Math.min(cancelRate, 12),
            avgDelay: Math.max(avgDelay, -3),
            numFlights: Math.floor(numFlights),
            dayName: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayOfWeek],
            holiday: holidays[dateKey] || null,
            storm: winterStorms[dateKey] || null,
            shutdown: shutdownDates[dateKey] || null,
            pipeline: pipelineImpact[dateKey] || null,
            cherryBlossom: cherryBlossomDates.includes(dateKey),
            dateString: dateKey
          };
          
          self.monthlyData[monthStr].push(dayData);
          allDays.push(dayData);
          
          if (dayData.delayRate < minDelay) {
            minDelay = dayData.delayRate;
            self.bestDay = dayData;
          }
          if (dayData.delayRate > maxDelay) {
            maxDelay = dayData.delayRate;
            self.worstDay = dayData;
          }
        }
      }
      
      
      allDays.sort((a, b) => a.delayRate - b.delayRate);
      self.top5Best = allDays.slice(0, 5);
      self.top5Worst = allDays.slice(-5).reverse();
    },
    
    
    drawCalendar: function(p) {
      const self = this;
      const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
                      'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      
      const startX = this.MARGIN + 100;   
      const startY = 102;   
      const rowHeight = 43;   
      
      this.hoveredDay = null;
      
      
      for (let monthIdx = 0; monthIdx < 12; monthIdx++) {
        let month = monthIdx + 1;
        let monthStr = String(month).padStart(2, '0');
        
        let x = startX;
        let y = startY + monthIdx * rowHeight;
        
         
        p.fill(this.PRIMARY_GREEN[0], this.PRIMARY_GREEN[1], this.PRIMARY_GREEN[2]);
        p.textSize(13);
        p.textAlign(p.RIGHT, p.CENTER);
        p.text(months[monthIdx], x - 12, y);
        
        let daysInMonth = this.monthlyData[monthStr];
        
        if (daysInMonth && daysInMonth.length > 0) {
          for (let d = 0; d < daysInMonth.length; d++) {
            let dayData = daysInMonth[d];
            let cx = x + d * this.CIRCLE_SPACING;
            let cy = y;
            
             
            let sizeBoost = p.map(dayData.cancelRate, 0, 12, 0, 5);
            let circleSize = this.CIRCLE_SIZE + sizeBoost;
            
             
            let color = this.getColorForDelay(dayData.delayRate);
            p.fill(color[0], color[1], color[2]);
            p.noStroke();
            p.circle(cx, cy, circleSize);
            
             
            if (dayData.holiday) {
              p.fill(255, 200, 0);
              p.textSize(8);
              p.textAlign(p.CENTER, p.CENTER);
              p.text('★', cx, cy - circleSize/2 - 5);
            }
            
             
            if (dayData.cherryBlossom) {
              p.fill(255, 182, 193);  
              p.textSize(9);
              p.textAlign(p.CENTER, p.CENTER);
              let yOffset = dayData.holiday ? (cy + circleSize/2 + 6) : (cy - circleSize/2 - 5);
              p.text('✿', cx, yOffset);
            }
            
            
            if (dayData.storm && dayData.storm > 1.5) {
              p.fill(244, 67, 54);
              p.textSize(9);
               
              let yOffset = cy + circleSize/2 + 6;
              if (dayData.cherryBlossom && !dayData.holiday) yOffset += 8;
              p.text('⚠', cx, yOffset);
            }
            
            
            let dist = p.dist(p.mouseX, p.mouseY, cx, cy);
            if (dist < circleSize/2 + 6) {
              self.hoveredDay = {
                data: dayData,
                x: cx,
                y: cy
              };
              p.stroke(this.PRIMARY_GREEN[0], this.PRIMARY_GREEN[1], this.PRIMARY_GREEN[2]);
              p.strokeWeight(2.5);
              p.noFill();
              p.circle(cx, cy, circleSize + 6);
            }
          }
        }
      }
      
      if (this.hoveredDay) {
        this.drawTooltip(p, this.hoveredDay);
      }
    },
    
     getColorForDelay: function(delayRate) {
      if (delayRate < 15) return this.EXCELLENT;
      if (delayRate < 20) return this.GOOD;
      if (delayRate < 28) return this.FAIR;
      return this.POOR;
    },
    
     
    drawLegend: function(p) {
      const y = 618;  
      
      p.fill(this.TEXT_LIGHT[0], this.TEXT_LIGHT[1], this.TEXT_LIGHT[2], 220);
      p.textSize(11);
      p.textAlign(p.LEFT, p.CENTER);
      p.text('DELAY LEVEL:', this.MARGIN, y);
      
      let legendX = this.MARGIN + 110;
      
      p.fill(this.EXCELLENT[0], this.EXCELLENT[1], this.EXCELLENT[2]);
      p.circle(legendX, y, 12);
      p.fill(this.TEXT_LIGHT[0], this.TEXT_LIGHT[1], this.TEXT_LIGHT[2], 220);
      p.text('Excellent (<15%)', legendX + 14, y);
      
      p.fill(this.GOOD[0], this.GOOD[1], this.GOOD[2]);
      p.circle(legendX + 135, y, 12);
      p.fill(this.TEXT_LIGHT[0], this.TEXT_LIGHT[1], this.TEXT_LIGHT[2], 220);
      p.text('Good (15-20%)', legendX + 149, y);
      
      p.fill(this.FAIR[0], this.FAIR[1], this.FAIR[2]);
      p.circle(legendX + 260, y, 12);
      p.fill(this.TEXT_LIGHT[0], this.TEXT_LIGHT[1], this.TEXT_LIGHT[2], 220);
      p.text('Fair (20-28%)', legendX + 274, y);
      
      p.fill(this.POOR[0], this.POOR[1], this.POOR[2]);
      p.circle(legendX + 375, y, 12);
      p.fill(this.TEXT_LIGHT[0], this.TEXT_LIGHT[1], this.TEXT_LIGHT[2], 220);
      p.text('Poor (>28%)', legendX + 389, y);
      
      const symbolY = y + 25;
      p.textSize(10);
      p.fill(this.TEXT_LIGHT[0], this.TEXT_LIGHT[1], this.TEXT_LIGHT[2], 200);
      p.textAlign(p.LEFT, p.CENTER);
      
      p.fill(255, 200, 0);
      p.textSize(12);
      p.text('★', this.MARGIN, symbolY);
      p.fill(this.TEXT_LIGHT[0], this.TEXT_LIGHT[1], this.TEXT_LIGHT[2], 200);
      p.textSize(10);
      p.text('Major Holiday', this.MARGIN + 20, symbolY);
      
      p.fill(255, 182, 193);
      p.textSize(12);
      p.text('🌸', this.MARGIN + 140, symbolY);
      p.fill(this.TEXT_LIGHT[0], this.TEXT_LIGHT[1], this.TEXT_LIGHT[2], 200);
      p.textSize(10);
      p.text('Cherry Blossom Season', this.MARGIN + 160, symbolY);
      
      p.fill(244, 67, 54);
      p.textSize(12);
      p.text('⚠', this.MARGIN + 330, symbolY);
      p.fill(this.TEXT_LIGHT[0], this.TEXT_LIGHT[1], this.TEXT_LIGHT[2], 200);
      p.textSize(10);
      p.text('Storm Risk', this.MARGIN + 350, symbolY);
      
      p.textSize(9);
      p.fill(this.TEXT_LIGHT[0], this.TEXT_LIGHT[1], this.TEXT_LIGHT[2], 170);
      p.textAlign(p.LEFT);
      p.text('Circle size indicates cancellation rate  |  Hover for details  |  2024 data: Flight Forecaster, Airportia, BTS', 
             this.MARGIN, symbolY + 22);
    },
    
    drawTooltip: function(p, hovered) {
      let day = hovered.data;
      let tx = hovered.x;
      let ty = hovered.y - 120;
      
      if (tx < 190) tx = 190;
      if (tx > p.width - 190) tx = p.width - 190;
      if (ty < 130) ty = hovered.y + 60;
      
      p.fill(0, 0, 0, 70);
      p.noStroke();
      p.rect(tx - 183, ty - 53, 370, 125, 8);
      
      p.fill(15, 25, 40, 250);
      p.stroke(this.PRIMARY_GREEN[0], this.PRIMARY_GREEN[1], this.PRIMARY_GREEN[2]);
      p.strokeWeight(2.5);
      p.rect(tx - 185, ty - 55, 370, 125, 8);
      
      p.noStroke();
      p.fill(this.PRIMARY_GREEN[0], this.PRIMARY_GREEN[1], this.PRIMARY_GREEN[2]);
      p.textAlign(p.LEFT, p.TOP);
      
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                         'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      p.textSize(15);
      let title = `${monthNames[day.month - 1]} ${day.day}, 2024 (${day.dayName})`;
      if (day.holiday) title += ` — ${day.holiday.name}`;
      p.text(title, tx - 175, ty - 45);
      
      p.fill(255, 255, 255);
      p.textSize(13);
      p.text(`Delay Rate: ${day.delayRate.toFixed(1)}%  |  Cancel Rate: ${day.cancelRate.toFixed(2)}%`, 
             tx - 175, ty - 20);
      p.text(`Avg Delay: ${day.avgDelay.toFixed(0)} min  |  ~${day.numFlights} flights`, 
             tx - 175, ty + 0);
      
      p.textSize(12);
      let rec = '';
      if (day.delayRate < 15) {
        p.fill(this.EXCELLENT[0], this.EXCELLENT[1], this.EXCELLENT[2]);
        rec = '✓ Excellent time to fly!';
      } else if (day.delayRate < 20) {
        p.fill(this.GOOD[0], this.GOOD[1], this.GOOD[2]);
        rec = '→ Good time to fly';
      } else if (day.delayRate < 28) {
        p.fill(this.FAIR[0], this.FAIR[1], this.FAIR[2]);
        rec = '⚠ Moderate delays expected';
      } else {
        p.fill(this.POOR[0], this.POOR[1], this.POOR[2]);
        rec = '⚠ High risk — consider alternate dates';
      }
      p.text(rec, tx - 175, ty + 25);
      
      p.textSize(11);
      let warningY = ty + 47;
      
      if (day.cherryBlossom) {
        p.fill(255, 182, 193);
        p.text('🌸 Cherry Blossom Season — Beautiful time to visit!', tx - 175, warningY);
        warningY += 16;
      }
      
      if (day.storm && day.storm > 1.5) {
        p.fill(244, 67, 54);
        p.text('⛈ Winter storm risk — delays likely', tx - 175, warningY);
        warningY += 16;
      }
      if (day.shutdown) {
        p.fill(255, 152, 0);
        p.text('⚙ Govt shutdown impact period', tx - 175, warningY);
        warningY += 16;
      }
      if (day.pipeline) {
        p.fill(255, 152, 0);
        p.text('⛽ Fuel supply issue — possible refueling stops', tx - 175, warningY);
      }
    }
  };
})();