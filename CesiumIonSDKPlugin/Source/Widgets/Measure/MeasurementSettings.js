import {defaultValue} from 'cesium'
import {defined} from 'cesium'
import {Cartesian2} from 'cesium'
import {Cartesian3} from 'cesium'
import {Color} from 'cesium'
import {HorizontalOrigin} from 'cesium'
import {VerticalOrigin} from 'cesium'

    var defaultLabelPixelOffset = new Cartesian2(0, -9);

    /**
     * Contains options for configuring the style of the measurement widget primitives.
     *
     * @exports MeasurementSettings
     * @ionsdk
     */
    var MeasurementSettings = {};

    /**
     * Gets and sets the color used for the measurement primitives.
     * @type {Color}
     * @default Color.YELLOW
     */
    MeasurementSettings.color = Color.YELLOW;

    /**
     * Gets and sets the font used for the measurement labels.
     * @type {string}
     * @default '24px sans-serif'
     */
    MeasurementSettings.labelFont = '16px Lucida Console';

    /**
     * Gets and sets the color used for the measurement labels.
     * @type {Color}
     * @default Color.WHITE
     */
    MeasurementSettings.textColor = Color.WHITE;

    /**
     * Gets and sets the background color used for the measurement labels.
     * @type {Color}
     * @default Cesium.Color(0.165, 0.165, 0.165, 0.8);
     */
    MeasurementSettings.backgroundColor = new Color(0.165, 0.165, 0.165, 0.8);

    /**
     * Gets and sets the background the horizontal and vertical background padding in pixels.
     * @type {Cartesian2}
     * @default Cesium.Cartesian2(7, 5);
     */
    MeasurementSettings.backgroundPadding = new Cartesian2(7, 5);

    /**
     * @private
     */
    MeasurementSettings.getPolylineOptions = function(options) {
        options = defaultValue(options, defaultValue.EMPTY_OBJECT);
        return {
            show : options.show,
            ellipsoid : options.ellipsoid,
            width : defaultValue(options.width, 3),
            color : defaultValue(options.color, MeasurementSettings.color),
            depthFailColor : defaultValue(defaultValue(options.depthFailColor, options.color), MeasurementSettings.color),
            id : options.id,
            positions : options.positions,
            materialType : options.materialType,
            depthFailMaterialType : options.depthFailMaterialType,
            loop : options.loop,
            clampToGround : options.clampToGround,
            classificationType : options.classificationType,
            allowPicking : defaultValue(options.allowPicking, false)
        };
    };

    /**
     * @private
     */
    MeasurementSettings.getPolygonOptions = function(options) {
        options = defaultValue(options, defaultValue.EMPTY_OBJECT);
        return {
            show : options.show,
            ellipsoid : options.ellipsoid,
            color : defaultValue(options.color, MeasurementSettings.color),
            depthFailColor : defaultValue(defaultValue(options.depthFailColor, options.color), MeasurementSettings.color),
            id : options.id,
            positions : options.positions,
            clampToGround : options.clampToGround,
            classificationType : options.classificationType,
            allowPicking : defaultValue(options.allowPicking, false)
        };
    };

    /**
     * @private
     */
    MeasurementSettings.getPointOptions = function() {
        return {
            pixelSize : 10,
            color : MeasurementSettings.color,
            position : new Cartesian3(),
            disableDepthTestDistance : Number.POSITIVE_INFINITY, // for draw-over
            show : false
        };
    };

    /**
     * @private
     */
    MeasurementSettings.getLabelOptions = function(options) {
        options = defaultValue(options, defaultValue.EMPTY_OBJECT);
        return {
            show : false,
            font : MeasurementSettings.labelFont,
            scale : defaultValue(options.scale, 1.0),
            fillColor : defaultValue(options.fillColor, MeasurementSettings.textColor),
            showBackground : true,
            backgroundColor : defaultValue(options.backgroundColor, MeasurementSettings.backgroundColor),
            backgroundPadding : defaultValue(options.backgroundPadding, MeasurementSettings.backgroundPadding),
            horizontalOrigin : defaultValue(options.horizontalOrigin, HorizontalOrigin.CENTER),
            verticalOrigin : defaultValue(options.verticalOrigin, VerticalOrigin.BOTTOM),
            pixelOffset : defined(options.pixelOffset) ? options.pixelOffset : Cartesian2.clone(defaultLabelPixelOffset),
            disableDepthTestDistance : Number.POSITIVE_INFINITY, // for draw-over
            position : new Cartesian3()
        };
    };
export default MeasurementSettings;
