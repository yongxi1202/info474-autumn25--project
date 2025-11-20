// viz_title.js
(function () {
    window.VizTitle = {
        draw: function (p, manager, ai, progress) {
            if (ai === 0) {
                return; 
            }
            
            var cx = (manager.offsetX || 0) + (manager.width || 600) / 2;
            var cy = (manager.offsetY || 0) + (manager.height || 520) / 3;
            p.push();
            p.noStroke();
            p.fill(4, 17, 34);
            var w = 420;
            var h = 120;
            p.rect(cx - w / 2, cy - h / 2, w, h, 6);
            
            p.textFont('Unbounded');
            p.fill('#E6F99D');
            
            p.textAlign(p.CENTER, p.CENTER);
            p.textSize(48);
            p.text('INFO474: Final Project', cx, cy);
            p.pop();
        }
    };
})();