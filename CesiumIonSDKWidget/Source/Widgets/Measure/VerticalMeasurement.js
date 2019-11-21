import {defaultValue} from 'cesium'
import {defined} from 'cesium'
import {defineProperties} from 'cesium'
import {destroyObject} from 'cesium'
import {Cartesian2} from 'cesium'
import {Cartesian3} from 'cesium'
import {Cartographic} from 'cesium'
import {Check} from 'cesium'
import {IntersectionTests} from 'cesium'
import {Plane} from 'cesium'
import {Ray} from 'cesium'
import {SceneTransforms} from 'cesium'
import {HorizontalOrigin} from 'cesium'
import PolylinePrimitive from '../Scene/PolylinePrimitive'
import {SceneMode} from 'cesium'
import {VerticalOrigin} from 'cesium'
import getWorldPosition from '../getWorldPosition.js';
import Measurement from './Measurement.js';
import MeasurementSettings from './MeasurementSettings.js';
import MeasureUnits from './MeasureUnits.js';

    var Mode = {
        BeforeDraw : 0,
        Drawing : 1,
        AfterDraw : 2
    };

    var scratch = new Cartesian3();
    var cart2 = new Cartesian2();
    var normalScratch = new Cartesian3();
    var v1 = new Cartesian3();
    var rayScratch = new Ray();
    var positionScratch = new Cartesian3();
    var scratchCarto = new Cartographic();

    function getIcon(size) {
        return '<svg viewBox="0 0 30 30" height="' + size + 'px" width="' + size + 'px">\n\
                 <g transform="translate(0,-267)">\n\
                   <path d="m 15.042838,272.34414 -0.0497,18.93758"/>\n\
                   <circle r="2.0788691" cy="270.01154" cx="15.078616"/>\n\
                   <circle r="2.0788691" cy="293.97095" cx="15.092237"/>\n\
                 </g>\n\
               </svg>';
    }

    function getHeightPosition(measurement, mousePos) {
        var positions = measurement._positions;
        var pos0 = positions[0];
        var pos1 = positions[1];
        var plane = measurement._draggingPlane;
        var normal = measurement._surfaceNormal;
        var scene = measurement._scene;
        var camera = scene.camera;
        var cameraDirection = camera.direction;
        var ellipsoid = scene.frameState.mapProjection.ellipsoid;

        var planePoint = pos0;
        var surfaceNormal = normal;

        if (scene.mode === SceneMode.COLUMBUS_VIEW) {
            surfaceNormal = Cartesian3.UNIT_X;
            var cartoPos = ellipsoid.cartesianToCartographic(pos0, scratchCarto);
            planePoint = scene.mapProjection.project(cartoPos, scratch);
            Cartesian3.fromElements(planePoint.z, planePoint.x, planePoint.y, planePoint);
        }

        var planeNormal = Cartesian3.cross(surfaceNormal, cameraDirection, normalScratch);
        planeNormal = Cartesian3.cross(surfaceNormal, planeNormal, planeNormal);
        planeNormal = Cartesian3.normalize(planeNormal, planeNormal);
        plane = Plane.fromPointNormal(planePoint, planeNormal, plane);
        var ray = camera.getPickRay(mousePos, rayScratch);

        pos1 = IntersectionTests.rayPlane(ray, plane, pos1);
        if (!defined(pos1)) {
            return;
        }

        if (scene.mode === SceneMode.COLUMBUS_VIEW) {
            pos1 = Cartesian3.fromElements(pos1.y, pos1.z, pos1.x, pos1);
            var carto = scene.mapProjection.unproject(pos1, scratchCarto);
            pos1 = ellipsoid.cartographicToCartesian(carto, pos1);
        }

        var screenPos = SceneTransforms.wgs84ToWindowCoordinates(scene, positions[0], cart2);
        if (screenPos.y < mousePos.y) {
            normal = Cartesian3.negate(normal, normalScratch);
        }
        v1 = Cartesian3.subtract(pos1, pos0, v1);
        v1 = Cartesian3.projectVector(v1, normal, v1);
        pos1 = Cartesian3.add(pos0, v1, pos1);
        return pos1;
    }

    /**
     * Draws a measurement between two points that only differ in height.
     *
     * @param {Object} options An object with the following properties:
     * @ionsdk
     * @param {Scene} options.scene The scene
     * @param {MeasureUnits} options.units The selected units of measurement
     * @param {String} [options.locale] The {@link https://tools.ietf.org/html/rfc5646|BCP 47 language tag} string customizing language-sensitive number formatting. If <code>undefined</code>, the runtime's default locale is used. See the {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl#Locale_identification_and_negotiation|Intl page on MDN}
     * @param {PointPrimitiveCollection} options.points A collection for adding the point primitives
     * @param {LabelCollection} options.labels A collection for adding the labels
     * @param {PrimitiveCollection} options.primitives A collection for adding primitives
     *
     * @constructor
     * @alias VerticalMeasurement
     */
    function VerticalMeasurement(options) {
        options = defaultValue(options, defaultValue.EMPTY_OBJECT);
        Measurement.call(this, options);

        var pointCollection = this._pointCollection;
        var positions = [new Cartesian3(), new Cartesian3()];

        this._startPoint = pointCollection.add(MeasurementSettings.getPointOptions());
        this._endPoint = pointCollection.add(MeasurementSettings.getPointOptions());

        this._positions = positions;
        this._polyline = this._primitives.add(new PolylinePrimitive(MeasurementSettings.getPolylineOptions({
            ellipsoid : this._scene.frameState.mapProjection.ellipsoid,
            positions : positions
        })));

        this._label = this._labelCollection.add(MeasurementSettings.getLabelOptions({
            horizontalOrigin : HorizontalOrigin.LEFT,
            verticalOrigin : VerticalOrigin.TOP,
            pixelOffset : new Cartesian2(10, 10)
        }));

        this._mode = Mode.BeforeDraw;
        this._draggingPlane = new Plane(Cartesian3.UNIT_X, 0);
        this._surfaceNormal = new Cartesian3();
        this._distance = 0;
    }

    VerticalMeasurement.prototype = Object.create(Measurement.prototype);
    VerticalMeasurement.prototype.constructor = VerticalMeasurement;

    defineProperties(VerticalMeasurement.prototype, {
        /**
         * Gets the distance.
         * @type {Number}
         * @memberof VerticalMeasurement.prototype
         * @readonly
         */
        distance : {
            get : function() {
                return this._distance;
            }
        },
        /**
         * Gets the type.
         * @type {String}
         * @memberof VerticalMeasurement.prototype
         * @readonly
         */
        type : {
            value : 'Vertical distance'
        },
        /**
         * Gets the icon.
         * @type {String}
         * @memberof VerticalMeasurement.prototype
         * @readonly
         */
        icon : {
            value : getIcon(15)
        },
        /**
         * Gets the thumbnail.
         * @type {String}
         * @memberof VerticalMeasurement.prototype
         * @readonly
         */
        thumbnail : {
            value : getIcon(25)
        },
        /**
         * Gets the instruction text.
         * @type {String[]}
         * @memberof VerticalMeasurement.prototype
         * @readonly
         */
        instructions : {
            value : [
                'Click on the point cloud or the globe to set the start point',
                'Move the mouse to drag the line',
                'Click again to set the end point',
                'To make a new measurement, click to clear the previous measurement'
            ]
        },
        /**
         * Gets the id.
         * @type {String}
         * @memberof VerticalMeasurement.prototype
         * @readonly
         */
        id : {
            value : 'verticalMeasurement'
        }
    });

    /**
     * Handles click events while drawing a vertical measurement.
     * @param {Cartesian2} clickPosition The click position
     */
    VerticalMeasurement.prototype.handleClick = function(clickPosition) {
        //>>includeStart('debug', pragmas.debug);
        Check.defined('clickPosition', clickPosition);
        //>>includeEnd('debug');

        var scene = this._scene;
        var ellipsoid = scene.frameState.mapProjection.ellipsoid;
        if (this._mode === Mode.AfterDraw) {
            this.reset();
        }

        var mode = this._mode;
        var positions = this._positions;
        if (mode === Mode.BeforeDraw) {
            var pos = VerticalMeasurement._getWorldPosition(scene, clickPosition, positions[0]);
            if (!defined(pos)) {
                return;
            }
            this._polyline.show = true;
            positions[0] = Cartesian3.clone(pos, positions[0]);
            positions[1] = Cartesian3.clone(pos, positions[1]);
            this._startPoint.position = pos;
            this._startPoint.show = true;
            this._mode = Mode.Drawing;
            this._polyline.positions = positions;
            this._surfaceNormal = ellipsoid.geodeticSurfaceNormal(pos, this._surfaceNormal);
        } else if (mode === Mode.Drawing) {
            this._endPoint.position = positions[1];
            this._endPoint.show = true;
            this._mode = Mode.AfterDraw;
        }
    };

    /**
     * Handles mouse movement while drawing a vertical measurement.
     * @param {Cartesian2} mousePosition The mouse position
     */
    VerticalMeasurement.prototype.handleMouseMove = function(mousePosition) {
        //>>includeStart('debug', pragmas.debug);
        Check.defined('mousePosition', mousePosition);
        //>>includeEnd('debug');

        if (this._mode !== Mode.Drawing) {
            return;
        }

        var label = this._label;
        if (this._scene.mode === SceneMode.SCENE2D) {
            label.position = this._positions[0];
            label.text = MeasureUnits.distanceToString(0, this._selectedUnits.distanceUnits, this._selectedLocale);
            label.show = true;
            this._mode = Mode.AfterDraw;
            return;
        }
        var pos = VerticalMeasurement._getHeightPosition(this, mousePosition);
        if (!defined(pos)) {
            return;
        }

        var positions = this._positions;
        var pos1 = positions[0];
        var pos2 = positions[1];

        var vec = Cartesian3.subtract(pos2, pos1, scratch);
        var distance = Cartesian3.magnitude(vec);

        label.position = Cartesian3.midpoint(pos1, pos2, positionScratch);
        label.text = MeasureUnits.distanceToString(distance, this._selectedUnits.distanceUnits, this._selectedLocale);
        label.show = true;

        this._polyline.positions = positions; //triggers polyline update
        this._distance = distance;
    };

    /**
     * Resets the measurement.
     */
    VerticalMeasurement.prototype.reset = function() {
        this._polyline.show = false;
        this._label.show = false;
        this._startPoint.show = false;
        this._endPoint.show = false;
        this._mode = Mode.BeforeDraw;
        this._distance = 0;
    };

    /**
     * @returns {Boolean} true if the object has been destroyed, false otherwise.
     */
    VerticalMeasurement.prototype.isDestroyed = function() {
        return false;
    };

    /**
     * Destroys the measurement.
     */
    VerticalMeasurement.prototype.destroy = function() {
        this._primitives.remove(this._polyline);
        var points = this._pointCollection;
        points.remove(this._startPoint);
        points.remove(this._endPoint);
        this._labelCollection.remove(this._label);

        return destroyObject(this);
    };

    // exposed for specs
    VerticalMeasurement._getWorldPosition = getWorldPosition;
    VerticalMeasurement._getHeightPosition = getHeightPosition;
export default VerticalMeasurement;
