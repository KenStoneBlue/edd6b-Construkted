Cesium.ClippingTool = (function () {
    var targetY = 0.0;

    function ClippingTool(options) {
        this._cesiumViewer = options.cesiumViewer;
        this._scene = options.cesiumViewer.scene;

        this._tileset = options.tileset;
        this._screenSpaceHandler = null;

        this._enabled = false;
        this._screenSpaceHandler = null;
        this._selectedClippingPlaneEntity = null;
        this._clippingPlaneEntities = [];

        this._started = new Cesium.Event();
        this._stopped = new Cesium.Event();
    }

    ClippingTool.prototype._initEventHandlers = function() {
        this._screenSpaceHandler = new Cesium.ScreenSpaceEventHandler(this._scene.canvas);

        var self = this;

        this._screenSpaceHandler.setInputAction(function(movement) {
            if(!self._enabled)
                return;

            self._onScreenSpaceLeftDown(movement);
        }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

        this._screenSpaceHandler.setInputAction(function(movement) {
            if(!self._enabled)
                return;

            self._onScreenSpaceMove(movement);
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        this._screenSpaceHandler.setInputAction(function(movement) {
            if(!self._enabled)
                return;

            self._onScreenSpaceLeftUp(movement);
        }, Cesium.ScreenSpaceEventType.LEFT_UP);
    };

    ClippingTool.prototype._onScreenSpaceLeftDown = function(movement) {
        var scene = this._cesiumViewer.scene;

        var pickedObject = scene.pick(movement.position);

        if (Cesium.defined(pickedObject) &&
            Cesium.defined(pickedObject.id) &&
            Cesium.defined(pickedObject.id.plane)) {
            this._selectedClippingPlaneEntity = pickedObject.id.plane;
            this._selectedClippingPlaneEntity.material = Cesium.Color.WHITE.withAlpha(0.05);
            this._selectedClippingPlaneEntity.outlineColor = Cesium.Color.WHITE;

            scene.screenSpaceCameraController.enableInputs = false;
        }
    };

    ClippingTool.prototype._onScreenSpaceMove = function(movement) {
        if (Cesium.defined(this._selectedClippingPlaneEntity)) {
            var deltaY = movement.startPosition.y - movement.endPosition.y;

            targetY += deltaY;
        }
    };

    ClippingTool.prototype._onScreenSpaceLeftUp  = function(movement) {
        if (Cesium.defined(this._selectedClippingPlaneEntity)) {
            this._selectedClippingPlaneEntity.material = Cesium.Color.WHITE.withAlpha(0.1);
            this._selectedClippingPlaneEntity.outlineColor = Cesium.Color.WHITE;
            this._selectedClippingPlaneEntity = undefined;

            this._scene.screenSpaceCameraController.enableInputs = true;
        }
    };

    ClippingTool.prototype._clean = function () {
        var self = this;

        this._clippingPlaneEntities.forEach(function (clipPlaneEntity) {
            self._cesiumViewer.entities.remove(clipPlaneEntity);
        });

        this._clippingPlaneEntities = [];
    };

    function createPlaneUpdateFunction(plane) {
        return function () {
            plane.distance = targetY;
            return plane;
        };
    }

    ClippingTool.prototype.start = function () {
        var clippingPlanes = new Cesium.ClippingPlaneCollection({
            planes : [
                new Cesium.ClippingPlane(new Cesium.Cartesian3(0.0, 0.0, -1.0), 0.0)
            ],
            edgeWidth :  1.0
        });

        var tileset = this._tileset;

        tileset.clippingPlanes = clippingPlanes;

        var boundingSphere = this._tileset.boundingSphere;
        var radius = boundingSphere.radius;

        if (!Cesium.Matrix4.equals(this._tileset.root.transform, Cesium.Matrix4.IDENTITY)) {
            // The clipping plane is initially positioned at the testTileset's root transform.
            // Apply an additional matrix to center the clipping plane on the bounding sphere center.
            var transformCenter = Cesium.Matrix4.getTranslation(testTileset.root.transform, new Cesium.Cartesian3());
            var height = Cesium.Cartesian3.distance(transformCenter, testTileset.boundingSphere.center);

            clippingPlanes.modelMatrix = Cesium.Matrix4.fromTranslation(new Cesium.Cartesian3(0.0, 0.0, height));
        }

        for (var i = 0; i < clippingPlanes.length; ++i) {
            var plane = clippingPlanes.get(i);

            var planeEntity = this._cesiumViewer.entities.add({
                position : boundingSphere.center,
                plane : {
                    dimensions : new Cesium.Cartesian2(radius * 2.5, radius * 2.5),
                    material : Cesium.Color.WHITE.withAlpha(0.1),
                    plane : new Cesium.CallbackProperty(createPlaneUpdateFunction(plane), false),
                    outline : true,
                    outlineColor : Cesium.Color.WHITE
                }
            });

            this._clippingPlaneEntities.push(planeEntity);
        }

        if(this._debug) {

        }

        this._initEventHandlers();
        this._started.raiseEvent();

        this._enabled = true;
    };

    ClippingTool.prototype.stop = function () {
        this._clean();

        targetY = 0.0;

        this._tileset.clippingPlanes.removeAll();

        this._tileset.clippingPlanes = undefined;

        this._screenSpaceHandler.destroy();
        this._screenSpaceHandler = undefined;

        this._stopped.raiseEvent();

        this._enabled = false;
    };

    ClippingTool.prototype.started = function () {
        return this._started;
    };

    ClippingTool.prototype.stopped = function () {
        return this._stopped;
    };

    return ClippingTool;
})();
