import {defaultValue} from 'cesium'
import {defineProperties} from 'cesium'
import {destroyObject} from 'cesium'
import Measurement from './Measurement.js';
import AreaMeasurementDrawing from './AreaMeasurementDrawing.js';

    function getIcon(size) {
        return '<svg viewBox="0 0 30 30" height="' + size + 'px" width="' + size + 'px">\n\
                 <g transform="translate(0,-267)">\n\
                   <circle r="2.0788691" cy="293.99896" cx="3.8532958"/>\n\
                   <circle r="2.0788691" cy="282.76791" cx="26.927404"/>\n\
                   <circle r="2.0788691" cy="270.20621" cx="4.0090437"/>\n\
                   <path d="m 26.326048,283.77014 -9.394396,5.02295 -9.3943948,5.02295 0.3471933,-10.64726 0.3471933,-10.64726 9.0472022,5.62431 z" transform="matrix(1.1625734,0,0,0.99297729,-4.6787891,1.2180486)"/>\n\
                 </g>\n\
               </svg>';
    }

    /**
     * Creates a polygonal area measurement.
     * @alias AreaMeasurement
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
    function AreaMeasurement(options) {
        options = defaultValue(options, defaultValue.EMPTY_OBJECT);
        Measurement.call(this, options);

        this._drawing = new AreaMeasurementDrawing(options);
    }

    AreaMeasurement.prototype = Object.create(Measurement.prototype);
    AreaMeasurement.prototype.constructor = AreaMeasurement;

    defineProperties(AreaMeasurement.prototype, {
        /**
         * Gets the area value in meters squared
         * @type {Number}
         * @memberof AreaMeasurement.prototype
         * @readonly
         */
        area : {
            get : function() {
                return this._drawing.area;
            }
        },
        /**
         * Gets the icon.
         * @type {String}
         * @memberof AreaMeasurement.prototype
         * @readonly
         */
        icon : {
            value : getIcon(15)
        },
        /**
         * Gets the thumbnail.
         * @type {String}
         * @memberof AreaMeasurement.prototype
         * @readonly
         */
        thumbnail : {
            value : getIcon(25)
        },
        /**
         * Gets the type.
         * @type {String}
         * @memberof AreaMeasurement.prototype
         * @readonly
         */
        type : {
            value : 'Area'
        },
        /**
         * Gets the instruction text.
         * @type {String[]}
         * @memberof AreaMeasurement.prototype
         * @readonly
         */
        instructions : {
            value : [
                'Click to start drawing a polygon',
                'Keep clicking to add more points',
                'Double click to finish drawing'
            ]
        },
        /**
         * Gets the id.
         * @type {String}
         * @memberof AreaMeasurement.prototype
         * @readonly
         */
        id : {
            value : 'areaMeasurement'
        }
    });

    /**
     * Ends drawing on double click.
     */
    AreaMeasurement.prototype.handleDoubleClick = function() {
        this._drawing.handleDoubleClick();
    };

    /**
     * Handles click events while drawing a polygon.
     * @param {Cartesian2} clickPosition The click position
     */
    AreaMeasurement.prototype.handleClick = function(clickPosition) {
        this._drawing.handleClick(clickPosition);
    };

    /**
     * Handles mouse move events while drawing a polygon.
     * @param {Cartesian2} mousePosition The mouse position
     */
    AreaMeasurement.prototype.handleMouseMove = function(mousePosition) {
        this._drawing.handleMouseMove(mousePosition);
    };

    /**
     * Resets the widget.
     */
    AreaMeasurement.prototype.reset = function() {
        this._drawing.reset();
    };

    /**
     * @returns {Boolean} true if the object has been destroyed, false otherwise.
     */
    AreaMeasurement.prototype.isDestroyed = function() {
        return false;
    };

    /**
     * Destroys the widget.
     */
    AreaMeasurement.prototype.destroy = function() {
        this._drawing.destroy();

        return destroyObject(this);
    };
export default AreaMeasurement;
