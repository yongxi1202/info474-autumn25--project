(function() {
  window.VizDelayCalendar = {
    
    monthlyData: {},
    realData: null, 
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
    BASE_CIRCLE_SPACING: 16, 
    WEEK_GAP: 6, 

    init: function() {
      if (this.loaded) return;
      
      this.loadRealData();
      this.loaded = true;
    },
    
    draw: function(p, manager, ai, progress) {
      if (!this.loaded) this.init();
      
      if (!this.realData) {
        p.background(this.BG_COLOR[0], this.BG_COLOR[1], this.BG_COLOR[2]);
        p.fill(this.PRIMARY_GREEN[0], this.PRIMARY_GREEN[1], this.PRIMARY_GREEN[2]);
        p.textSize(24);
        p.textAlign(p.CENTER, p.CENTER);
        p.text('Loading real flight data...', p.width/2, p.height/2);
        return;
      }
      
      p.background(this.BG_COLOR[0], this.BG_COLOR[1], this.BG_COLOR[2]);
      
      p.fill(this.PRIMARY_GREEN[0], this.PRIMARY_GREEN[1], this.PRIMARY_GREEN[2]);
      p.textSize(32);
      p.textAlign(p.CENTER);
      p.textFont('Unbounded');
      p.fill(200, 220, 228);
      p.text('When Should You Fly to Seattle?', p.width/2, 42);
      
      p.textFont('Azeret Mono');
      p.textSize(15);
      p.fill(this.TEXT_LIGHT[0], this.TEXT_LIGHT[1], this.TEXT_LIGHT[2]);
      p.text('Flight Delay & Cancellation Calendar — Real 2024 Data', p.width/2, 68);
      
      this.drawCalendar(p);
      this.drawLegend(p);
    },
    
    loadRealData: function() {
      const self = this;
      
      fetch('data/seattle_delays_2024.json')
        .then(response => response.json())
        .then(data => {
          self.realData = data;
          self.processRealData(data);
        })
        .catch(error => {
          self.generateDemoData();
        });
    },
    
    processRealData: function(data) {
      const self = this;
      
      const holidays = {
        '01-01': 'New Year\'s Day',
        '01-15': 'MLK Day',
        '02-19': 'Presidents Day',
        '05-27': 'Memorial Day',
        '07-04': 'Independence Day',
        '09-02': 'Labor Day',
        '11-27': 'Thanksgiving Eve',
        '11-28': 'Thanksgiving',
        '11-29': 'Black Friday',
        '12-01': 'Thanksgiving Return',
        '12-21': 'Pre-Christmas Rush',
        '12-22': 'Christmas Peak',
        '12-23': 'Christmas Eve Eve',
        '12-24': 'Christmas Eve',
        '12-25': 'Christmas Day',
        '12-26': 'Post-Christmas',
        '12-31': 'New Year\'s Eve'
      };
      
      const cherryBlossomDates = [
        '03-25', '03-26', '03-27', '03-28', '03-29', '03-30', '03-31',
        '04-01', '04-02', '04-03', '04-04', '04-05', '04-06', '04-07',
        '04-08', '04-09', '04-10', '04-11', '04-12', '04-13', '04-14'
      ];
      
      let minDelay = Infinity;
      let maxDelay = -Infinity;
      let allDays = [];
      
      data.forEach(dayRecord => {
        let monthStr = String(dayRecord.month).padStart(2, '0');
        
        if (!self.monthlyData[monthStr]) {
          self.monthlyData[monthStr] = [];
        }
        
        let [year, month, day] = dayRecord.date.split('-');
        let dateKey = `${month}-${day}`;
        
        let fullDate = new Date(2024, dayRecord.month - 1, parseInt(day));
        let dayOfWeek = fullDate.getDay();
        
        let dayData = {
          month: dayRecord.month,
          day: parseInt(day),
          dayOfWeek: dayOfWeek, 
          delayRate: dayRecord['delay_rate_%'],
          cancelRate: dayRecord['cancel_rate_%'],
          avgDelay: dayRecord.avg_delay_min,
          numFlights: dayRecord.num_flights,
          dayName: dayRecord.day_of_week.substring(0, 3), 
          holiday: holidays[dateKey] || null,
          cherryBlossom: cherryBlossomDates.includes(dateKey),
          dateString: dateKey,
          storm: dayRecord['cancel_rate_%'] > 5.0 ? dayRecord['cancel_rate_%'] : null
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
      });
      
      allDays.sort((a, b) => a.delayRate - b.delayRate);
      self.top5Best = allDays.slice(0, 5);
      self.top5Worst = allDays.slice(-5).reverse();
    },
    
    generateDemoData: function() {
      const self = this;
      
      const monthlyAverages = {
        1: 20.04, 2: 11.39, 3: 15.98, 4: 15.72, 5: 21.32, 6: 25.65,
        7: 23.72, 8: 22.72, 9: 17.11, 10: 12.26, 11: 12.49, 12: 16.84
      };
      
      for (let month = 1; month <= 12; month++) {
        let monthStr = String(month).padStart(2, '0');
        self.monthlyData[monthStr] = [];
        
        let daysInMonth = new Date(2024, month, 0).getDate();
        let baseRate = monthlyAverages[month];
        
        for (let day = 1; day <= daysInMonth; day++) {
          let date = new Date(2024, month - 1, day);
          let dayOfWeek = date.getDay();
          
          let dayData = {
            month: month,
            day: day,
            dayOfWeek: dayOfWeek,
            delayRate: baseRate + (Math.random() - 0.5) * 8,
            cancelRate: (baseRate / 20) + (Math.random() - 0.5) * 0.5,
            avgDelay: (baseRate / 17.0) * 55,
            numFlights: 400,
            dayName: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayOfWeek],
            holiday: null,
            cherryBlossom: false,
            storm: null,
            dateString: `${monthStr}-${String(day).padStart(2, '0')}`
          };
          
          self.monthlyData[monthStr].push(dayData);
        }
      }
      
      self.realData = { demo: true };
    },
    
   
    calculateDayXPosition: function(daysInMonth, dayIndex) {
      let x = 0;
      
      for (let i = 0; i < dayIndex; i++) {
        
        x += this.BASE_CIRCLE_SPACING;
        
        let dayNumber = i + 1; 
        if (dayNumber % 7 === 0) {
          x += this.WEEK_GAP;
        }
      }
      
      return x;
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
        
        let baseX = startX;
        let y = startY + monthIdx * rowHeight;
        
      
        p.fill(this.PRIMARY_GREEN[0], this.PRIMARY_GREEN[1], this.PRIMARY_GREEN[2]);
        p.textSize(13);
        p.textAlign(p.RIGHT, p.CENTER);
        p.text(months[monthIdx], baseX - 12, y);
        
        let daysInMonth = this.monthlyData[monthStr];
        
        if (daysInMonth && daysInMonth.length > 0) {
          this.drawWeekSeparatorsForMonth(p, baseX, y, daysInMonth, rowHeight);
          
          for (let d = 0; d < daysInMonth.length; d++) {
            let dayData = daysInMonth[d];
            
           
            let cx = baseX + this.calculateDayXPosition(daysInMonth, d);
            let cy = y;
            
           
            let sizeBoost = p.map(dayData.cancelRate, 0, 5, 0, 4);
            sizeBoost = Math.min(sizeBoost, 4);
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
            
           
            if (dayData.storm) {
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
    
    drawWeekSeparatorsForMonth: function(p, startX, y, daysInMonth, rowHeight) {
      p.stroke(this.TEXT_LIGHT[0], this.TEXT_LIGHT[1], this.TEXT_LIGHT[2], 60); 
      p.strokeWeight(1.5); 
      
      for (let d = 0; d < daysInMonth.length - 1; d++) {
      
        let dayNumber = d + 1; 
        
        if (dayNumber % 7 === 0) {
          let currentX = startX + this.calculateDayXPosition(daysInMonth, d);
          let nextX = startX + this.calculateDayXPosition(daysInMonth, d + 1);
   
          let lineX = currentX + (nextX - currentX) / 2;
          
          p.line(lineX, y - rowHeight / 2 + 5, lineX, y + rowHeight / 2 - 5);
        }
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
      p.text('High Cancellation', this.MARGIN + 350, symbolY);
      
    
      p.textSize(11);
      p.fill(this.TEXT_LIGHT[0], this.TEXT_LIGHT[1], this.TEXT_LIGHT[2], 220);
      p.textAlign(p.LEFT);
      p.text('Circle size = cancellation rate  |  Hover for details  |  Real 2024 data from BTS via Kaggle', 
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
      if (day.holiday) title += ` — ${day.holiday}`;
      p.text(title, tx - 175, ty - 45);
      
     
      p.fill(255, 255, 255);
      p.textSize(13);
      p.text(`Delay Rate: ${day.delayRate.toFixed(1)}%  |  Cancel Rate: ${day.cancelRate.toFixed(2)}%`, 
             tx - 175, ty - 20);
      p.text(`Avg Delay: ${day.avgDelay.toFixed(0)} min  |  ${day.numFlights} flights`, 
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
      
      if (day.storm) {
        p.fill(244, 67, 54);
        p.text(`⚠ High cancellation rate (${day.cancelRate.toFixed(1)}%) — weather likely`, tx - 175, warningY);
      }
    }
  };
})();