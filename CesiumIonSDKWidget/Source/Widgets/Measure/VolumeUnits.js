import {freezeObject} from 'cesium'

    /**
     * Volume units used for the measure widget.
     *
     * @exports VolumeUnits
     * @ionsdk
     */
    var VolumeUnits = {
        /**
         * @type {String}
         * @constant
         */
        CUBIC_METERS: 'CUBIC_METERS',

        /**
         * @type {String}
         * @constant
         */
        CUBIC_CENTIMETERS: 'CUBIC_CENTIMETERS',

        /**
         * @type {String}
         * @constant
         */
        CUBIC_KILOMETERS: 'CUBIC_KILOMETERS',

        /**
         * @type {String}
         * @constant
         */
        CUBIC_FEET: 'CUBIC_FEET',

        /**
         * @type {String}
         * @constant
         */
        CUBIC_INCHES: 'CUBIC_INCHES',

        /**
         * @type {String}
         * @constant
         */
        CUBIC_YARDS: 'CUBIC_YARDS',

        /**
         * @type {String}
         * @constant
         */
        CUBIC_MILES: 'CUBIC_MILES'
    };
export default freezeObject(VolumeUnits);
