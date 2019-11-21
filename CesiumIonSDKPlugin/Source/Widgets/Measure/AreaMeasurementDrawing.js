import {defaultValue} from 'cesium'
import {defined} from 'cesium'
import {defineProperties} from 'cesium'
import {Cartesian2} from 'cesium'
import {Cartesian3} from 'cesium'
import {Check} from 'cesium'
import {CoplanarPolygonGeometry} from 'cesium'
import {VertexFormat} from 'cesium'
import {SceneTransforms} from 'cesium'
import DrawingMode from '../Drawing/DrawingMode'
import PolygonDrawing from '../Drawing/PolygonDrawing'
import MeasurementSettings from './MeasurementSettings.js';
import MeasureUnits from './MeasureUnits.js';

    var cart2Scratch1 = new Cartesian2();
    var cart2Scratch2 = new Cartesian2();

    var p0Scratch = new Cartesian3();
    var p1Scratch = new Cartesian3();
    var p2Scratch = new Cartesian3();
    var v0Scratch = new Cartesian3();
    var v1Scratch = new Cartesian3();

    function triangleArea(p0, p1, p2) {
        var v0 = Cartesian3.subtract(p0, p1, v0Scratch);
        var v1 = Cartesian3.subtract(p2, p1, v1Scratch);
        var cross = Cartesian3.cross(v0, v1, v0);
        return Cartesian3.magnitude(cross) * 0.5;
    }

    /**
     * @private
     * @ionsdk
     */
    function AreaMeasurementDrawing(options) {
        options = defaultValue(options, defaultValue.EMPTY_OBJECT);
        //>>includeStart('debug', pragmas.debug);
        Check.defined('options.scene', options.scene);
        Check.defined('options.primitives', options.primitives);
        Check.defined('options.units', options.units);
        Check.defined('options.points', options.points);
        Check.defined('options.labels', options.labels);
        //>>includeEnd('debug');

        options.polylineOptions = MeasurementSettings.getPolylineOptions({
            ellipsoid : options.ellipsoid
        });
        options.pointOptions = MeasurementSettings.getPointOptions();
        options.polygonOptions = {
            color: MeasurementSettings.color.withAlpha(0.8)
        };
        PolygonDrawing.call(this, options);

        var labels = options.labels;
        this._labelCollection = labels;
        this._label = labels.add(MeasurementSettings.getLabelOptions());
        this._selectedUnits = options.units;
        this._selectedLocale = options.locale;
        this._area = 0;

        var that = this;
        this._removeEvent = this._scene.preRender.addEventListener(function() {
            that.updateLabel();
        });
    }

    AreaMeasurementDrawing.prototype = Object.create(PolygonDrawing.prototype);
    AreaMeasurementDrawing.prototype.constructor = AreaMeasurementDrawing;

    defineProperties(AreaMeasurementDrawing.prototype, {
        /**
         * Gets the area value in meters squared
         * @type {Number}
         * @memberof AreaMeasurementDrawing.prototype
         * @readonly
         */
        area : {
            get : function() {
                return this._area;
            }
        }
    });

    /**
     * Computes the area of the polygon.
     * @param {Cartesian3[]} positions An array of positions
     * @private
     */
    AreaMeasurementDrawing.prototype.updateArea = function(positions) {
        var geometry = CoplanarPolygonGeometry.createGeometry(CoplanarPolygonGeometry.fromPositions({
            positions: positions,
            vertexFormat: VertexFormat.POSITION_ONLY
        }));
        if (!defined(geometry)) {
            this._label.text = '';
            return;
        }

        var flatPositions = geometry.attributes.position.values;
        var indices = geometry.indices;

        var area = 0;
        for (var i = 0; i < indices.length; i+=3) {
            var i0 = indices[i];
            var i1 = indices[i+1];
            var i2 = indices[i+2];

            var p0 = Cartesian3.unpack(flatPositions, i0*3, p0Scratch);
            var p1 = Cartesian3.unpack(flatPositions, i1*3, p1Scratch);
            var p2 = Cartesian3.unpack(flatPositions, i2*3, p2Scratch);
            area += triangleArea(p0, p1, p2);
        }

        this._area = area;
        this._label.text = MeasureUnits.areaToString(area, this._selectedUnits.areaUnits, this._selectedLocale);
    };

    /**
     * Updates the label position.
     * @private
     */
    AreaMeasurementDrawing.prototype.updateLabel = function() {
        var positions = this._positions;
        if (positions.length < 2) {
            return;
        }
        var scene = this._scene;
        var top = positions[0];
        var pos2d = SceneTransforms.wgs84ToWindowCoordinates(scene, top, cart2Scratch1);
        var lastY = defined(pos2d) ? pos2d.y : Number.POSITIVE_INFINITY;
        for (var i = 1; i < positions.length; i++) {
            var nextScreenPos = SceneTransforms.wgs84ToWindowCoordinates(scene, positions[i], cart2Scratch2);
            if (!defined(nextScreenPos)) {
                continue;
            }
            if (nextScreenPos.y < lastY) {
                lastY = nextScreenPos.y;
                top = positions[i];
            }
        }
        this._label.position = top;
    };

    /**
     * Adds a point to the polygon.
     * @param {Cartesian3} position The position to add
     * @private
     */
    AreaMeasurementDrawing.prototype.addPoint = function(position) {
        PolygonDrawing.prototype.addPoint.call(this, position);
        this.updateArea(this._positions);
    };

    /**
     * Handles click events while drawing a polygon.
     * @param {Cartesian2} clickPosition The click position
     */
    AreaMeasurementDrawing.prototype.handleClick = function(clickPosition) {
        //>>includeStart('debug', pragmas.debug);
        Check.defined('clickPosition', clickPosition);
        //>>includeEnd('debug');

        if (this._mode === DrawingMode.AfterDraw) {
            this.reset();
        }

        var position = PolygonDrawing.prototype.handleClick.call(this, clickPosition);
        if (defined(position)) {
            this._label.show = true;
            this._polygon.show = true;
            this._polyline.show = true;
        }
    };

    /**
     * Handles mouse move events while drawing a polygon.
     * @param {Cartesian2} mousePosition The mouse position
     */
    AreaMeasurementDrawing.prototype.handleMouseMove = function(mousePosition) {
        //>>includeStart('debug', pragmas.debug);
        Check.defined('mousePosition', mousePosition);
        //>>includeEnd('debug');

        var nextPos = PolygonDrawing.prototype.handleMouseMove.call(this, mousePosition);
        if (!defined(nextPos)) {
            return;
        }
        var positions = this._positions.slice();
        positions.push(nextPos);
        this.updateArea(positions);
    };

    /**
     * Resets the widget.
     */
    AreaMeasurementDrawing.prototype.reset = function() {
        this._label.show = false;
        this._label.text = '';
        this._positions = [];
        this._polyline.positions = [];
        this._polygon.positions = [];
        this._polyline.show = false;
        this._polygon.show = false;
        this._area = 0;
        var points = this._points;
        var pointCollection = this._pointCollection;
        for (var i = 0; i < points.length; i++) {
            pointCollection.remove(points[i]);
        }
        points.length = 0;

        this._mode = DrawingMode.BeforeDraw;
        this._lastClickPosition.x = Number.POSITIVE_INFINITY;
        this._lastClickPosition.y = Number.POSITIVE_INFINITY;
    };

    /**
     * Destroys the widget.
     */
    AreaMeasurementDrawing.prototype.destroy = function() {
        this._removeEvent();
        this._labelCollection.remove(this._label);

        PolygonDrawing.prototype.destroy.call(this);
    };
export default AreaMeasurementDrawing;
