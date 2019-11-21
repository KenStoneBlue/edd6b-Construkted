import {freezeObject} from 'cesium'

    /**
     * Area units used for the measure widget.
     *
     * @exports AreaUnits
     * @ionsdk
     */
    var AreaUnits = {
        /**
         * @type {String}
         * @constant
         */
        SQUARE_METERS: 'SQUARE_METERS',

        /**
         * @type {String}
         * @constant
         */
        SQUARE_CENTIMETERS: 'SQUARE_CENTIMETERS',

        /**
         * @type {String}
         * @constant
         */
        SQUARE_KILOMETERS: 'SQUARE_KILOMETERS',

        /**
         * @type {String}
         * @constant
         */
        SQUARE_FEET: 'SQUARE_FEET',

        /**
         * @type {String}
         * @constant
         */
        SQUARE_INCHES: 'SQUARE_INCHES',

        /**
         * @type {String}
         * @constant
         */
        SQUARE_YARDS: 'SQUARE_YARDS',

        /**
         * @type {String}
         * @constant
         */
        SQUARE_MILES: 'SQUARE_MILES',

        /**
         * @type {String}
         * @constant
         */
        ACRES: 'ACRES',

        /**
         * @type {String}
         * @constant
         */
        HECTARES: 'HECTARES'
    };
export default freezeObject(AreaUnits);
