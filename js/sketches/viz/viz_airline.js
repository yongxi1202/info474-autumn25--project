// viz_airline.js
// Simple horizontal bar plot visual for 5 most popular airlines to Seattle
(function () {
    var logos = {}; 
    var logosLoaded = false;
    var animationProgress = 0;
    var isAnimating = true;
    
    var logoUrls = {
        'Alaska Airlines': 'https://content.airhex.com/content/logos/airlines_AS_350_100_r.png?theme=dark',
        'Delta': 'https://content.airhex.com/content/logos/airlines_DL_350_100_r.png?theme=dark',
        'SkyWest Airlines': 'https://content.airhex.com/content/logos/airlines_OO_350_100_r.png?theme=light',
        'Horizon Air': 'https://news.alaskaair.com/wp-content/uploads/2024/08/Horizon-Air-2.png',
        'United Airlines': 'https://content.airhex.com/content/logos/airlines_UA_350_100_r.png?theme=dark'
    };

    window.VizAirlines = {
        loadLogos: function(p) {
            if (!logosLoaded) {
                for (var airline in logoUrls) {
                    logos[airline] = p.loadImage(logoUrls[airline], 
                        function() {}, 
                        function() { console.log('Logo failed to load'); }
                    );
                }
                logosLoaded = true;
            }
        },

        draw: function (p, manager, ai, progress) {
            if (!logosLoaded) {
                this.loadLogos(p);
            }

            if (isAnimating) {
                animationProgress += 0.03; 
                if (animationProgress >= 1) {
                    animationProgress = 1;
                    isAnimating = false;
                }
            }

            p.push();
            var airlines = ['Alaska Airlines', 'Delta', 'SkyWest Airlines', 'Horizon Air', 'United Airlines'];
            var flightCounts = [207, 87, 68, 61, 24];
            
            var left = manager.offsetX || 20;
            var top = manager.offsetY || 40;
            var availW = (manager.width || 600) - 40;
            var availH = (manager.height || 400) - 60;
            var rowH = availH / airlines.length;
            var barMaxW = Math.max(60, availW - 120);
            
            var maxCount = Math.max.apply(null, flightCounts);
            
            p.noStroke();
            
            // Title
            p.fill(240);
            p.textAlign(p.CENTER, p.TOP);
            p.textSize(18);
            p.text('Most Popular Airlines to Seattle from 2022 to 2025', (manager.width || 600) / 2, top - 30);

            for (var i = 0; i < airlines.length; i++) {
                var y = top + i * rowH + rowH / 2;
                var logoSize = Math.min(rowH, 80);

                // Draw logo 
                if (logos[airlines[i]] && logos[airlines[i]].width > 0) {
                    p.image(logos[airlines[i]], left, y - logoSize / 2, logoSize, logoSize);;
                }

                var val = flightCounts[i] / maxCount; 
                var targetWidth = val * barMaxW;
                var bw = targetWidth * animationProgress; 
                var bx = left + logoSize + 20;
                var by = y - (rowH * 0.4);
                var bh = rowH * 0.8;

                p.fill('#7FDA89');
                p.rect(bx, by, bw, bh, 4);

                if (animationProgress > 0.2 && bw > 30) {
                    var alpha = Math.min(255, (animationProgress - 0.2) * 255 / 0.8);
                    p.fill(0, 0, 0, alpha);
                    p.textAlign(p.LEFT, p.CENTER);
                    p.textSize(11);
                    p.text(flightCounts[i].toLocaleString() + " flights/day", bx + 6, y);
                }
            }
            p.pop();
        }
    };
})();