import {defaultValue} from 'cesium'
import {defined} from 'cesium'
import {defineProperties} from 'cesium'
import {Cartesian2} from 'cesium'
import {Cartesian3} from 'cesium'
import {Check} from 'cesium'
import {HorizontalOrigin} from 'cesium'
import {SceneTransforms} from 'cesium'
import {VerticalOrigin} from 'cesium'
import DrawingMode from '../Drawing/DrawingMode.js';
import PolylineDrawing from '../Drawing/PolylineDrawing.js';
import MeasurementSettings from './MeasurementSettings.js';
import MeasureUnits from './MeasureUnits.js';

    var cart2Scratch1 = new Cartesian2();
    var cart2Scratch2 = new Cartesian2();
    var cart2Scratch3 = new Cartesian2();

    var scratch = new Cartesian3();

    /**
     * @private
     * @ionsdk
     */
    function PolylineMeasurementDrawing(options) {
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
        PolylineDrawing.call(this, options);

        var scene = this._scene;
        var labels = options.labels;
        this._labelCollection = labels;
        this._label = labels.add(MeasurementSettings.getLabelOptions());
        this._segmentLabels = [];
        this._selectedUnits = options.units;
        this._selectedLocale = options.locale;
        this._previousDistance = 0;
        this._distance = 0;

        var that = this;
        this._removeEvent = scene.preRender.addEventListener(function() {
            that.updateLabel();
        });
    }

    PolylineMeasurementDrawing.prototype = Object.create(PolylineDrawing.prototype);
    PolylineMeasurementDrawing.prototype.constructor = PolylineMeasurementDrawing;

    defineProperties(PolylineMeasurementDrawing.prototype, {
        /**
         * Gets the distance in meters.
         * @type {Number}
         * @memberof PolylineMeasurementDrawing.prototype
         * @readonly
         */
        distance : {
            get : function() {
                return this._distance;
            }
        }
    });

    /**
     * Updates the label position.
     * @private
     */
    PolylineMeasurementDrawing.prototype.updateLabel = function() {
        var positions = this._positions;
        if (positions.length < 2) {
            return;
        }
        var scene = this._scene;
        var top = positions[0];
        var pos2d = SceneTransforms.wgs84ToWindowCoordinates(scene, top, cart2Scratch1);
        var lastScreenPos = defined(pos2d) ? Cartesian2.clone(pos2d, cart2Scratch3) : Cartesian2.fromElements(Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, cart2Scratch3);
        var topY = lastScreenPos.y;
        var labels = this._segmentLabels;
        labels[0].show = this._polyline.positions.length > 2;
        for (var i = 1; i < positions.length; i++) {
            var nextScreenPos = SceneTransforms.wgs84ToWindowCoordinates(scene, positions[i], cart2Scratch2);
            if (!defined(nextScreenPos)) {
                continue;
            }

            var m = (lastScreenPos.y - nextScreenPos.y) / (nextScreenPos.x - lastScreenPos.x);
            var label = labels[i - 1];
            if (m > 0) {
                label.horizontalOrigin = HorizontalOrigin.LEFT;
            } else {
                label.horizontalOrigin = HorizontalOrigin.RIGHT;
            }

            if (nextScreenPos.y < topY) {
                topY = nextScreenPos.y;
                top = positions[i];
            }
            lastScreenPos = Cartesian2.clone(nextScreenPos, lastScreenPos);
        }
        if (this._mode === DrawingMode.AfterDraw) {
            this._label.position = top;
        }
    };

    /**
     * Adds a point to the polyline.
     * @param {Cartesian3} position The position to add
     * @private
     */
    PolylineMeasurementDrawing.prototype.addPoint = function(position) {
        var positions = this._positions;
        if (positions.length > 0) {
            // store distance that was calculated on mouse move
            this._previousDistance = this._distance;

            var label = this._labelCollection.add(MeasurementSettings.getLabelOptions({
                scale : 0.8,
                horizontalOrigin : HorizontalOrigin.LEFT,
                verticalOrigin : VerticalOrigin.TOP,
                pixelOffset : new Cartesian2(5, 5)
            }));
            var p1 = positions[positions.length - 1];
            label.position = Cartesian3.midpoint(p1, position, new Cartesian3());
            label.text = MeasureUnits.distanceToString(Cartesian3.distance(p1, position), this._selectedUnits.distanceUnits, this._selectedLocale);
            label.show = true;
            this._segmentLabels.push(label);
        }
        PolylineDrawing.prototype.addPoint.call(this, position);
    };

    /**
     * Handles click events while drawing a polyline.
     * @param {Cartesian2} clickPosition The click position
     */
    PolylineMeasurementDrawing.prototype.handleClick = function(clickPosition) {
        if (this._mode === DrawingMode.AfterDraw) {
            this.reset();
        }
        var position = PolylineDrawing.prototype.handleClick.call(this, clickPosition);
        if (defined(position)) {
            this._label.show = true;
            this._polyline.show = true;
        }
    };

    /**
     * Handles mouse move events while drawing a polyline.
     * @param {Cartesian2} mousePosition The mouse position
     */
    PolylineMeasurementDrawing.prototype.handleMouseMove = function(mousePosition) {
        var nextPos = PolylineDrawing.prototype.handleMouseMove.call(this, mousePosition);
        if (!defined(nextPos)) {
            return;
        }

        var pos1 = this._positions[this._positions.length - 1];
        var pos2 = nextPos;
        var vec = Cartesian3.subtract(pos2, pos1, scratch);
        var distance = this._previousDistance + Cartesian3.magnitude(vec);

        var label = this._label;
        label.position = pos2;
        label.text = MeasureUnits.distanceToString(distance, this._selectedUnits.distanceUnits, this._selectedLocale);
        label.show = true;

        this._distance = distance;
    };

    /**
     * Resets the widget.
     */
    PolylineMeasurementDrawing.prototype.reset = function() {
        this._label.show = false;
        this._label.text = '';
        this._positions = [];
        this._polyline.positions = [];
        this._polyline.show = false;
        this._previousDistance = 0;
        this._distance = 0;

        var i;
        var points = this._points;
        var pointCollection = this._pointCollection;
        for (i = 0; i < points.length; i++) {
            pointCollection.remove(points[i]);
        }
        points.length = 0;

        var labelCollection = this._labelCollection;
        var labels = this._segmentLabels;
        for (i = 0; i < labels.length; i++) {
            labelCollection.remove(labels[i]);
        }
        labels.length = 0;

        this._mode = DrawingMode.BeforeDraw;
        this._lastClickPosition.x = Number.POSITIVE_INFINITY;
        this._lastClickPosition.y = Number.POSITIVE_INFINITY;
    };

    /**
     * Destroys the widget.
     */
    PolylineMeasurementDrawing.prototype.destroy = function() {
        this._removeEvent();

        var labelCollection = this._labelCollection;
        labelCollection.remove(this._label);
        var labels = this._segmentLabels;
        for (var i = 0; i < labels.length; i++) {
            labelCollection.remove(labels[i]);
        }

        PolylineDrawing.prototype.destroy.call(this);
    };
export default PolylineMeasurementDrawing;
