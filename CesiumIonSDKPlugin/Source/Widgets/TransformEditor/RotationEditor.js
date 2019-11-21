import {defaultValue} from 'cesium'
import {defined} from 'cesium'
import {defineProperties} from 'cesium'
import {destroyObject} from 'cesium'
import {Cartesian2} from 'cesium'
import {Cartesian3} from 'cesium'
import {Color} from 'cesium'
import {HeadingPitchRoll} from 'cesium'
import {IntersectionTests} from 'cesium'
import {Math as CesiumMath} from 'cesium'
import {Matrix3} from 'cesium'
import {Matrix4} from 'cesium'
import {Plane} from 'cesium'
import {Quaternion} from 'cesium'
import {Ray} from 'cesium'
import {Transforms} from 'cesium'
import getWidgetOrigin from './getWidgetOrigin.js';
import AxisLinePrimitive from './AxisLinePrimitive.js';
import TransformAxis from './TransformAxis.js';

    var noScale = new Cartesian3(1.0, 1.0, 1.0);
    var offsetScratch = new Cartesian3();
    var widgetOriginScratch = new Cartesian3();
    var rotationWorldScratch = new Cartesian3();
    var rotatedTransformScratch = new Matrix4();
    var inverseTransformScratch = new Matrix4();
    var localStartScratch = new Cartesian3();
    var localEndScratch = new Cartesian3();
    var vector1Scratch = new Cartesian2();
    var vector2Scratch = new Cartesian2();
    var hprScratch = new HeadingPitchRoll();
    var rayScratch = new Ray();
    var intersectionScratch = new Cartesian3();
    var quaternionScratch = new Quaternion();
    var matrix3Scratch = new Matrix3();

    function getUnitCirclePositions() {
        var xAxis = [];
        var yAxis = [];
        var zAxis = [];

        for (var i = 0; i < 360; i++) {
            var rad = CesiumMath.toRadians(i);
            var x = Math.cos(rad);
            var y = Math.sin(rad);

            xAxis.push(new Cartesian3(0.0, x, y));
            yAxis.push(new Cartesian3(y, 0.0, x));
            zAxis.push(new Cartesian3(x, y, 0.0));
        }
        return {
            x : xAxis,
            y : yAxis,
            z : zAxis
        };
    }

    function getRotationAngle(transform, originOffset, axis, start, end) {
        var inverseTransform = Matrix4.inverse(transform, inverseTransformScratch);
        var localStart = Matrix4.multiplyByPoint(inverseTransform, start, localStartScratch); //project points to local coordinates so we can project to 2D
        var localEnd = Matrix4.multiplyByPoint(inverseTransform, end, localEndScratch);

        localStart = Cartesian3.subtract(localStart, originOffset, localStart);
        localEnd = Cartesian3.subtract(localEnd, originOffset, localEnd);

        var v1 = vector1Scratch;
        var v2 = vector2Scratch;
        if (axis.x) {
            v1.x = localStart.y;
            v1.y = localStart.z;
            v2.x = localEnd.y;
            v2.y = localEnd.z;
        } else if (axis.y) {
            v1.x = -localStart.x;
            v1.y = localStart.z;
            v2.x = -localEnd.x;
            v2.y = localEnd.z;
        } else {
            v1.x = localStart.x;
            v1.y = localStart.y;
            v2.x = localEnd.x;
            v2.y = localEnd.y;
        }
        var ccw = ((v1.x * v2.y) - (v1.y * v2.x)) >= 0.0; //true when minimal angle between start and end is a counter clockwise rotation
        var angle = Cartesian2.angleBetween(v1, v2);
        if (!ccw) {
            angle = -angle;
        }
        return angle;
    }

    function getLinePrimitive(positions, axis) {
        return new AxisLinePrimitive({
            positions : positions,
            color : TransformAxis.getColor(axis),
            loop : true,
            show : false,
            id : axis
        });
    }

    /**
     * @private
     * @ionsdk
     *
     * @param {Object} options
     * @param {Scene} options.scene
     * @param {Cartesian3} options.originOffset
     * @param {Function} options.setHeadingPitchRoll
     * @param {Function} options.setPosition
     * @param {Matrix4} options.transform
     * @param {Number} options.radius
     */
    function RotationEditor(options) {
        options = defaultValue(options, defaultValue.EMPTY_OBJECT);
        var scene = options.scene;

        this._vectorLine1 = scene.primitives.add(new AxisLinePrimitive({
            width : 5,
            positions : [new Cartesian3(), new Cartesian3()],
            color : Color.YELLOW,
            show: false
        }));
        this._vectorLine2 = scene.primitives.add(new AxisLinePrimitive({
            width : 5,
            positions : [new Cartesian3(), new Cartesian3()],
            color : Color.YELLOW,
            show: false
        }));

        var circles = getUnitCirclePositions();

        this._polylineX = scene.primitives.add(getLinePrimitive(circles.x, TransformAxis.X));
        this._polylineY = scene.primitives.add(getLinePrimitive(circles.y, TransformAxis.Y));
        this._polylineZ = scene.primitives.add(getLinePrimitive(circles.z, TransformAxis.Z));
        this._modelMatrix = Matrix4.clone(Matrix4.IDENTITY);

        this.originOffset = options.originOffset;
        this._scene = scene;
        this._setHPRCallback = options.setHeadingPitchRoll;
        this._setPositionCallback = options.setPosition;
        this._transform = options.transform;
        this._radius = options.radius;

        this._active = false;
        this._dragging = false;
        this._startTransform = new Matrix4();
        this._startRotation = new Matrix3();
        this._widgetOrigin = new Cartesian3();
        this._modelOrigin = new Cartesian3();
        this._rotationAxis = undefined;
        this._rotationPlane = new Plane(Cartesian3.UNIT_X, 0.0);
        this._rotationStartPoint = new Cartesian3();

        this.update();
    }

    defineProperties(RotationEditor.prototype, {
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

    RotationEditor.prototype.update = function() {
        var transform = this._transform;
        var modelMatrix = this._modelMatrix;
        modelMatrix = Matrix4.setScale(transform, noScale, modelMatrix);

        var widgetOrigin = getWidgetOrigin(transform, this.originOffset, widgetOriginScratch);
        modelMatrix = Matrix4.setTranslation(modelMatrix, widgetOrigin, modelMatrix);

        var radius = this._radius * Matrix4.getMaximumScale(this._transform) * 1.25;
        modelMatrix = Matrix4.multiplyByUniformScale(modelMatrix, radius, modelMatrix);

        this._polylineX.modelMatrix = modelMatrix;
        this._polylineY.modelMatrix = modelMatrix;
        this._polylineZ.modelMatrix = modelMatrix;
    };

    RotationEditor.prototype.handleLeftDown = function(position) {
        var scene = this._scene;
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

        var rotationAxis = TransformAxis.getValue(pickedAxis);
        var startTransform = Matrix4.setScale(this._transform, noScale, this._startTransform);
        this._startRotation = Matrix4.getMatrix3(startTransform, this._startRotation);
        var modelOrigin = Matrix4.getTranslation(startTransform, this._modelOrigin);

        var widgetOrigin = getWidgetOrigin(this._transform, this.originOffset, this._widgetOrigin);

        var rotationAxisEndWorld = Matrix4.multiplyByPoint(startTransform, rotationAxis, rotationWorldScratch);
        var rotationAxisVectorWorld = Cartesian3.subtract(rotationAxisEndWorld, modelOrigin, rotationAxisEndWorld);
        rotationAxisVectorWorld = Cartesian3.normalize(rotationAxisVectorWorld, rotationAxisVectorWorld);

        var rotationPlane = Plane.fromPointNormal(widgetOrigin, rotationAxisVectorWorld, this._rotationPlane);
        var rotationStartPoint = IntersectionTests.rayPlane(scene.camera.getPickRay(position, rayScratch), rotationPlane, this._rotationStartPoint);
        this._dragging = defined(rotationStartPoint);
        this._rotationAxis = rotationAxis;
        scene.screenSpaceCameraController.enableInputs = false;
    };

    RotationEditor.prototype.handleMouseMove = function(position) {
        if (!this._dragging) {
            return;
        }
        var scene = this._scene;
        var ray = scene.camera.getPickRay(position, rayScratch);
        var intersection = IntersectionTests.rayPlane(ray, this._rotationPlane, intersectionScratch);

        if (!defined(intersection)) {
            return;
        }

        var widgetOrigin = this._widgetOrigin;
        var modelOrigin = this._modelOrigin;
        var rotationStartPoint = this._rotationStartPoint;
        var vector1 = this._vectorLine1;
        var v1Pos = vector1.positions;
        var vector2 = this._vectorLine2;
        var v2Pos = vector2.positions;

        var v1 = Cartesian3.subtract(rotationStartPoint, widgetOrigin, vector1Scratch);
        var v2 = Cartesian3.subtract(intersection, widgetOrigin, vector2Scratch);
        v2 = Cartesian3.normalize(v2, v2);
        v2 = Cartesian3.multiplyByScalar(v2, Cartesian3.magnitude(v1), v2);
        intersection = Cartesian3.add(widgetOrigin, v2, intersection);

        v1Pos[0] = widgetOrigin;
        v1Pos[1] = rotationStartPoint;
        v2Pos[0] = widgetOrigin;
        v2Pos[1] = intersection;
        vector1.positions = v1Pos;
        vector2.positions = v2Pos;
        vector1.show = true;
        vector2.show = true;

        var offset = Cartesian3.multiplyComponents(this.originOffset, Matrix4.getScale(this._transform, offsetScratch), offsetScratch);
        var rotationAxis = this._rotationAxis;
        var angle = getRotationAngle(this._startTransform, offset, rotationAxis, rotationStartPoint, intersection);
        var rotation = Matrix3.fromQuaternion(Quaternion.fromAxisAngle(rotationAxis, angle, quaternionScratch), matrix3Scratch);

        rotation = Matrix3.multiply(this._startRotation, rotation, rotation);
        var rotationTransform = Matrix4.fromRotationTranslation(rotation, modelOrigin, rotatedTransformScratch);
        this._setHPRCallback(Transforms.fixedFrameToHeadingPitchRoll(rotationTransform, scene.mapProjection.ellipsoid, undefined, hprScratch));

        var newOffset = Cartesian3.negate(offset, vector1Scratch);
        newOffset = Matrix3.multiplyByVector(rotation, newOffset, newOffset);

        modelOrigin = Cartesian3.add(newOffset, widgetOrigin, modelOrigin);
        this._setPositionCallback(modelOrigin);
    };

    RotationEditor.prototype.handleLeftUp = function() {
        this._dragging = false;
        this._vectorLine1.show = false;
        this._vectorLine2.show = false;
        this._scene.screenSpaceCameraController.enableInputs = true;
    };

    RotationEditor.prototype.isDestroyed = function() {
        return false;
    };

    RotationEditor.prototype.destroy = function() {
        this.active = false;
        var scene = this._scene;

        scene.primitives.remove(this._vectorLine1);
        scene.primitives.remove(this._vectorLine2);
        scene.primitives.remove(this._polylineX);
        scene.primitives.remove(this._polylineY);
        scene.primitives.remove(this._polylineZ);

        destroyObject(this);
    };

    // exposed for testing
    RotationEditor._getRotationAngle = getRotationAngle;
export default RotationEditor;
