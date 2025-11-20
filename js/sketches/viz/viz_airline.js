// viz_airline.js
// Simple horizontal bar plot visual for 5 most popular airlines to Seattle
(function () {
    window.VizAirlines = {
        draw: function (p, manager, ai, progress) {
            p.push();
            var airlines = ['Alaska Airlines', 'Delta', 'SkyWest Airlines', 'Horizon Air', 'United Airlines'];
            var flightCounts = [263371, 110030, 85755, 77239, 29882];
            
            var left = manager.offsetX || 20;
            var top = manager.offsetY || 40;
            var availW = (manager.width || 600) - 40;
            var availH = (manager.height || 400) - 60;
            var rowH = availH / airlines.length;
            var barMaxW = Math.max(60, availW - 180);
            
            // Find max for scaling
            var maxCount = Math.max.apply(null, flightCounts);
            
            p.noStroke();
            
            // Title
            p.fill(240);
            p.textAlign(p.CENTER, p.TOP);
            p.textSize(18);
            p.text('Most Popular Airlines to Seattle', (manager.width || 600) / 2, top - 30);

            p.textAlign(p.LEFT, p.CENTER);
            p.textSize(13);

            for (var i = 0; i < airlines.length; i++) {
                var y = top + i * rowH + rowH / 2;
                p.fill(240);
                p.text(airlines[i], left, y);

                var val = flightCounts[i] / maxCount; // normalize to 0-1
                var bw = val * barMaxW;
                var bx = left + 160;
                var by = y - (rowH * 0.4);
                var bh = rowH * 0.8;
                p.fill(80, 150, 200, 220);
                p.rect(bx, by, bw, bh, 4);

                p.fill(255);
                p.textAlign(p.LEFT, p.CENTER);
                p.textSize(11);
                p.text(flightCounts[i].toLocaleString(), bx + 6, y);
            }
            p.pop();
        }
    };
})();