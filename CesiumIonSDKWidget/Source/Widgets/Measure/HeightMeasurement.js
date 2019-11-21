import {defaultValue} from 'cesium'
import {defined} from 'cesium'
import {defineProperties} from 'cesium'
import {destroyObject} from 'cesium'
import {Cartesian2} from 'cesium'
import {Cartesian3} from 'cesium'
import {Cartographic} from 'cesium'
import {HorizontalOrigin} from 'cesium'
import PolylinePrimitive from '../Scene/PolylinePrimitive'
import {VerticalOrigin} from 'cesium'
import getWorldPosition from '../getWorldPosition.js';
import Measurement from './Measurement.js';
import MeasurementSettings from './MeasurementSettings.js';
import MeasureUnits from './MeasureUnits.js';

    var scratch = new Cartesian3();
    var scratchCarto = new Cartographic();

    function getIcon(size) {
        return '<svg viewBox="0 0 30 30" height="' + size + 'px" width="' + size + 'px">\n\
             <g transform="translate(0,-267)">\n\
               <path d="m 15.042838,272.34414 0.01712,19.60575"/>\n\
               <circle r="2.0788691" cy="270.01154" cx="15.078616"/>\n\
               <path d="m 0.64901081,296.20687 8.80039389,-6.01044 7.9375003,3.1183 12.347278,-3.34365"/>\n\
             </g>\n\
           </svg>';
    }

    /**
     * Draws a measurement between a selected point and the ground beneath that point.
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
     * @alias HeightMeasurement
     */
    function HeightMeasurement(options) {
        options = defaultValue(options, defaultValue.EMPTY_OBJECT);
        Measurement.call(this, options);

        var positions = [new Cartesian3(), new Cartesian3()];
        var pointCollection = this._pointCollection;

        this._startPoint = pointCollection.add(MeasurementSettings.getPointOptions());
        this._endPoint = pointCollection.add(MeasurementSettings.getPointOptions());

        this._polyline = this._primitives.add(new PolylinePrimitive(MeasurementSettings.getPolylineOptions({
            ellipsoid : this._scene.frameState.mapProjection.ellipsoid,
            positions : positions
        })));

        this._label = this._labelCollection.add(MeasurementSettings.getLabelOptions({
            horizontalOrigin : HorizontalOrigin.LEFT,
            verticalOrigin : VerticalOrigin.TOP,
            pixelOffset : new Cartesian2(10, 10)
        }));

        this._positions = positions;
        this._distance = 0;
    }

    HeightMeasurement.prototype = Object.create(Measurement.prototype);
    HeightMeasurement.prototype.constructor = HeightMeasurement;

    defineProperties(HeightMeasurement.prototype, {
        /**
         * Gets the distance in meters
         * @type {Number}
         * @memberof HeightMeasurement.prototype
         * @readonly
         */
        distance : {
            get : function() {
                return this._distance;
            }
        },
        /**
         * Gets the icon.
         * @type {String}
         * @memberof HeightMeasurement.prototype
         * @readonly
         */
        icon : {
            value : getIcon(15)
        },
        /**
         * Gets the thumbnail.
         * @type {String}
         * @memberof HeightMeasurement.prototype
         * @readonly
         */
        thumbnail : {
            value : getIcon(25)
        },
        /**
         * Gets the type.
         * @type {String}
         * @memberof HeightMeasurement.prototype
         * @readonly
         */
        type : {
            value : 'Height from terrain'
        },
        /**
         * Gets the instruction text.
         * @type {String[]}
         * @memberof HeightMeasurement.prototype
         * @readonly
         */
        instructions : {
            value : [
                'Click on the point cloud to get a distance from that point to terrain'
            ]
        },
        /**
         * Gets the id.
         * @type {String}
         * @memberof HeightMeasurement.prototype
         * @readonly
         */
        id : {
            value : 'heightMeasurement'
        }
    });

    /**
     * Handles click events while drawing a height measurement.
     * @param {Cartesian2} clickPosition The click position
     */
    HeightMeasurement.prototype.handleClick = function(clickPosition) {
        var scene = this._scene;
        this.reset();

        var positions = this._positions;

        var pos0 = HeightMeasurement._getWorldPosition(scene, clickPosition, positions[0]);
        if (!defined(pos0)) {
            return;
        }

        var globe = scene.globe;
        var ellipsoid = scene.frameState.mapProjection.ellipsoid;

        var carto = ellipsoid.cartesianToCartographic(pos0, scratchCarto);
        if (defined(globe)) {
            carto.height = defaultValue(globe.getHeight(carto), 0);
        } else {
            carto.height = 0;
        }
        var pos1 = ellipsoid.cartographicToCartesian(carto, positions[1]);

        var vec = Cartesian3.subtract(pos1, pos0, scratch);
        var distance = Cartesian3.magnitude(vec);

        var label = this._label;
        label.position = pos0;
        label.show = true;
        label.text = MeasureUnits.distanceToString(distance, this._selectedUnits.distanceUnits, this._selectedLocale);

        this._polyline.positions = positions;
        this._polyline.show = true;
        this._startPoint.position = pos0;
        this._startPoint.show = true;
        this._endPoint.position = pos1;
        this._endPoint.show = true;

        this._distance = distance;
    };

    /**
     * Resets the widget.
     */
    HeightMeasurement.prototype.reset = function() {
        this._polyline.show = false;
        this._label.show = false;
        this._startPoint.show = false;
        this._endPoint.show = false;
        this._distance = 0;
    };

    /**
     * @returns {Boolean} true if the object has been destroyed, false otherwise.
     */
    HeightMeasurement.prototype.isDestroyed = function() {
        return false;
    };

    /**
     * Destroys the measurement.
     */
    HeightMeasurement.prototype.destroy = function() {
        this._primitives.remove(this._polyline);

        var points = this._pointCollection;
        points.remove(this._startPoint);
        points.remove(this._endPoint);

        this._labelCollection.remove(this._label);

        return destroyObject(this);
    };

    // exposed for specs
    HeightMeasurement._getWorldPosition = getWorldPosition;
export default HeightMeasurement;
