// sketch_renderer.js

// Responsible for rendering the main visualization based on the current active index
(function () {
    window.Renderer = {

        setData: function (manager) {
            var self = this;

            manager.offsetX = (manager.margin && manager.margin.left) || 20;
            manager.offsetY = (manager.margin && manager.margin.top) || 0;

            function computeLayout(data) {
                manager.data = data;
            }

            computeLayout([]);
            return Promise.resolve(manager.data);
        },

        draw: function (p, manager, ai, progress) {
            try { console.log('Renderer: delegating draw, ai=', ai); } catch (e) { }
            
            let visContainer = document.getElementById('vis');
            if (ai >= 12) {
                if (visContainer) {
                    visContainer.style.display = 'none';
                    visContainer.classList.add('vis-completely-hidden');
                    visContainer.classList.remove('vis-visible');
                }
                p.clear();
                return;
            } else {
                if (visContainer) {
                    visContainer.style.display = '';
                    visContainer.classList.remove('vis-completely-hidden');
                }
            }
            
            p.clear();

            if (ai === 1 || ai === 2) {
                window.VizTravel.draw(p, manager, ai, progress);
                return;
            }

            if (ai === 3) {
                window.VizOrigins.draw(p, manager, ai, progress);
                return;
            }

            if (ai === 4 || ai === 5) {
                window.VizAirlines.draw(p, manager, ai, progress);
                return;
            }
        
            if (ai === 6 || ai === 7) {
                window.VizC.draw(p, manager, ai, progress);
                return;
            }

            if (ai === 8 || ai === 9) {
                window.VizPricing.draw(p, manager, ai, progress);
                return;
            }

            if (ai === 10 || ai === 11) {
                window.VizDelayCalendar.draw(p, manager, ai, progress);
                return;
            }
            
        }
    };
})();