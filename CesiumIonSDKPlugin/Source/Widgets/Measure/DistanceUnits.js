import {freezeObject} from 'cesium'

    /**
     * Distance units used for the measure widget.
     *
     * @exports DistanceUnits
     * @ionsdk
     */
    var DistanceUnits = {
        /**
         * @type {String}
         * @constant
         */
        METERS: 'METERS',

        /**
         * @type {String}
         * @constant
         */
        CENTIMETERS: 'CENTIMETERS',

        /**
         * @type {String}
         * @constant
         */
        KILOMETERS: 'KILOMETERS',

        /**
         * @type {String}
         * @constant
         */
        FEET: 'FEET',

        /**
         * @type {String}
         * @constant
         */
        US_SURVEY_FEET: 'US_SURVEY_FEET',

        /**
         * @type {String}
         * @constant
         */
        INCHES: 'INCHES',

        /**
         * @type {String}
         * @constant
         */
        YARDS: 'YARDS',

        /**
         * @type {String}
         * @constant
         */
        MILES: 'MILES'
    };
export default freezeObject(DistanceUnits);
