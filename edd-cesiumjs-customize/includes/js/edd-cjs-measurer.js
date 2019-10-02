Cesium.MeasurerTool = (function () {
    function MeasurerTool(options) {
        this._cesiumViewer = options.cesiumViewer;
        this._scene = options.cesiumViewer.scene;

        this._tileset = options.tileset;
        this._screenSpaceHandler = null;

        this._enabled = false;

        this._firstPointCartesian = null;
        this._secondPointCartesian = null;

        this._firstPointEntity = null;
        this._secondPointEntity = null;
        this._polylineEntity = null;

        this._pointEntityPixelSize = 15;
        this._debug = false;

        this._axisForDebug = null;

        this._lineSegmentCalculated = new Cesium.Event();

        this._initEventHandlers();
    }

    MeasurerTool.prototype._disableDefaultCameraController = function () {
        var scene = this._cesiumViewer.scene;

        // disable the default event handlers

        scene.screenSpaceCameraController.enableRotate = false;
        scene.screenSpaceCameraController.enableTranslate = false;
        scene.screenSpaceCameraController.enableTilt = false;
        scene.screenSpaceCameraController.enableLook = false;
    };

    MeasurerTool.prototype._enableDefaultCameraController = function () {
        var scene = this._cesiumViewer.scene;

        // disable the default event handlers

        scene.screenSpaceCameraController.enableRotate = true;
        scene.screenSpaceCameraController.enableTranslate = true;
        scene.screenSpaceCameraController.enableTilt = true;
        scene.screenSpaceCameraController.enableLook = true;
    };

    MeasurerTool.prototype._initEventHandlers = function() {
        this._screenSpaceHandler = new Cesium.ScreenSpaceEventHandler(this._scene.canvas);

        var self = this;

        this._screenSpaceHandler.setInputAction(function(movement) {
            if(!self._enabled)
                return;

            self._onScreenSpaceLeftDown(movement);
        }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
    };

    MeasurerTool.prototype._addFirstPointEntity = function(cartesian) {
        var pixelSize = this._pointEntityPixelSize;

        this._firstPointEntity = this._cesiumViewer.entities.add({
            name : 'first point',
            position: cartesian,
            point : {
                pixelSize : pixelSize,
                color: Cesium.Color.RED,
                // disableDepthTestDistance: Number.POSITIVE_INFINITY
            }
        });
    };

    MeasurerTool.prototype._addSecondPointEntity = function(cartesian) {
        var pixelSize = this._pointEntityPixelSize;

        var that = this;

        this._secondPointEntity = this._cesiumViewer.entities.add({
            name : 'first point',
            position: new Cesium.CallbackProperty(function () {
                return that._secondPointCartesian;
            }, false),
            point : {
                pixelSize : pixelSize,
                color: Cesium.Color.RED,
                // disableDepthTestDistance: Number.POSITIVE_INFINITY
            }
        });
    };

    MeasurerTool.prototype._addPolylineEntity = function() {
        var that = this;

        this._polylineEntity = this._cesiumViewer.entities.add({
            name : 'line',

            polyline : {
                positions: [that._firstPointCartesian, that._secondPointCartesian],

                width : 5,
                //depthFailMaterial : Cesium.Color.GREEN,
                arcType : Cesium.ArcType.NONE,
                material : Cesium.Color.GREEN
            }
        });
    };

    MeasurerTool.prototype._getCartesianFromWindowPosition = function(position) {
        var scene = this._scene;

        scene.globe.depthTestAgainstTerrain = true;

        var pickRay = scene.camera.getPickRay(position);

        var result = scene.pickFromRay(pickRay);

        if(result)
            return result.position;
        else
            return null;
    };

    MeasurerTool.prototype._onScreenSpaceLeftDown = function(movement) {
        this._leftDown = true;

        var cartesian = this._getCartesianFromWindowPosition(movement.position);

        if (cartesian == null) {
            console.info("Failed to get position! Please retry.");
            return;
        }

        if(this._firstPointCartesian === null && this._secondPointCartesian === null ) {
            this._firstPointCartesian = cartesian;
            this._addFirstPointEntity(cartesian);
            this._scene.screenSpaceCameraController.enableInputs = false;
        }
        else if (this._firstPointCartesian && this._secondPointCartesian  ) {
            this._clean();

            this._firstPointCartesian = cartesian;
            this._addFirstPointEntity(cartesian);
            this._scene.screenSpaceCameraController.enableInputs = false;
        }
        else if (this._firstPointCartesian !== null && this._secondPointCartesian === null) {
            this._secondPointCartesian = cartesian;

            this._addSecondPointEntity(cartesian);
            this._addPolylineEntity();
            this._calc();
            this._scene.screenSpaceCameraController.enableInputs = true;
        }
        else {
            console.error("unreachable code!");
        }
    };

    MeasurerTool.prototype.start = function () {
        this._enabled = true;
        this._disableDefaultCameraController();

        if(this._debug) {
            var boundingSphere = this._tileset.boundingSphere;
            var center = boundingSphere.center;

            var tilsetTransform = Cesium.Transforms.eastNorthUpToFixedFrame(center);

            this._axisForDebug = viewer.scene.primitives.add(new Cesium.DebugModelMatrixPrimitive({
                modelMatrix : tilsetTransform,
                length : 300.0,
                width : 5.0
            }));
        }
    };

    MeasurerTool.prototype.stop = function () {
        this._enabled = false;
        this._enableDefaultCameraController();
        this._clean();

        if(this._axisForDebug) {
            this._scene.primitives.remove(this._axisForDebug);
            this._axisForDebug = null;
        }
    };

    MeasurerTool.prototype._clean = function () {
        this._cesiumViewer.entities.remove(this._firstPointEntity);
        this._cesiumViewer.entities.remove(this._secondPointEntity);
        this._cesiumViewer.entities.remove(this._polylineEntity);

        this._firstPointEntity = null;
        this._secondPointEntity = null;
        this._polylineEntity = null;

        this._firstPointCartesian = null;
        this._secondPointCartesian = null;
    };

    MeasurerTool.prototype._calc = function () {
        var boundingSphere = this._tileset.boundingSphere;

        var center = boundingSphere.center;

        var tilsetTransform = Cesium.Transforms.eastNorthUpToFixedFrame(center);

        var invTransform = Cesium.Matrix4.inverseTransformation(tilsetTransform, new Cesium.Matrix4());

        var convertedFirstPoint = Cesium.Matrix4.multiplyByPoint(invTransform, this._firstPointCartesian, new Cesium.Cartesian3());
        var convertedSecondPoint = Cesium.Matrix4.multiplyByPoint(invTransform, this._secondPointCartesian, new Cesium.Cartesian3());

        var displacementVector = new Cesium.Cartesian3();

        displacementVector = Cesium.Cartesian3.subtract(convertedSecondPoint, convertedFirstPoint, displacementVector);

        var dist = Cesium.Cartesian3.magnitude(displacementVector);

        var xComponent = displacementVector.x;
        var yComponent = displacementVector.y;
        var zComponent = displacementVector.z;

        this._lineSegmentCalculated.raiseEvent(dist, xComponent, yComponent, zComponent);
    };

    MeasurerTool.prototype.lineSegmentCalculated = function () {
        return this._lineSegmentCalculated;
    };

    return MeasurerTool;
})();
