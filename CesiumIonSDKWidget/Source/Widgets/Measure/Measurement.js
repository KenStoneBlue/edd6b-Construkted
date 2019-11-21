import {defaultValue} from 'cesium'
import {defineProperties} from 'cesium'
import {Check} from 'cesium'
import {DeveloperError} from 'cesium'

    /**
     * An abstract class defining a measurement.
     * @alias Measurement
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
    function Measurement(options) {
        options = defaultValue(options, defaultValue.EMPTY_OBJECT);

        //>>includeStart('debug', pragmas.debug);
        Check.defined('options.scene', options.scene);
        Check.defined('options.units', options.units);
        Check.defined('options.points', options.points);
        Check.defined('options.labels', options.labels);
        Check.defined('options.primitives', options.primitives);
        //>>includeEnd('debug');

        this._labelCollection = options.labels;
        this._pointCollection = options.points;
        this._primitives = options.primitives;
        this._selectedUnits = options.units;
        this._selectedLocale = options.locale;
        this._scene = options.scene;
    }

    defineProperties(Measurement.prototype, {
        /**
         * Gets the icon.
         * @type {String}
         * @memberof AreaMeasurement.prototype
         * @readonly
         */
        icon : {
            value : ''
        },
        /**
         * Gets the thumbnail.
         * @type {String}
         * @memberof AreaMeasurement.prototype
         * @readonly
         */
        thumbnail : {
            value : ''
        },
        /**
         * Gets the type.
         * @type {String}
         * @memberof AreaMeasurement.prototype
         * @readonly
         */
        type : {
            value : ''
        },
        /**
         * Gets the instruction text.
         * @type {String[]}
         * @memberof AreaMeasurement.prototype
         * @readonly
         */
        instructions : {
            value : []
        },
        /**
         * Gets the id.
         * @type {String}
         * @memberof AreaMeasurement.prototype
         * @readonly
         */
        id : {
            value : ''
        }
    });

    /**
     * Handles double click events while performing a measurement.
     */
    Measurement.prototype.handleDoubleClick = function() {};

    /**
     * Handles click events while performing a measurement.
     * @param {Cartesian2} clickPosition The click position
     */
    Measurement.prototype.handleClick = function(clickPosition) {};

    /**
     * Handles mouse move events while performing a measurement.
     * @param {Cartesian2} mousePosition The mouse position
     */
    Measurement.prototype.handleMouseMove = function(mousePosition) {};

    /**
     * Handles left down mouse events while performing a measurement.
     * @param {Cartesian2} mousePosition The mouse position
     */
    Measurement.prototype.handleLeftDown = function(mousePosition) {};

    /**
     * Handles left up mouse events while performing a measurement.
     * @param {Cartesian2} mousePosition The mouse position
     */
    Measurement.prototype.handleLeftUp = function(mousePosition) {};

    /**
     * Resets the widget.
     */
    Measurement.prototype.reset = DeveloperError.throwInstantiationError;

    /**
     * @returns {Boolean} true if the object has been destroyed, false otherwise.
     */
    Measurement.prototype.isDestroyed = function() {
        return false;
    };

    /**
     * Destroys the widget.
     */
    Measurement.prototype.destroy = DeveloperError.throwInstantiationError;
export default Measurement;
