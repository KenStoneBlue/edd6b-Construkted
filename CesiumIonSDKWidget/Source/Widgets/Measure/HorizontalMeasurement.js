import {defaultValue} from 'cesium'
import {defineProperties} from 'cesium'
import {destroyObject} from 'cesium'
import {Check} from 'cesium'
import HorizontalMeasurementDrawing from './HorizontalMeasurementDrawing.js';
import Measurement from './Measurement.js';

    function getIcon(size) {
        return '<svg viewBox="0 0 30 30" height="' + size + 'px" width="' + size + 'px">\n\
                 <g transform="translate(0,-267)">\n\
                   <path d="m 5.5492003,281.78808 18.9375757,0.0497"/>\n\
                   <circle r="2.0788691" cy="281.63776" cx="3.0514872"/>\n\
                   <circle r="2.0788691" cy="281.71384" cx="26.985731"/>\n\
                 </g>\n\
               </svg>';
    }

    /**
     * Draws a measurement between two points with the same height.
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
     * @alias HorizontalMeasurement
     */
    function HorizontalMeasurement(options) {
        options = defaultValue(options, defaultValue.EMPTY_OBJECT);
        Measurement.call(this, options);

        this._drawing = new HorizontalMeasurementDrawing(options);
    }

    HorizontalMeasurement.prototype = Object.create(Measurement.prototype);
    HorizontalMeasurement.prototype.constructor = HorizontalMeasurement;

    defineProperties(HorizontalMeasurement.prototype, {
        /**
         * Gets the distance in meters
         * @type {Number}
         * @memberof HorizontalMeasurement.prototype
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
         * @memberof HorizontalMeasurement.prototype
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
         * @memberof HorizontalMeasurement.prototype
         * @readonly
         */
        type : {
            value : 'Horizontal distance'
        },
        /**
         * Gets the instruction text.
         * @type {String[]}
         * @memberof HorizontalMeasurement.prototype
         * @readonly
         */
        instructions : {
            value : [
                'Click on the point cloud or the globe to set the start point',
                'Move the mouse to drag the line',
                'Press this shift key to clamp the direction of the line',
                'Click again to set the end point',
                'To make a new measurement, click to clear the previous measurement'
            ]
        },
        /**
         * Gets the id.
         * @type {String}
         * @memberof HorizontalMeasurement.prototype
         * @readonly
         */
        id : {
            value : 'horizontalMeasurement'
        }
    });

    /**
     * Ends drawing on double click.
     */
    HorizontalMeasurement.prototype.handleDoubleClick = function() {
        this._drawing.handleDoubleClick();
    };

    /**
     * Handles click events while drawing a horizontal measurement.
     * @param {Cartesian2} clickPosition The click position
     */
    HorizontalMeasurement.prototype.handleClick = function(clickPosition) {
        //>>includeStart('debug', pragmas.debug);
        Check.defined('clickPosition', clickPosition);
        //>>includeEnd('debug');

        this._drawing.handleClick(clickPosition);
    };

    /**
     * Handles mouse movements while drawing a horizontal measurement.
     * @param {Cartesian2} mousePosition The mouse position
     * @param {Boolean} shift True if the shift key was pressed
     */
    HorizontalMeasurement.prototype.handleMouseMove = function(mousePosition, shift) {
        //>>includeStart('debug', pragmas.debug);
        Check.defined('mousePosition', mousePosition);
        Check.defined('shift', shift);
        //>>includeEnd('debug');

        this._drawing.handleMouseMove(mousePosition, shift);
    };

    /**
     * Resets the measurement.
     */
    HorizontalMeasurement.prototype.reset = function() {
        this._drawing.reset();
    };

    /**
     * @returns {Boolean} true if the object has been destroyed, false otherwise.
     */
    HorizontalMeasurement.prototype.isDestroyed = function() {
        return false;
    };

    /**
     * Destroys the measurement.
     */
    HorizontalMeasurement.prototype.destroy = function() {
        this._drawing.destroy();

        return destroyObject(this);
    };
export default HorizontalMeasurement;
