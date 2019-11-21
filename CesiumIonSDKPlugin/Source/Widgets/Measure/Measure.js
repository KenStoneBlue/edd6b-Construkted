import {defaultValue} from 'cesium'
import {defineProperties} from 'cesium'
import {destroyObject} from 'cesium'
import {Check} from 'cesium'
import getElement from '../../Widgets/getElement.js';
import {knockout} from 'cesium';
import MeasureViewModel from './MeasureViewModel.js';
import createDomNode from '../createDomNode.js';

    var html = '<div class="cesium-measure-toolbar" data-bind="css: {expanded: expanded}">\n\
                   <div class="cesium-measure-button cesium-measure-button-main" data-bind="click: toggleActive, attr: {title: expanded ? \'Collapse\' : \'Expand\'}">\n\
                       <svg width="25px" height="25px" viewBox="0 0 30 30">\
                          <path d="M 14.851122,11.545456 25.578177,0.95157924 29.306163,4.6249483 18.537701,15.246448 M 15.097088,18.640104 4.1531358,29.434698 0.62547531,25.653101 11.515909,14.853004"/>\
                          <path d="M 22.983411,26.662767 0.8350882,3.9632787 4.2110211,0.77972226 26.222602,23.217308 Z"/>\
                          <path d="m 23.126668,26.856584 5.906658,2.311965 -2.630951,-5.79394"/>\
                          <path d="M 3.8120758,6.6472825 7.2277612,3.4338416"/>\
                          <path d="M 5.2416124,27.76234 3.6377555,26.08552"/>\
                          <path d="M 7.0148521,26.015847 5.4109952,24.339027"/>\
                          <path d="M 8.9787697,24.078675 7.3749129,22.401855"/>\
                          <path d="M 10.974467,22.173284 9.3706099,20.496464"/>\
                          <path d="m 12.990856,20.120081 -1.603857,-1.67682"/>\
                          <path d="m 19.676091,13.638423 -1.603857,-1.67682"/>\
                          <path d="M 21.449331,11.89193 19.845474,10.21511"/>\
                          <path d="M 23.413248,9.9547586 21.809392,8.2779376"/>\
                          <path d="M 25.448671,7.9858073 23.805089,6.3725466"/>\
                          <path d="M 27.425335,5.9961636 25.765864,4.3670131"/>\
                    </svg>\
               </div>\n\
                   <!-- ko foreach: measurements -->\n\
                   <div class="cesium-measure-button" data-bind="click: function($data) { $parent.selectedMeasurement = $data; }, attr: {title: type}, css: {active: $data === $parent.selectedMeasurement}, html: thumbnail"></div>\n\
                   <!-- /ko -->\n\
                   <div class="cesium-measure-button cesium-measure-help" title="Settings and Help" data-bind="click: toggleInstructions, css: {active: instructionsVisible}">\n\
                       <svg width="20px" height="20px" viewBox="0 0 30 30">\
                            <g transform="translate(0,-267)">\
                            <g>\
                            <path d="M 16.891904,289.31984 H 11.7387 q -0.02021,-1.11147 -0.02021,-1.35398 0,-2.50587 0.828554,-4.12256 0.828555,-1.61669 3.314218,-3.63756 2.485663,-2.02086 2.970671,-2.64733 0.747719,-0.99022 0.747719,-2.18253 0,-1.65711 -1.33377,-2.82921 -1.313562,-1.19231 -3.556721,-1.19231 -2.162325,0 -3.617348,1.23273 -1.4550219,1.23272 -2.0006553,3.7588 l -5.2138301,-0.64667 q 0.2222951,-3.61735 3.0717138,-6.14343 2.8696274,-2.52608 7.5176156,-2.52608 4.890492,0 7.780328,2.5665 2.889836,2.54629 2.889836,5.94134 0,1.8794 -1.071058,3.55672 -1.05085,1.67732 -4.526737,4.56715 -1.798569,1.49544 -2.243159,2.40483 -0.424381,0.90939 -0.383964,3.25359 z m -5.153204,7.63887 v -5.67863 h 5.678629 v 5.67863 z" />\
                            </g>\
                            </g>\
                        </svg>\
                   </div>\n\
               </div>\n\
               <div class="cesium-measure-instructions" data-bind="visible: instructionsVisible">\n\
                   <!-- ko foreach: measurements -->\n\
                   <div><div class="cesium-measure-icon" data-bind="html: icon" style="display: inline"></div><span data-bind="text: type"></span></div>\n\
                   <ul data-bind="foreach: instructions">\n\
                       <li data-bind="text: $data"></li>\n\
                   </ul>\n\
                   <hr>\n\
                   <!-- /ko -->\n\
               </div>';

    /**
     * <span style="display: block; text-align: center;">
     * <img src="Images/Measure.png" width="348" height="44" alt="" />
     * <br />Measure toolbar expanded.
     * </span>
     * <br /><br />
     * Measure is a widget that allows users to make ephemeral measurements by clicking on the globe surface and on Cesium3DTiles and glTF models.
     *
     * <p>
     * Measurement types include:
     * <ul>
     * <li>
     * Area: Computes the area of an arbitrary polygon.  Note that the polygon area does not take into account the contours of terrain.
     * </li><li>
     * Distance: Computes a linear distance between two points.  Note that measurements on the earth do not conform to terrain.
     * </li><li>
     * Component Distance: Computes a linear distance between two points, with horizontal and vertical components and the angle of the line.  Note that measurements on the earth do not conform to terrain.
     * </li><li>
     * Height: Computes a linear distance between a point in space and the terrain below that point.  This value will always be 0 if activated in 2D mode.
     * </li><li>
     * Horizontal: Computes a linear distance between two points at the same height relative to the the WGS84 Ellipsoid.
     * </li><li>
     * Point: Displays the longitude and latitude coordinates and the height above terrain at a specified point in space.
     * </li><li>
     * Vertical: Computes a linear distance between two points with the same longitude/latitude but different heights.  This value will always be 0 if activated in 2D mode.
     * </li>
     * </ul>
     * </p>
     *
     * Note that drawing measurements on 3D tiles and models may not be supported by all browsers.  Check the tilesetMeasurementSupported to see
     * if it is supported.
     *
     * @ionsdk
     *
     * @see AreaMeasurement
     * @see DistanceMeasurement
     * @see HeightMeasurement
     * @see HorizontalMeasurement
     * @see PointMeasurement
     * @see VerticalMeasurement
     *
     * @alias Measure
     * @constructor
     *
     * @param {Object} options An object with the following properties
     * @param {String|Element} options.container The container for the widget
     * @param {Scene} options.scene The scene
     * @param {MeasureUnits} [options.units] The default unit of measurement
     * @param {String} [options.locale] The {@link https://tools.ietf.org/html/rfc5646|BCP 47 language tag} string customizing language-sensitive number formatting. If <code>undefined</code>, the runtime's default locale is used. See the {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl#Locale_identification_and_negotiation|Intl page on MDN}
     * @param {PrimitiveCollection} [options.primitives] A collection in which to store the measurement primitives
     *
     * @demo <a href="/Apps/Sandcastle/index.html?src=Measure%20Widget.html">Cesium Sandcastle Measure Widget Demo</a>
     *
     * @example
     * // In HTML head, include a link to the Measure.css stylesheet,
     * // and in the body, include: <div id="measureContainer"></div>
     * // Note: This code assumes you already have a Scene instance.
     *
     * var measureWidget = new Cesium.Measure({
     *      container : 'measureContainer',
     *      scene : scene,
     *      units : new Cesium.MeasureUnits({
     *          distanceUnits : Cesium.DistanceUnits.METERS,
     *          areaUnits : Cesium.AreaUnits.SQUARE_METERS,
     *          volumeUnits : Cesium.VolumeUnits.CUBIC_FEET,
     *          angleUnits : Cesium.AngleUnits.DEGREES,
     *          slopeUnits : Cesium.AngleUnits.GRADE
     *      })
     * });
     */
    function Measure(options) {
        options = defaultValue(options, defaultValue.EMPTY_OBJECT);
        var container = options.container;

        //>>includeStart('debug', pragmas.debug);
        Check.defined('options.container', container);
        Check.defined('options.scene', options.scene);
        //>>includeEnd('debug');

        var element = createDomNode(html);

        container = getElement(container);
        element = container.appendChild(element);

        var viewModel = new MeasureViewModel(options);

        knockout.applyBindings(viewModel, container);

        this._viewModel = viewModel;
        this._container = container;
        this._element = element;
        this._dropdown = element.getElementsByClassName('cesium-measure-instructions')[0];
    }

    defineProperties(Measure.prototype, {
        /**
         * Gets the parent container.
         * @memberof Measure.prototype
         *
         * @type {Element}
         * @readonly
         */
        container : {
            get : function() {
                return this._container;
            }
        },

        /**
         * Gets the view model.
         * @memberof Measure.prototype
         *
         * @type {MeasureViewModel}
         * @readonly
         */
        viewModel : {
            get : function() {
                return this._viewModel;
            }
        },

        /**
         * Gets whether drawing a measurement on a Cesium3DTileset or Model is supported
         * @memberof Measure.prototype
         *
         * @type {Boolean}
         * @readonly
         */
        tilesetMeasurementSupported : {
            get : function() {
                return this._scene.pickPositionSupported;
            }
        }
    });

    /**
     * @returns {Boolean} true if the object has been destroyed, false otherwise.
     */
    Measure.prototype.isDestroyed = function() {
        return false;
    };

    /**
     * Destroys the widget.  Should be called if permanently
     * removing the widget from layout.
     */
    Measure.prototype.destroy = function() {
        this._viewModel.destroy();
        knockout.cleanNode(this._container);
        this._container.removeChild(this._element);

        return destroyObject(this);
    };
export default Measure;
