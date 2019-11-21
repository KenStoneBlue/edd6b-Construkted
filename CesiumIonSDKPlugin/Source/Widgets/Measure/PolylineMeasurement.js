import {defaultValue} from 'cesium'
import {defineProperties} from 'cesium'
import {destroyObject} from 'cesium'
import Measurement from './Measurement.js';
import PolylineMeasurementDrawing from './PolylineMeasurementDrawing.js';

    function getIcon(size) {
        return '<svg viewBox="0 0 30 30" height="' + size + 'px" width="' + size + 'px">\n\
                  <g transform="translate(0,-267)">\n\
                   <circle cx="3.8532958" cy="293.99896" r="2.0788691" />\n\
                   <circle cx="7.2651663" cy="276.26389" r="2.0788691" />\n\
                   <circle cx="24.571842" cy="285.56577" r="2.0788691" />\n\
                   <circle cx="26.916754" cy="270.38345" r="2.0788691" />\n\
                   <path d="m 3.7523356,294.14823 3.602242,-17.81109 17.3608064,9.35582 2.401494,-15.00934" />\n\
                 </g>\n\
               </svg>';
    }

    /**
     * Creates an multi-line distance measurement.
     * @alias PolylineMeasurement
     * @ionsdk
     *
     * @param {Object} options An object with the following properties:
     * @param {Scene} options.scene The scene
     * @param {MeasureUnits} options.units The selected units of measurement
     * @param {String} [options.locale] The {@link https://tools.ietf.org/html/rfc5646|BCP 47 language tag} string customizing language-sensitive number formatting. If <code>undefined</code>, the runtime's default locale is used. See the {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl#Locale_identification_and_negotiation|Intl page on MDN}
     * @param {PrimitiveCollection} options.primitives A collection in which to store the measurement primitives
     * @param {LabelCollection} options.labels A collection in which to add the labels
     * @param {PointPrimitiveCollection} options.points A collection in which to add points
     *
     * @constructor
     */
    function PolylineMeasurement(options) {
        options = defaultValue(options, defaultValue.EMPTY_OBJECT);
        Measurement.call(this, options);

        this._drawing = new PolylineMeasurementDrawing(options);
    }

    PolylineMeasurement.prototype = Object.create(Measurement.prototype);
    PolylineMeasurement.prototype.constructor = PolylineMeasurement;

    defineProperties(PolylineMeasurement.prototype, {
        /**
         * Gets the distance in meters.
         * @type {Number}
         * @memberof PolylineMeasurement.prototype
         * @readonly
         */
        distance : {
            get : function() {
                return this._drawing.distance;
            }
        },
        /**
         * Gets the icon.
         * @type {String}
         * @memberof PolylineMeasurement.prototype
         * @readonly
         */
        icon : {
            value : getIcon(15)
        },
        /**
         * Gets the thumbnail.
         * @type {String}
         * @memberof PolylineMeasurement.prototype
         * @readonly
         */
        thumbnail : {
            value : getIcon(25)
        },
        /**
         * Gets the type.
         * @type {String}
         * @memberof PolylineMeasurement.prototype
         * @readonly
         */
        type : {
            value : 'Polyline Distance'
        },
        /**
         * Gets the instruction text.
         * @type {String[]}
         * @memberof PolylineMeasurement.prototype
         * @readonly
         */
        instructions : {
            value : [
                'Click to start drawing a polyline',
                'Keep clicking to add more points',
                'Double click to finish drawing'
            ]
        },
        /**
         * Gets the id.
         * @type {String}
         * @memberof PolylineMeasurement.prototype
         * @readonly
         */
        id : {
            value : 'polylineMeasurement'
        }
    });

    /**
     * Ends drawing on double click.
     */
    PolylineMeasurement.prototype.handleDoubleClick = function() {
        this._drawing.handleDoubleClick();
    };

    /**
     * Handles click events while drawing a polyline.
     * @param {Cartesian2} clickPosition The click position
     */
    PolylineMeasurement.prototype.handleClick = function(clickPosition) {
        this._drawing.handleClick(clickPosition);
    };

    /**
     * Handles mouse move events while drawing a polyline.
     * @param {Cartesian2} mousePosition The mouse position
     */
    PolylineMeasurement.prototype.handleMouseMove = function(mousePosition) {
        this._drawing.handleMouseMove(mousePosition);
    };

    /**
     * Resets the widget.
     */
    PolylineMeasurement.prototype.reset = function() {
        this._drawing.reset();
    };

    /**
     * @returns {Boolean} true if the object has been destroyed, false otherwise.
     */
    PolylineMeasurement.prototype.isDestroyed = function() {
        return false;
    };

    /**
     * Destroys the widget.
     */
    PolylineMeasurement.prototype.destroy = function() {
        this._drawing.destroy();

        return destroyObject(this);
    };
export default PolylineMeasurement;
