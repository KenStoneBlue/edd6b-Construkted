import {Check} from 'cesium'
import {defaultValue} from 'cesium'
import {defined} from 'cesium'
import {DeveloperError} from 'cesium'
import {Math as CesiumMath} from 'cesium'
import {RuntimeError} from 'cesium'
import DistanceUnits from './DistanceUnits.js';
import AreaUnits from './AreaUnits.js';
import VolumeUnits from './VolumeUnits.js';
import AngleUnits from './AngleUnits.js';

    /**
     * Units of measure used for the measure widget.
     *
     * @param {Object} options Object with the following properties:
     * @param {DistanceUnits} [options.distanceUnits=DistanceUnits.METERS] Distance units.
     * @param {AreaUnits} [options.areaUnits=AreaUnits.SQUARE_METERS] The base unit for area.
     * @param {VolumeUnits} [options.volumeUnits=VolumeUnits.CUBIC_METERS] The base unit for volume.
     * @param {AngleUnits} [options.angleUnits=AngleUnits.DEGREES] Angle units.
     * @param {AngleUnits} [options.slopeUnits=AngleUnits.DEGREES] Slope units.
     *
     * @alias MeasureUnits
     * @constructor
     * @ionsdk
     */
    function MeasureUnits(options) {
        options = defaultValue(options, defaultValue.EMPTY_OBJECT);
        this.distanceUnits = defaultValue(options.distanceUnits, DistanceUnits.METERS);
        this.areaUnits = defaultValue(options.areaUnits, AreaUnits.SQUARE_METERS);
        this.volumeUnits = defaultValue(options.volumeUnits, VolumeUnits.CUBIC_METERS);
        this.angleUnits = defaultValue(options.angleUnits, AngleUnits.DEGREES);
        this.slopeUnits = defaultValue(options.slopeUnits, AngleUnits.DEGREES);
    }

    /**
     * @private
     */
    MeasureUnits.convertDistance = function(distance, from, to) {
        if (from === to) {
            return distance;
        }
        var toMeters = getDistanceUnitConversion(from);
        var fromMeters = 1.0 / getDistanceUnitConversion(to);
        return distance * toMeters * fromMeters;
    };

    /**
     * @private
     */
    MeasureUnits.convertArea = function(area, from, to) {
        if (from === to) {
            return area;
        }
        var toMeters = getAreaUnitConversion(from);
        var fromMeters = 1.0 / getAreaUnitConversion(to);
        return area * toMeters * fromMeters;
    };

    /**
     * @private
     */
    MeasureUnits.convertVolume = function(volume, from, to) {
        if (from === to) {
            return volume;
        }
        var toMeters = getVolumeUnitConversion(from);
        var fromMeters = 1.0 / getVolumeUnitConversion(to);
        return volume * toMeters * fromMeters;
    };

    /**
     * @private
     */
    MeasureUnits.convertAngle = function(angle, from, to) {
        if (from === to) {
            return angle;
        }
        var radians = convertAngleToRadians(angle, from);
        return convertAngleFromRadians(radians, to);
    };

    /**
     * @private
     */
    MeasureUnits.numberToString = function(number, selectedLocale, maximumFractionDigits, minimumFractionDigits) {
        return numberToFormattedString(number, selectedLocale, maximumFractionDigits, minimumFractionDigits);
    };

    /**
     * @private
     */
    MeasureUnits.distanceToString = function(meters, distanceUnits, selectedLocale, maximumFractionDigits, minimumFractionDigits) {
        var distance = MeasureUnits.convertDistance(meters, DistanceUnits.METERS, distanceUnits);
        return numberToFormattedString(distance, selectedLocale, maximumFractionDigits, minimumFractionDigits) +
            MeasureUnits.getDistanceUnitSpacing(distanceUnits) + MeasureUnits.getDistanceUnitSymbol(distanceUnits);
    };

    /**
     * @private
     */
    MeasureUnits.areaToString = function(metersSquared, areaUnits, selectedLocale, maximumFractionDigits, minimumFractionDigits) {
        var area = MeasureUnits.convertArea(metersSquared, AreaUnits.SQUARE_METERS, areaUnits);
        return numberToFormattedString(area, selectedLocale, maximumFractionDigits, minimumFractionDigits) +
            MeasureUnits.getAreaUnitSpacing(areaUnits) + MeasureUnits.getAreaUnitSymbol(areaUnits);
    };

    /**
     * @private
     */
    MeasureUnits.volumeToString = function(metersCubed, volumeUnits, selectedLocale, maximumFractionDigits, minimumFractionDigits) {
        var volume = MeasureUnits.convertVolume(metersCubed, VolumeUnits.CUBIC_METERS, volumeUnits);
        return numberToFormattedString(volume, selectedLocale, maximumFractionDigits, minimumFractionDigits) +
            MeasureUnits.getVolumeUnitSpacing(volumeUnits) + MeasureUnits.getVolumeUnitSymbol(volumeUnits);
    };

    /**
     * @private
     */
    MeasureUnits.angleToString = function(angleRadians, angleUnits, selectedLocale, maximumFractionDigits, minimumFractionDigits) {
        if ((angleUnits === AngleUnits.DEGREES) || (angleUnits === AngleUnits.RADIANS) || (angleUnits === AngleUnits.GRADE)) {
            var angle = convertAngleFromRadians(angleRadians, angleUnits);
            return numberToFormattedString(angle, selectedLocale, maximumFractionDigits, minimumFractionDigits) +
                MeasureUnits.getAngleUnitSpacing(angleUnits) + MeasureUnits.getAngleUnitSymbol(angleUnits);
        } else if (angleUnits === AngleUnits.DEGREES_MINUTES_SECONDS) {
            var deg = CesiumMath.toDegrees(angleRadians);
            var sign = deg < 0 ? '-' : '';
            deg = Math.abs(deg);
            var d = Math.floor(deg);
            var minfloat = (deg - d) * 60;
            var m = Math.floor(minfloat);
            var s = (minfloat - m) * 60;
            s = numberToFormattedString(s, undefined, maximumFractionDigits, minimumFractionDigits); // The locale is undefined so that a period is used instead of a comma for the decimal
            return sign + d + '° ' + m + '\' ' + s + '"';
        } else if (angleUnits === AngleUnits.RATIO) {
            var riseOverRun = convertAngleFromRadians(angleRadians, angleUnits);
            var run = 1.0 / riseOverRun;
            return '1:' + numberToFormattedString(run, selectedLocale, maximumFractionDigits, 0);
        }
    };

    /**
     * @private
     */
    MeasureUnits.longitudeToString = function(longitude, angleUnits, selectedLocale, maximumFractionDigits, minimumFractionDigits) {
        return MeasureUnits.angleToString(Math.abs(longitude), angleUnits, selectedLocale, maximumFractionDigits, minimumFractionDigits) + ' ' + (longitude < 0.0 ? 'W' : 'E');
    };

    /**
     * @private
     */
    MeasureUnits.latitudeToString = function(latitude, angleUnits, selectedLocale, maximumFractionDigits, minimumFractionDigits) {
        return MeasureUnits.angleToString(Math.abs(latitude), angleUnits, selectedLocale, maximumFractionDigits, minimumFractionDigits) + ' ' + (latitude < 0.0 ? 'S' : 'N');
    };

    /**
     * @private
     */
    MeasureUnits.getDistanceUnitSymbol = function(distanceUnits) {
        //>>includeStart('debug', pragmas.debug);
        Check.typeOf.string('distanceUnits', distanceUnits);
        //>>includeEnd('debug');

        if (distanceUnits === DistanceUnits.METERS) {
            return 'm';
        } else if (distanceUnits === DistanceUnits.CENTIMETERS) {
            return 'cm';
        } else if (distanceUnits === DistanceUnits.KILOMETERS) {
            return 'km';
        } else if ((distanceUnits === DistanceUnits.FEET) || (distanceUnits === DistanceUnits.US_SURVEY_FEET)) {
            return 'ft';
        } else if (distanceUnits === DistanceUnits.INCHES) {
            return 'in';
        } else if (distanceUnits === DistanceUnits.YARDS) {
            return 'yd';
        } else if (distanceUnits === DistanceUnits.MILES) {
            return 'mi';
        }
        //>>includeStart('debug', pragmas.debug);
        throw new DeveloperError('Invalid distance units: ' + distanceUnits);
        //>>includeEnd('debug');
    };

    MeasureUnits.getDistanceUnitSpacing = function(distanceUnits) {
        //>>includeStart('debug', pragmas.debug);
        Check.typeOf.string('distanceUnits', distanceUnits);
        //>>includeEnd('debug');

        return ' ';
    };

    /**
     * @private
     */
    MeasureUnits.getAreaUnitSymbol = function(areaUnits) {
        //>>includeStart('debug', pragmas.debug);
        Check.typeOf.string('areaUnits', areaUnits);
        //>>includeEnd('debug');

        if (areaUnits === AreaUnits.SQUARE_METERS) {
            return 'm²';
        } else if (areaUnits === AreaUnits.SQUARE_CENTIMETERS) {
            return 'cm²';
        } else if (areaUnits === AreaUnits.SQUARE_KILOMETERS) {
            return 'km²';
        } else if (areaUnits === AreaUnits.SQUARE_FEET) {
            return 'sq ft';
        } else if (areaUnits === AreaUnits.SQUARE_INCHES) {
            return 'sq in';
        } else if (areaUnits === AreaUnits.SQUARE_YARDS) {
            return 'sq yd';
        } else if (areaUnits === AreaUnits.SQUARE_MILES) {
            return 'sq mi';
        } else if (areaUnits === AreaUnits.ACRES) {
            return 'ac';
        } else if (areaUnits === AreaUnits.HECTARES) {
            return 'ha';
        }
        //>>includeStart('debug', pragmas.debug);
        throw new DeveloperError('Invalid area units: ' + areaUnits);
        //>>includeEnd('debug');
    };

    /**
     * @private
     */
    MeasureUnits.getAreaUnitSpacing = function(areaUnits) {
        //>>includeStart('debug', pragmas.debug);
        Check.typeOf.string('areaUnits', areaUnits);
        //>>includeEnd('debug');

        return ' ';
    };

    /**
     * @private
     */
    MeasureUnits.getVolumeUnitSymbol = function(volumeUnits) {
        //>>includeStart('debug', pragmas.debug);
        Check.typeOf.string('volumeUnits', volumeUnits);
        //>>includeEnd('debug');

        if (volumeUnits === VolumeUnits.CUBIC_METERS) {
            return 'm³';
        } else if (volumeUnits === VolumeUnits.CUBIC_CENTIMETERS) {
            return 'cm³';
        } else if (volumeUnits === VolumeUnits.CUBIC_KILOMETERS) {
            return 'km³';
        } else if (volumeUnits === VolumeUnits.CUBIC_FEET) {
            return 'cu ft';
        } else if (volumeUnits === VolumeUnits.CUBIC_INCHES) {
            return 'cu in';
        } else if (volumeUnits === VolumeUnits.CUBIC_YARDS) {
            return 'cu yd';
        } else if (volumeUnits === VolumeUnits.CUBIC_MILES) {
            return 'cu mi';
        }
        //>>includeStart('debug', pragmas.debug);
        throw new DeveloperError('Invalid volume units: ' + volumeUnits);
        //>>includeEnd('debug');
    };

    /**
     * @private
     */
    MeasureUnits.getVolumeUnitSpacing = function(volumeUnits) {
        //>>includeStart('debug', pragmas.debug);
        Check.typeOf.string('volumeUnits', volumeUnits);
        //>>includeEnd('debug');

        return ' ';
    };

    /**
     * @private
     */
    MeasureUnits.getAngleUnitSymbol = function(angleUnits) {
        //>>includeStart('debug', pragmas.debug);
        Check.typeOf.string('angleUnits', angleUnits);
        //>>includeEnd('debug');

        if (angleUnits === AngleUnits.DEGREES) {
            return '°';
        } else if (angleUnits === AngleUnits.RADIANS) {
            return 'rad';
        } else if (angleUnits === AngleUnits.GRADE) {
            return '%';
        }
        //>>includeStart('debug', pragmas.debug);
        throw new DeveloperError('Invalid angle units: ' + angleUnits);
        //>>includeEnd('debug');
    };

    /**
     * @private
     */
    MeasureUnits.getAngleUnitSpacing = function(angleUnits) {
        //>>includeStart('debug', pragmas.debug);
        Check.typeOf.string('angleUnits', angleUnits);
        //>>includeEnd('debug');

        if (angleUnits === AngleUnits.RADIANS) {
            return ' ';
        }
        return '';
    };

    var negativeZero = -0.0;
    var positiveZero = 0.0;
    function numberToFormattedString(number, selectedLocale, maximumFractionDigits, minimumFractionDigits) {
        maximumFractionDigits = defaultValue(maximumFractionDigits, 2);
        minimumFractionDigits = defaultValue(minimumFractionDigits, maximumFractionDigits);
        var localeStringOptions = {
            minimumFractionDigits: minimumFractionDigits,
            maximumFractionDigits: maximumFractionDigits
        };
        // If locale is undefined, the runtime's default locale is used.
        var numberString = number.toLocaleString(selectedLocale, localeStringOptions);
        var negativeZeroString = negativeZero.toLocaleString(selectedLocale, localeStringOptions);
        if (numberString === negativeZeroString) {
            return positiveZero.toLocaleString(selectedLocale, localeStringOptions);
        }
        return numberString;
    }

    function getDistanceUnitConversion(distanceUnits) {
        if (distanceUnits === DistanceUnits.METERS) {
            return 1.0;
        } else if (distanceUnits === DistanceUnits.CENTIMETERS) {
            return 0.01;
        } else if (distanceUnits === DistanceUnits.KILOMETERS) {
            return 1000.0;
        } else if (distanceUnits === DistanceUnits.FEET) {
            return 0.3048;
        } else if (distanceUnits === DistanceUnits.US_SURVEY_FEET) {
            return 1200.0 / 3937.0;
        } else if (distanceUnits === DistanceUnits.INCHES) {
            return 0.0254;
        } else if (distanceUnits === DistanceUnits.YARDS) {
            return 0.9144;
        } else if (distanceUnits === DistanceUnits.MILES) {
            return 1609.344;
        }
        //>>includeStart('debug', pragmas.debug);
        throw new DeveloperError('Invalid distance units:' + distanceUnits);
        //>>includeEnd('debug');
    }

    function getAreaUnitConversion(areaUnits) {
        if (areaUnits === AreaUnits.SQUARE_METERS) {
            return 1.0;
        } else if (areaUnits === AreaUnits.SQUARE_CENTIMETERS) {
            return 0.0001;
        } else if (areaUnits === AreaUnits.SQUARE_KILOMETERS) {
            return 1000000.0;
        } else if (areaUnits === AreaUnits.SQUARE_FEET) {
            return 0.3048 * 0.3048;
        } else if (areaUnits === AreaUnits.SQUARE_INCHES) {
            return 0.0254 * 0.0254;
        } else if (areaUnits === AreaUnits.SQUARE_YARDS) {
            return 0.9144 * 0.9144;
        } else if (areaUnits === AreaUnits.SQUARE_MILES) {
            return 1609.344 * 1609.344;
        } else if (areaUnits === AreaUnits.ACRES) {
            return 4046.85642232;
        } else if (areaUnits === AreaUnits.HECTARES) {
            return 10000.0;
        }
        //>>includeStart('debug', pragmas.debug);
        throw new DeveloperError('Invalid area units:' + areaUnits);
        //>>includeEnd('debug');
    }

    function getVolumeUnitConversion(volumeUnits) {
        if (volumeUnits === VolumeUnits.CUBIC_METERS) {
            return 1.0;
        } else if (volumeUnits === VolumeUnits.CUBIC_CENTIMETERS) {
            return 0.000001;
        } else if (volumeUnits === VolumeUnits.CUBIC_KILOMETERS) {
            return 1000000000.0;
        } else if (volumeUnits === VolumeUnits.CUBIC_FEET) {
            return 0.3048 * 0.3048 * 0.3048;
        } else if (volumeUnits === VolumeUnits.CUBIC_INCHES) {
            return 0.0254 * 0.0254 * 0.0254;
        } else if (volumeUnits === VolumeUnits.CUBIC_YARDS) {
            return 0.9144 * 0.9144 * 0.9144;
        } else if (volumeUnits === VolumeUnits.CUBIC_MILES) {
            return 1609.344 * 1609.344 * 1609.344;
        }
        //>>includeStart('debug', pragmas.debug);
        throw new DeveloperError('Invalid volume units:' + volumeUnits);
        //>>includeEnd('debug');
    }

    var degreesMinutesSecondsRegex = /(-?)(\d+)\s*°\s*(\d+)\s*'\s*([\d.,]+)"\s*([WENS]?)/i;

    function convertAngleToRadians(value, angleUnits) {
        if (angleUnits === AngleUnits.RADIANS) {
            return value;
        } else if (angleUnits === AngleUnits.DEGREES) {
            return CesiumMath.toRadians(value);
        } else if (angleUnits === AngleUnits.GRADE) {
            if (value === Number.POSITIVE_INFINITY) {
                return CesiumMath.PI_OVER_TWO;
            }
            return Math.atan(value / 100.0);
        } else if (angleUnits === AngleUnits.RATIO) {
            // Converts to radians where value is rise/run
            return Math.atan(value);
        } else if (angleUnits === AngleUnits.DEGREES_MINUTES_SECONDS) {
            var matches = degreesMinutesSecondsRegex.exec(value);
            if (!defined(matches)) {
                throw new RuntimeError('Could not convert angle to radians: ' + value);
            }
            var sign = matches[1].length > 0 ? -1.0 : 1.0;
            var degrees = parseInt(matches[2]);
            var minutes = parseInt(matches[3]);
            var seconds = parseFloat(matches[4]);
            var cardinal = matches[5];

            if (cardinal.length === 1) {
                cardinal = cardinal.toUpperCase();
                if (cardinal === 'W' || cardinal === 'S') {
                    sign *= -1.0;
                }
            }

            var degreesDecimal = sign * (degrees + minutes / 60.0 + seconds / 3600.0);
            return CesiumMath.toRadians(degreesDecimal);
        }

        //>>includeStart('debug', pragmas.debug);
        throw new DeveloperError('Invalid angle units: ' + angleUnits);
        //>>includeEnd('debug');
    }

    function convertAngleFromRadians(value, angleUnits) {
        if (angleUnits === AngleUnits.RADIANS) {
            return value;
        } else if (angleUnits === AngleUnits.DEGREES) {
            return CesiumMath.toDegrees(value);
        } else if (angleUnits === AngleUnits.GRADE) {
            value = CesiumMath.clamp(value, 0.0, CesiumMath.PI_OVER_TWO);
            if (value === CesiumMath.PI_OVER_TWO) {
                return Number.POSITIVE_INFINITY;
            }
            return 100.0 * Math.tan(value);
        } else if (angleUnits === AngleUnits.RATIO) {
            var rise = Math.sin(value);
            var run = Math.cos(value);
            return rise / run;
        }
        //>>includeStart('debug', pragmas.debug);
        throw new DeveloperError('Invalid angle units: ' + angleUnits);
        //>>includeEnd('debug');
    }
export default MeasureUnits;
