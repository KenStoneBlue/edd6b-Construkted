import {Cartesian3} from 'cesium'
import {defaultValue} from 'cesium'
import {defined} from 'cesium'
import {defineProperties} from 'cesium'
import {destroyObject} from 'cesium'
import {HeadingPitchRoll} from 'cesium'
import {IntersectionTests} from 'cesium'
import {Matrix4} from 'cesium'
import {Plane} from 'cesium'
import {Ray} from 'cesium'
import {Transforms} from 'cesium'
import getWidgetOrigin from './getWidgetOrigin.js';
import AxisLinePrimitive from './AxisLinePrimitive.js';
import TransformAxis from './TransformAxis.js';

    var widgetOriginScratch = new Cartesian3();
    var originScratch = new Cartesian3();
    var directionScratch = new Cartesian3();
    var planeNormalScratch = new Cartesian3();
    var pickedPointScratch = new Cartesian3();
    var moveScratch = new Cartesian3();
    var offsetProjectedScratch = new Cartesian3();
    var rayScratch = new Ray();

    function getLinePrimitive(axis) {
        return new AxisLinePrimitive({
            positions : [Cartesian3.ZERO, TransformAxis.getValue(axis)],
            arrow : true,
            color : TransformAxis.getColor(axis),
            id : axis,
            show : false
        });
    }

    /**
     * @private
     * @ionsdk
     *
     * @param {Object} options
     * @param {Scene} options.scene
     * @param {Cartesian3} options.originOffset
     * @param {Function} options.setPosition
     * @param {Matrix4} options.transform
     * @param {Number} options.radius
     */
    function TranslationEditor(options) {
        options = defaultValue(options, defaultValue.EMPTY_OBJECT);
        var scene = options.scene;

        this.originOffset = options.originOffset;

        this._polylineX = scene.primitives.add(getLinePrimitive(TransformAxis.X));
        this._polylineY = scene.primitives.add(getLinePrimitive(TransformAxis.Y));
        this._polylineZ = scene.primitives.add(getLinePrimitive(TransformAxis.Z));

        this._scene = scene;
        this._canvas = scene.canvas;
        this._setPositionCallback = options.setPosition;
        this._modelMatrix = new Matrix4();
        this._fixedFrame = new Matrix4();
        this._hpr = new HeadingPitchRoll();

        this._dragAlongVector = undefined;
        this._offsetVector = new Cartesian3();
        this._pickingPlane = new Plane(Cartesian3.UNIT_X, 0.0);
        this._dragging = false;
        this._active = false;

        this._transform = options.transform;
        this._radius = options.radius;
        this.update();
    }

    defineProperties(TranslationEditor.prototype, {
        active : {
            get : function() {
                return this._active;
            },
            set : function(active) {
                this._active = active;
                if (active) {
                    this._polylineX.show = true;
                    this._polylineY.show = true;
                    this._polylineZ.show = true;
                } else {
                    this._polylineX.show = false;
                    this._polylineY.show = false;
                    this._polylineZ.show = false;
                    this._dragging = false;
                }
            }
        }
    });

    TranslationEditor.prototype.update = function() {
        var transform = this._transform;
        var ellipsoid = this._scene.mapProjection.ellipsoid;

        var modelOrigin = Matrix4.getTranslation(transform, originScratch);
        var widgetOrigin = getWidgetOrigin(transform, this.originOffset, widgetOriginScratch);

        var length = this._radius * Matrix4.getMaximumScale(this._transform) * 1.5;
        var hpr = Transforms.fixedFrameToHeadingPitchRoll(this._transform, ellipsoid, undefined, this._hpr);
        hpr.pitch = 0;
        hpr.roll = 0;

        var hprToFF = Transforms.headingPitchRollToFixedFrame(modelOrigin, hpr, ellipsoid, undefined, this._fixedFrame);
        hprToFF = Matrix4.setTranslation(hprToFF, widgetOrigin, hprToFF);
        var modelMatrix = Matrix4.multiplyByUniformScale(hprToFF, length, this._modelMatrix);

        this._polylineX.modelMatrix = modelMatrix;
        this._polylineY.modelMatrix = modelMatrix;
        this._polylineZ.modelMatrix = modelMatrix;
    };

    TranslationEditor.prototype.handleLeftDown = function(position) {
        var scene = this._scene;
        var camera = scene.camera;

        var pickedObjects = scene.drillPick(position);

        var pickedAxis;
        for (var i = 0; i < pickedObjects.length; i++) {
            var object = pickedObjects[i];
            if (defined(object.id) && defined(TransformAxis[object.id])) {
                pickedAxis = object.id;
                break;
            }
        }
        if (!defined(pickedAxis)) {
            return;
        }

        var origin = Matrix4.getTranslation(this._transform, originScratch);
        var dragAlongVector = TransformAxis.getValue(pickedAxis);
        var directionVector = Matrix4.multiplyByPointAsVector(this._fixedFrame, dragAlongVector, directionScratch);

        //Finds a picking plane that includes the dragged axis and is somewhat perpendicular to the camera
        var planeNormal = planeNormalScratch;
        if (Math.abs(Cartesian3.dot(camera.upWC, directionVector)) > 0.7) { // if up and the direction are close to parellel, the dot product will be close to 1
            planeNormal = Cartesian3.cross(camera.rightWC, directionVector, planeNormal);
        } else {
            planeNormal = Cartesian3.cross(camera.upWC, directionVector, planeNormal);
        }
        Cartesian3.normalize(planeNormal, planeNormal);

        var pickingPlane = Plane.fromPointNormal(origin, planeNormal, this._pickingPlane);
        var offsetVector = IntersectionTests.rayPlane(camera.getPickRay(position, rayScratch), pickingPlane, this._offsetVector);
        if (!defined(offsetVector)) {
            return;
        }
        Cartesian3.subtract(offsetVector, origin, offsetVector);
        this._dragging = true;
        this._dragAlongVector = dragAlongVector;
        scene.screenSpaceCameraController.enableInputs = false;
    };

    TranslationEditor.prototype.handleMouseMove = function(position) {
        if (!this._dragging) {
            return;
        }
        var scene = this._scene;
        var camera = scene.camera;

        var pickedPoint = IntersectionTests.rayPlane(camera.getPickRay(position, rayScratch), this._pickingPlane, pickedPointScratch);
        if (!defined(pickedPoint)) {
            return;
        }

        var dragAlongVector = this._dragAlongVector;
        var origin = Matrix4.getTranslation(this._transform, originScratch);
        var directionVector = Matrix4.multiplyByPointAsVector(this._fixedFrame, dragAlongVector, directionScratch);
        var moveVector = Cartesian3.subtract(pickedPoint, origin, moveScratch);
        moveVector = Cartesian3.projectVector(moveVector, directionVector, moveVector);
        var offset = Cartesian3.projectVector(this._offsetVector, directionVector, offsetProjectedScratch);
        moveVector = Cartesian3.subtract(moveVector, offset, moveVector);

        origin = Cartesian3.add(origin, moveVector, origin);
        this._setPositionCallback(origin);
    };

    TranslationEditor.prototype.handleLeftUp = function() {
        this._dragging = false;
        this._scene.screenSpaceCameraController.enableInputs = true;
    };

    TranslationEditor.prototype.isDestroyed = function() {
        return false;
    };

    TranslationEditor.prototype.destroy = function() {
        this.active = false;
        var scene = this._scene;
        scene.primitives.remove(this._polylineX);
        scene.primitives.remove(this._polylineY);
        scene.primitives.remove(this._polylineZ);
        destroyObject(this);
    };
export default TranslationEditor;
