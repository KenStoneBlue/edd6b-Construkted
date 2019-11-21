import {freezeObject} from 'cesium'

    /**
     * Angle units used for the measure widget.
     *
     * @exports AngleUnits
     * @ionsdk
     */
    var AngleUnits = {
        /**
         * @type {String}
         * @constant
         */
        DEGREES: 'DEGREES',

        /**
         * @type {String}
         * @constant
         */
        RADIANS: 'RADIANS',

        /**
         * @type {String}
         * @constant
         */
        DEGREES_MINUTES_SECONDS: 'DEGREES_MINUTES_SECONDS',

        /**
         * @type {String}
         * @constant
         */
        GRADE: 'GRADE',

        /**
         * @type {String}
         * @constant
         */
        RATIO: 'RATIO'
    };
export default freezeObject(AngleUnits);
