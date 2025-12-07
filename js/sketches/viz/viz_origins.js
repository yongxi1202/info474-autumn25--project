(function () {
    window.VizOrigins = {
        draw: function (p, manager, ai, progress) {
            var cols = manager.width || 800;
            var rows = manager.height || 600;
            var offsetX = manager.offsetX || 0;
            var offsetY = manager.offsetY || 0;

            if (!manager._routesData) {
                manager._routesData = {
                    seattle: { 
                        city: "Seattle", 
                        code: "SEA", 
                        x: 220,  
                        y: 380   
                    },
                    routes: [
                        { 
                            city: "Portland", code: "PDX",
                            x: 210,  
                            y: 400,  
                            totalFlights: 27640,
                            avgFlights: 659, rank: 1,
                            airlines: [
                                { name: "SkyWest Airlines", count: 10554 },
                                { name: "Horizon Air", count: 8447 },
                                { name: "Alaska Airlines", count: 6754 }
                            ]
                        },
                        { 
                            city: "Anchorage", code: "ANC",
                            x: 140,  
                            y: 135,  
                            totalFlights: 25645,
                            avgFlights: 611, rank: 2,
                            airlines: [
                                { name: "Alaska Airlines", count: 19681 },
                                { name: "Delta", count: 5593 },
                                { name: "Horizon Air", count: 334 }
                            ]
                        },
                        { 
                            city: "Los Angeles", code: "LAX",
                            x: 230,  
                            y: 530,  
                            totalFlights: 25472,
                            avgFlights: 607, rank: 3,
                            airlines: [
                                { name: "Alaska Airlines", count: 11808 },
                                { name: "Delta", count: 7668 },
                                { name: "SkyWest Airlines", count: 3201 }
                            ]
                        },
                        { 
                            city: "Phoenix", code: "PHX",
                            x: 285,  
                            y: 555,  
                            totalFlights: 24199,
                            avgFlights: 577, rank: 4,
                            airlines: [
                                { name: "Alaska Airlines", count: 10287 },
                                { name: "Delta", count: 5858 },
                                { name: "Southwest", count: 3383 }
                            ]
                        },
                        { 
                            city: "Spokane", code: "GEG",
                            x: 255,  
                            y: 380,  
                            totalFlights: 23850,
                            avgFlights: 568, rank: 5,
                            airlines: [
                                { name: "SkyWest Airlines", count: 10476 },
                                { name: "Horizon Air", count: 6782 },
                                { name: "Alaska Airlines", count: 5683 }
                            ]
                        },
                        { 
                            city: "San Francisco", code: "SFO",
                            x: 210,  
                            y: 480,  
                            totalFlights: 23518,
                            avgFlights: 560, rank: 6,
                            airlines: [
                                { name: "Alaska Airlines", count: 10304 },
                                { name: "United Airlines", count: 6140 },
                                { name: "SkyWest Airlines", count: 3871 }
                            ]
                        },
                        { 
                            city: "Las Vegas", code: "LAS",
                            x: 265,  
                            y: 510,  
                            totalFlights: 23082,
                            avgFlights: 550, rank: 7,
                            airlines: [
                                { name: "Alaska Airlines", count: 9359 },
                                { name: "Delta", count: 6083 },
                                { name: "Southwest", count: 3487 }
                            ]
                        },
                        { 
                            city: "Denver", code: "DEN",
                            x: 340,  
                            y: 475,  
                            totalFlights: 22480,
                            avgFlights: 536, rank: 8,
                            airlines: [
                                { name: "United Airlines", count: 6637 },
                                { name: "Alaska Airlines", count: 5403 },
                                { name: "Southwest", count: 5174 }
                            ]
                        },
                        { 
                            city: "Boise", code: "BOI",
                            x: 258,  
                            y: 420,  
                            totalFlights: 19126,
                            avgFlights: 456, rank: 9,
                            airlines: [
                                { name: "SkyWest Airlines", count: 10771 },
                                { name: "Horizon Air", count: 5962 },
                                { name: "Alaska Airlines", count: 2359 }
                            ]
                        },
                        { 
                            city: "Chicago", code: "ORD",
                            x: 450,  
                            y: 420,  
                            totalFlights: 17173,
                            avgFlights: 409, rank: 10,
                            airlines: [
                                { name: "Alaska Airlines", count: 6318 },
                                { name: "United Airlines", count: 5169 },
                                { name: "Delta", count: 3180 }
                            ]
                        }
                    ]
                };

                var data = manager._routesData;
                data.seattlePos = { x: offsetX + data.seattle.x, y: offsetY + data.seattle.y };
                
                for (var i = 0; i < data.routes.length; i++) {
                    data.routes[i].pos = { 
                        x: offsetX + data.routes[i].x, 
                        y: offsetY + data.routes[i].y 
                    };
                }

                manager._hoveredRoute = -1;
                manager._selectedRoute = -1;
                manager._animOffset = 0;

                manager._mapImage = p.loadImage('assets/map.png');
            }

            p.image(manager._mapImage, offsetX, offsetY, cols, rows);
      
            //add title
            p.fill(15, 23, 42, 180);
            p.noStroke();
            p.rect(offsetX, offsetY, cols, 70, 0);
            
            p.textAlign(p.CENTER, p.CENTER);
            p.textSize(24);
            p.fill(255);
            p.text("Popular Routes to Seattle", offsetX + cols / 2, offsetY + 30);
            
            p.textSize(12);
            p.fill(147, 197, 253);
            p.text("Hover over cities for more details", offsetX + cols / 2, offsetY + 50);

            var data = manager._routesData;
            manager._animOffset = (manager._animOffset + 0.01) % 1;

            var mx = p.mouseX;
            var my = p.mouseY;
            var newHovered = -1;
            
            for (var i = 0; i < data.routes.length; i++) {
                var route = data.routes[i];
                var d = p.dist(mx, my, route.pos.x, route.pos.y);
                if (d < 15) {
                    newHovered = i;
                    break;
                }
            }
            manager._hoveredRoute = newHovered;
            
            // Draw routes
            for (var i = 0; i < data.routes.length; i++) {
                var route = data.routes[i];
                var isActive = (i === manager._hoveredRoute || i === manager._selectedRoute);
                
                var startX = route.pos.x;
                var startY = route.pos.y;
                var endX = data.seattlePos.x;
                var endY = data.seattlePos.y;
                var ctrlX = (startX + endX) / 2;
                var ctrlY = Math.min(startY, endY) - 50;

                p.noFill();
                if (isActive) {
                    p.stroke(96, 165, 250, 255);
                    p.strokeWeight(3);
                } else {
                    p.stroke(59, 130, 246, 100);
                    p.strokeWeight(1.5);
                }

                p.beginShape();
                for (var t = 0; t <= 1; t += 0.05) {
                    var x = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * ctrlX + t * t * endX;
                    var y = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * ctrlY + t * t * endY;
                    p.vertex(x, y);
                }
                p.endShape();

                if (isActive) {
                    for (var a = 0; a < 3; a++) {
                        var tAnim = (manager._animOffset + a * 0.33) % 1;
                        var xAnim = (1 - tAnim) * (1 - tAnim) * startX + 2 * (1 - tAnim) * tAnim * ctrlX + tAnim * tAnim * endX;
                        var yAnim = (1 - tAnim) * (1 - tAnim) * startY + 2 * (1 - tAnim) * tAnim * ctrlY + tAnim * tAnim * endY;
                        
                        p.noStroke();
                        p.fill(96, 165, 250, 200);
                        p.ellipse(xAnim, yAnim, 6, 6);
                    }
                }
            }

            // Origin labels
            for (var i = 0; i < data.routes.length; i++) {
                var route = data.routes[i];
                var isActive = (i === manager._hoveredRoute || i === manager._selectedRoute);
                var pos = route.pos;

                if (isActive) {
                    p.noStroke();
                    p.fill(59, 130, 246, 50);
                    p.ellipse(pos.x, pos.y, 40, 40);
                }

                p.strokeWeight(2);
                p.stroke(255);
                p.fill(isActive ? 96 : 59, isActive ? 165 : 130, 246);
                var radius = isActive ? 12 : 8;
                p.ellipse(pos.x, pos.y, radius, radius);

                var labelOffsetY = -15;
                var labelAlign = p.CENTER;
                
                if (route.code === "PDX") {
                    labelOffsetY = -10;
                } else if (route.code === "LAX") {
                    labelOffsetY = 20;
                } else if (route.code === "PHX") {
                    labelOffsetY = 20;
                } 

                p.noStroke();
                p.textAlign(labelAlign);
                p.textSize(isActive ? 13 : 11);
                p.fill(isActive ? 96 : 203, isActive ? 165 : 213, isActive ? 250 : 225);
                p.text(route.city, pos.x, pos.y + labelOffsetY);
            }

            // Seattle label
            var seaPos = data.seattlePos;
            
            var pulseSize = 20 + Math.sin(p.frameCount * 0.05) * 10;
            p.noStroke();
            p.fill(239, 68, 68, 40);
            p.ellipse(seaPos.x, seaPos.y, pulseSize, pulseSize);

            p.strokeWeight(2);
            p.stroke(255);
            p.fill(239, 68, 68);
            p.ellipse(seaPos.x, seaPos.y, 10, 10);

            p.noStroke();
            p.textAlign(p.CENTER);
            p.textSize(14);
            p.fill(255);
            p.text("Seattle", seaPos.x - 8, seaPos.y - 10);

            // Tooltip for hovered route
            if (manager._hoveredRoute >= 0) {
                var route = data.routes[manager._hoveredRoute];
                
                var tooltipX = mx + 15;
                var tooltipY = my - 85;
                var tooltipW = 265;
                var tooltipH = 180;

                if (tooltipX + tooltipW > offsetX + cols) {
                    tooltipX = mx - tooltipW - 15;
                }
                if (tooltipY < offsetY) {
                    tooltipY = my + 15;
                }

                p.fill(30, 41, 59, 250);
                p.stroke(96, 165, 250);
                p.strokeWeight(2.5);
                p.rect(tooltipX, tooltipY + 5, tooltipW, tooltipH, 5);

                p.noStroke();
                p.textAlign(p.LEFT);
                p.textSize(18);
                p.fill(96, 165, 250);
                p.text(route.city + " → Seattle", tooltipX + 10, tooltipY + 20);
                
                p.textSize(14);
                p.fill(147, 197, 253);
                p.text("Total Flights: " + route.totalFlights + "*", tooltipX + 10, tooltipY + 40);
                p.text("Avg Monthly Flights: " + route.avgFlights, tooltipX + 10, tooltipY + 58);

                p.textSize(14);
                p.fill(203, 213, 225);
                p.text("Top Airlines:", tooltipX + 10, tooltipY + 78);
                
                var airlineY = tooltipY + 95;
                for (var a = 0; a < Math.min(3, route.airlines.length); a++) {
                    var airline = route.airlines[a];
                    p.textSize(13);
                    p.fill(148, 163, 184);
                    p.text("• " + airline.name, tooltipX + 15, airlineY);
                    p.textAlign(p.RIGHT);
                    p.fill(96, 165, 250);
                    p.text(airline.count + "*", tooltipX + tooltipW - 15, airlineY);
                    p.textAlign(p.LEFT);
                    airlineY += 15;
                }

                p.text("*The number represents the count of flights \n operated by the airline from 2022 to 2025.", 
                    tooltipX + 10, tooltipY + 160);
            }
        },
    };
})();
