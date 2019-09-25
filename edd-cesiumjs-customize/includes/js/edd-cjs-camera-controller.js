var EDD_CJS = {};

EDD_CJS.CameraController = (function () {
    // this mean person is stop
    var DIRECTION_NONE = -1;

    var DIRECTION_FORWARD = 0;
    var DIRECTION_BACKWARD = 1;
    var DIRECTION_LEFT = 2;
    var DIRECTION_RIGHT = 3;

    var HEADING_DIRECTION_NONE = -1;

    var HEADING_DIRECTION_LEFT = 1;
    var HEADING_DIRECTION_RIGHT = 2;

    var DEFAULT_HUMAN_WALKING_SPEED = 0.5;

    var MAX_PITCH_IN_DEGREE = 88;
    var ROTATE_SPEED = -5;
    var HEADING_CHANGE_SPEED = -5;
    var COLLISION_RAY_HEIGHT = 0.5;
    var HUMAN_EYE_HEIGHT = 1.65;

    //constructor
    function CameraController(options) {
        this._enabled = false;
        this._exitFPVModeButtonId = options.exitFPVModeButtonId;

        this._cesiumViewer = options.cesiumViewer;
        this._canvas = this._cesiumViewer.canvas;
        this._camera = this._cesiumViewer.camera;

        this._direction = DIRECTION_NONE;
        this._headingDirection = HEADING_DIRECTION_NONE;

        this._main3dTileset = options.main3dTileset;
        this._enabledFPV = true;

        /**
         * heading: angle with up direction
         * pitch:   angle with right direction
         * roll:    angle with look at direction
         */

        // indicate if heading and pitch is changed
        this._isMouseLeftButtonPressed = false;

        this._frameMonitor = Cesium.FrameRateMonitor.fromScene(this._cesiumViewer.scene);

        this._init();

        // finally we show toolbar

        $('#' + this._exitFPVModeButtonId).hide();

        this._connectEventHandlers();
    }

    CameraController.prototype._init = function () {
        var canvas = this._cesiumViewer.canvas;

        this._startMousePosition = null;
        this._mousePosition = null;

        this._screenSpaceHandler = new Cesium.ScreenSpaceEventHandler(canvas);

        var self = this;

        this._screenSpaceHandler.setInputAction(function(movement) {
            self._onMouseLButtonClicked(movement);
        }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

        this._screenSpaceHandler.setInputAction(function(movement) {
            self._onMouseLButtonDoubleClicked(movement);
        }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

        this._screenSpaceHandler.setInputAction(function(movement) {
            self._onMouseMove(movement);
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        this._screenSpaceHandler.setInputAction(function(movement) {
            self._onMouseUp(movement);
        }, Cesium.ScreenSpaceEventType.LEFT_UP);

        // needed to put focus on the canvas
        canvas.setAttribute('tabindex', '0');

        canvas.onclick = function() {
            canvas.focus();
        };

        document.addEventListener('keydown', function(e) {
            self._onKeyDown(e.keyCode);
        }, false);

        document.addEventListener('keyup', function(e) {
            self._onKeyUp(e.keyCode);
        }, false);

        this._cesiumViewer.clock.onTick.addEventListener(function(clock) {
            self._onClockTick(clock);
        });
    };

    CameraController.prototype._enable = function (cartographic) {
        var globe = this._cesiumViewer.scene.globe;

        $('#' + this._exitFPVModeButtonId).show();

        this._enabled = true;

        this._disableDefaultCameraController();

        this._camera.flyTo({
            destination : globe.ellipsoid.cartographicToCartesian(cartographic),
            orientation : {
                heading : 0,
                pitch :  -0.5,
                roll : 0.0
            }
        });

        return true;
    };

    CameraController.prototype._disable = function () {
        this._enabled = false;

        var scene = this._cesiumViewer.scene;

        // enable the default event handlers

        scene.screenSpaceCameraController.enableRotate = true;
        scene.screenSpaceCameraController.enableTranslate = true;
        scene.screenSpaceCameraController.enableZoom = true;
        scene.screenSpaceCameraController.enableTilt = true;
        scene.screenSpaceCameraController.enableLook = true;
    };

    CameraController.prototype._onKeyDown = function (keyCode) {
        this._direction = DIRECTION_NONE;

        switch (keyCode) {
            case 'W'.charCodeAt(0):
                this._direction = DIRECTION_FORWARD;
                return;
            case 'S'.charCodeAt(0):
                this._direction = DIRECTION_BACKWARD;
                return;
            case 'Q'.charCodeAt(0):
                return 'moveUp';
            case 'E'.charCodeAt(0):
                return 'moveDown';
            case 'D'.charCodeAt(0):
                // this._headingDirection = HEADING_DIRECTION_RIGHT;  //Rotate camera to the right with key press "D"
                this._direction = DIRECTION_RIGHT;  // Move camera right with key press "D"
                return;
            case 'A'.charCodeAt(0):
                // this._headingDirection = HEADING_DIRECTION_LEFT;  //Rotate camera to the left with key press "A"
                this._direction = DIRECTION_LEFT;  // Move camera left with key press "A"
                return;
            case 90: // z
                if(this._main3dTileset)
                    this._main3dTileset.show = !this._main3dTileset.show;
                return;
            default:
                return undefined;
        }
    };

    //noinspection JSUnusedLocalSymbols
    CameraController.prototype._onKeyUp = function (keyCode) {
        this._direction = DIRECTION_NONE;
        this._headingDirection = HEADING_DIRECTION_NONE;
    };

    CameraController.prototype._onMouseLButtonClicked = function (movement) {
        this._isMouseLeftButtonPressed = true;
        this._mousePosition = this._startMousePosition = Cesium.Cartesian3.clone(movement.position);
    };

    CameraController.prototype._enterFPV1 = function(movement) {
        var position = this._cesiumViewer.scene.pickPosition(movement.position);

        if(position === undefined)
            return;

        var globe = this._cesiumViewer.scene.globe;

        var cartographic = globe.ellipsoid.cartesianToCartographic(position);

        // consider terrain height
        var terrainHeight = globe.getHeight(cartographic);

        // determine we clicked out of main 3d tileset
        if (Cesium.Math.equalsEpsilon(cartographic.height, terrainHeight, Cesium.Math.EPSILON4, Cesium.Math.EPSILON1))
            return;

        // I am not sure why negative
        if (cartographic.height < 0) {
            console.warn("height is negative");
            return;
        }

        var height = this._cesiumViewer.scene.sampleHeight(cartographic);

        if(height === undefined)
            return false;

        cartographic.height = height + HUMAN_EYE_HEIGHT;

        if(!this._enabled)
            this._enable(cartographic);

        this._camera.flyTo({
            destination : globe.ellipsoid.cartographicToCartesian(cartographic),
            orientation : {
                heading : this._camera.heading,
                pitch :  0,
                roll : 0.0
            }
        });
    };

    CameraController.prototype._enterFPV2 = function(movement) {
        var scene = this._cesiumViewer.scene;

        scene.globe.depthTestAgainstTerrain = true;

        var pickRay = scene.camera.getPickRay(movement.position);

        var result = scene.pickFromRay(pickRay);

        if(!result)
        {
            alert("Unfortunately failed to enter FPV!");
            return;
        }

        var globe = this._cesiumViewer.scene.globe;
        var cartographic = globe.ellipsoid.cartesianToCartographic(result.position);

        // consider terrain height
        var terrainHeight = globe.getHeight(cartographic);

        // determine we clicked out of main 3d tileset
        if (Cesium.Math.equalsEpsilon(cartographic.height, terrainHeight, Cesium.Math.EPSILON4, Cesium.Math.EPSILON1))
            return;

        // I am not sure why negative
        if (cartographic.height < 0) {
            console.warn("height is negative");
            return;
        }

        cartographic.height = cartographic.height + HUMAN_EYE_HEIGHT;

        if(!this._enabled)
            this._enable(cartographic);

        this._camera.flyTo({
            destination : globe.ellipsoid.cartographicToCartesian(cartographic),
            orientation : {
                heading : this._camera.heading,
                pitch :  0,
                roll : 0.0
            }
        });
    };

    CameraController.prototype._onMouseLButtonDoubleClicked = function (movement) {
        if(!this._enabledFPV)
            return;

        //this._enterFPV1(movement);

        this._enterFPV2(movement);
    };

    CameraController.prototype._onMouseMove = function (movement) {
        this._mousePosition = movement.endPosition;
    };

    //noinspection JSUnusedLocalSymbols
    CameraController.prototype._onMouseUp = function (position) {
        this._isMouseLeftButtonPressed = false;
    };

    CameraController.prototype._changeCameraHeadingPitchByMouse = function (dt) {
        var width = this._canvas.clientWidth;
        var height = this._canvas.clientHeight;

        // Coordinate (0.0, 0.0) will be where the mouse was clicked.
        var deltaX = (this._mousePosition.x - this._startMousePosition.x) / width;
        var deltaY = -(this._mousePosition.y - this._startMousePosition.y) / height;

        var currentHeadingInDegree = Cesium.Math.toDegrees(this._camera.heading);
        var deltaHeadingInDegree = (deltaX * ROTATE_SPEED);
        var newHeadingInDegree = currentHeadingInDegree + deltaHeadingInDegree;

        var currentPitchInDegree = Cesium.Math.toDegrees(this._camera.pitch);
        var deltaPitchInDegree = (deltaY * ROTATE_SPEED);
        var newPitchInDegree = currentPitchInDegree + deltaPitchInDegree;

        if( newPitchInDegree > MAX_PITCH_IN_DEGREE * 2 && newPitchInDegree < 360 - MAX_PITCH_IN_DEGREE) {
            newPitchInDegree = 360 - MAX_PITCH_IN_DEGREE;
        }
        else {
            if (newPitchInDegree > MAX_PITCH_IN_DEGREE && newPitchInDegree < 360 - MAX_PITCH_IN_DEGREE) {
                newPitchInDegree = MAX_PITCH_IN_DEGREE;
            }
        }

        this._camera.setView({
            orientation: {
                heading : Cesium.Math.toRadians(newHeadingInDegree),
                pitch : Cesium.Math.toRadians(newPitchInDegree),
                roll : this._camera.roll
            }
        });
    };

    CameraController.prototype._changeCameraHeading = function (dt) {
        var deltaHeadingInDegree = 0;

        if(this._headingDirection === HEADING_DIRECTION_LEFT)
            deltaHeadingInDegree = 1;

        if(this._headingDirection === HEADING_DIRECTION_RIGHT)
            deltaHeadingInDegree = -1;

        var currentHeadingInDegree = Cesium.Math.toDegrees(this._camera.heading);

        deltaHeadingInDegree = deltaHeadingInDegree * HEADING_CHANGE_SPEED;

        var newHeadingInDegree = currentHeadingInDegree + deltaHeadingInDegree;
        var currentPitchInDegree = Cesium.Math.toDegrees(this._camera.pitch);

        this._camera.setView({
            orientation: {
                heading : Cesium.Math.toRadians(newHeadingInDegree),
                pitch : Cesium.Math.toRadians(currentPitchInDegree),
                roll : this._camera.roll
            }
        });
    };

    CameraController.prototype._getRayPosition = function () {
        var currentCameraPosition = this._camera.position;

        var magnitude = Cesium.Cartesian3.magnitude(currentCameraPosition);
        var scalar = (magnitude - HUMAN_EYE_HEIGHT + COLLISION_RAY_HEIGHT )  /magnitude;

        var ret = new Cesium.Cartesian3();

        return Cesium.Cartesian3.multiplyByScalar(currentCameraPosition, scalar, ret);
    };

    CameraController.prototype._changeCameraPosition = function (dt) {
        var direction = new Cesium.Cartesian3();

        if(this._direction === DIRECTION_FORWARD)
            Cesium.Cartesian3.multiplyByScalar(this._camera.direction, 1, direction);
        else if(this._direction === DIRECTION_BACKWARD)
            Cesium.Cartesian3.multiplyByScalar(this._camera.direction, -1, direction);
        else if(this._direction === DIRECTION_LEFT)
            Cesium.Cartesian3.multiplyByScalar(this._camera.right, -1, direction);
        else if(this._direction === DIRECTION_RIGHT)
            Cesium.Cartesian3.multiplyByScalar(this._camera.right, 1, direction);

        var stepDistance = this._walkingSpeed() * dt;

        var deltaPosition = Cesium.Cartesian3.multiplyByScalar(direction, stepDistance, new Cesium.Cartesian3());

        var rayPosition = this._getRayPosition();

        var endPosition = Cesium.Cartesian3.add(rayPosition, deltaPosition, new Cesium.Cartesian3());

        var rayDirection = Cesium.Cartesian3.normalize(Cesium.Cartesian3.subtract(endPosition, rayPosition, new Cesium.Cartesian3()), new Cesium.Cartesian3());

        var ray = new Cesium.Ray(rayPosition, rayDirection);

        var result = this._cesiumViewer.scene.pickFromRay(ray);

        if(Cesium.defined(result)) {
            var distanceToIntersection = Cesium.Cartesian3.distanceSquared(rayPosition, result.position);

            if(distanceToIntersection > stepDistance) {
                this._setCameraPosition(endPosition);
                return;
            }

            return;
        }

        this._setCameraPosition(endPosition);
    };

    CameraController.prototype._setCameraPosition = function (position) {
        var globe = this._cesiumViewer.scene.globe;
        var ellipsoid = globe.ellipsoid;

        var cartographic = ellipsoid.cartesianToCartographic(position);

        cartographic.height = 0;

        var sampledHeight = this._cesiumViewer.scene.sampleHeight(cartographic);

        var currentCameraCartographic = ellipsoid.cartesianToCartographic(this._camera.position);

        console.log('sample height: ' + sampledHeight);
        console.log('current camera  height: ' + currentCameraCartographic.height);

        if(sampledHeight === undefined) {
            console.log('sampled height is undefined');
            return
        }

        if(sampledHeight < 0) {
            console.log('sampled height is negative');
            return;
        }

        if( sampledHeight > currentCameraCartographic.height)
            cartographic.height = currentCameraCartographic.height;
        else {
            cartographic.height = sampledHeight + HUMAN_EYE_HEIGHT;
        }

        this._camera.setView({
            destination: ellipsoid.cartographicToCartesian(cartographic),
            orientation: new Cesium.HeadingPitchRoll(this._camera.heading, this._camera.pitch, this._camera.roll),
            endTransform : Cesium.Matrix4.IDENTITY
        });
    };

    CameraController.prototype._onClockTick = function (clock) {
        if(!this._enabled)
            return;

        var dt = clock._clockStep;

        if(this._isMouseLeftButtonPressed)
            this._changeCameraHeadingPitchByMouse(dt);

        if(this._headingDirection !== HEADING_DIRECTION_NONE) {
            this._changeCameraHeading(dt);
        }

        if(this._direction !== DIRECTION_NONE) {
            this._changeCameraPosition(dt);
        }
    };

    CameraController.prototype._connectEventHandlers = function () {
        var self = this;

        $('#' + this._exitFPVModeButtonId).on('click', function(event){
            self._disable();
            //self._camera.flyToBoundingSphere(self._main3dTileset.boundingSphere);
            self.setDefaultView();
            $('#' + self._exitFPVModeButtonId).hide();
        });
    };

    CameraController.prototype.isEnabled = function () {
        return this._enabled;
    };

    CameraController.prototype._disableDefaultCameraController = function () {
        var scene = this._cesiumViewer.scene;

        // disable the default event handlers

        scene.screenSpaceCameraController.enableRotate = false;
        scene.screenSpaceCameraController.enableTranslate = false;
        scene.screenSpaceCameraController.enableZoom = false;
        scene.screenSpaceCameraController.enableTilt = false;
        scene.screenSpaceCameraController.enableLook = false;
    };

    CameraController.prototype.getViewData = function () {
        var camera = this._cesiumViewer.camera;

        var cartographic = this._cesiumViewer.scene.globe.ellipsoid.cartesianToCartographic(camera.position);

        var viewData = {};

        viewData.longitude = cartographic.longitude;
        viewData.latitude = cartographic.latitude;
        viewData.height = cartographic.height;

        viewData.heading = camera.heading;
        viewData.pitch = camera.pitch;
        viewData.roll = camera.roll;

        return JSON.stringify(viewData);
    };

    CameraController.prototype.setDefaultView = function() {
        var viewData = EDD_CJS_PUBLIC_AJAX.view_data;

        if(viewData !== "") {
            viewData = JSON.parse(viewData);

            var cartographic = new Cesium.Cartographic(viewData.longitude, viewData.latitude, viewData.height);

            this._cesiumViewer.camera.flyTo({
                destination : this._cesiumViewer.scene.globe.ellipsoid.cartographicToCartesian(cartographic),
                orientation : {
                    heading : viewData.heading ,
                    pitch :  viewData.pitch,
                    roll : viewData.roll
                }
            });
        }
        else {
            this._camera.flyToBoundingSphere(this._main3dTileset.boundingSphere);
            // viewer.zoomTo(this._main3dTileset)
            // .otherwise(function (error) {
            //     console.log(error);
            // });
        }
    };

    CameraController.prototype.setEnabledFPV = function(value) {
        this._enabledFPV = value;
    };

    CameraController.prototype._walkingSpeed = function() {
        var lastFPS = this._frameMonitor.lastFramesPerSecond;

        var defaultWorkingSpeed = DEFAULT_HUMAN_WALKING_SPEED;

        if(lastFPS === undefined) {
            return defaultWorkingSpeed;
        }

        var factor = 30;

        return defaultWorkingSpeed * factor / lastFPS;
    };

    return CameraController;

})();