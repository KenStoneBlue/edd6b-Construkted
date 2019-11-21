import {defaultValue} from 'cesium'
import {defineProperties} from 'cesium'
import {destroyObject} from 'cesium'
import {Check} from 'cesium'
import {knockout} from 'cesium'
import TransformEditorViewModel from './TransformEditorViewModel.js';
import createDomNode from '../createDomNode'
import getElement from '../getElement'

    var html = '<div class="transform-editor-menu" data-bind="style: {left: left, top: top}, visible: active">\
        <div class="cesium-button transform-editor-button" data-bind="click: expandMenu, visible: !menuExpanded">\
            <svg width="20" height="20" viewBox="0 0 20 20">\
                <g>\
                    <circle cx="2" cy="10" r="2" />\
                    <circle cx="10" cy="10" r="2" />\
                    <circle cx="18" cy="10" r="2" />\
                </g>\
            </svg>\
        </div>\
        <div class="transform-editor-options" data-bind="visible: menuExpanded">\
            <div class="transform-editor-button-row">\
                <div title="Translation" data-bind="click: setModeTranslation, css: {selected: editorMode === \'translation\'}">\
                    <svg viewBox="0 0 25 25" height="25" width="25">\
                        <g>\
                            <circle r="3" cy="22" cx="3" />\
                            <path d="M 19.543379,4.59439 3.9750205,19.96158 5.3793174,21.3854 20.947676,6.01822 Z"/>\
                            <path d="m 14.699824,3.80366 10.231411,-3.34922 -3.215586,10.03096 z"/>\
                        </g>\
                    </svg>\
                </div\
                ><div title="Rotation" data-bind="click: setModeRotation, css: {selected: editorMode === \'rotation\'}">\
                    <svg viewBox="0 0 25 25" height="25" width="25">\
                        <g>\
                            <path d="M 13.033371,10.08295 2.6713568,7.16272 10.931013,0.62527 Z"/>\
                            <path d="m 13.741358,3.87055 c -0.747592,-0.006 -1.506137,0.0593 -2.263621,0.20287 l 0.484334,2.29127 c 4.712769,-0.89305 9.471467,2.11386 10.414021,6.57912 0.942553,4.46525 -2.229345,8.97402 -6.942115,9.86707 -4.71277,0.89305 -9.4731664,-2.11226 -10.4157205,-6.57752 l -2.4165696,0.45729 c 1.2119755,5.74161 7.2550484,9.55981 13.3149241,8.41149 6.059877,-1.14833 10.089725,-6.87562 8.87775,-12.61723 -1.060479,-5.02391 -5.819851,-8.57436 -11.053003,-8.61436 z"/>\
                        </g>\
                    </svg>\
               </div>\
            </div>\
            <div class="transform-editor-button-row">\
                <div title="Scale" data-bind="click: setModeScale, css: {selected: editorMode === \'scale\'}">\
                    <svg width="25" height="25" viewBox="0 0 25 25">\
                        <g>\
                            <path d="M 19.543379,4.59439 3.9750205,19.96158 5.3793174,21.3854 20.947676,6.01822 Z"/>\
                            <path d="m 14.699824,3.80366 10.231411,-3.34922 -3.215586,10.03096 z" />\
                            <path d="M 10.333866,21.9809 0.10245523,25.33012 3.3180412,15.29916 Z" />\
                        </g>\
                    </svg>\
                </div\
                ><div data-bind="click: toggleNonUniformScaling">\
                    <div title="Switch to non-uniform scaling" data-bind="visible: !enableNonUniformScaling">\
                        <svg width="25" height="25" viewBox="0 0 25 25">\
                            <g>\
                                <path d="m 0.5,1.38477 h 1.9960938 v -1 H 0.5 c 0,0.33333 0,0.66667 0,1 z m 2.9941406,0 h 1.9980469 v -1 H 3.4941406 Z m 2.9960938,0 h 1.9960937 v -1 H 6.4902344 Z m 2.9960937,0 h 1.9960939 v -1 H 9.4863281 Z m 2.9941409,0 h 1.998047 v -1 h -1.998047 z m 2.996093,0 h 1.996094 v -1 h -1.996094 z m 2.994141,0 h 1.998047 v -1 h -1.998047 z m 2.996094,0 h 1.998047 v -1 h -1.998047 z m 2.535156,-0.5 v 1.95898 H 25 v -1.95898 z M 0,4.0332 h 0.99804688 v -1.99609 H 0 Z m 24.001953,1.80469 H 25 V 3.8418 H 24.001953 Z M 0,7.0293 h 0.99804688 v -1.99805 H 0 Z m 24.001953,1.80468 H 25 v -1.99609 H 24.001953 Z M 0,10.02344 h 0.99804688 v -1.9961 H 0 Z m 24.001953,1.80664 H 25 v -1.99805 H 24.001953 Z M 0,13.01953 h 0.99804688 v -1.99609 H 0 Z m 24.001953,1.80469 H 25 v -1.9961 H 24.001953 Z M 0,16.01562 h 0.99804688 v -1.99804 H 0 Z m 24.001953,1.80469 H 25 v -1.99804 H 24.001953 Z M 0,19.00977 h 0.99804688 v -1.9961 H 0 Z m 24.001953,1.80664 H 25 v -1.99805 H 24.001953 Z M 0,22.00586 h 0.99804688 v -1.99609 H 0 Z m 24.001953,1.80469 H 25 v -1.9961 H 24.001953 Z M 0,24.88672 v 0.49805 h 0.5 0.11523438 v -0.49805 h 0.3828125 v -1.88281 H 0 Z m 1.6132812,0.49805 H 3.609375 v -0.99805 H 1.6132812 Z m 2.9941407,0 h 1.9980469 v -0.99805 H 4.6074219 Z m 2.9960937,0 h 1.9980469 v -0.99805 H 7.6035156 Z m 2.9960934,0 h 1.996094 v -0.99805 h -1.996094 z m 2.994141,0 h 1.998047 v -0.99805 H 13.59375 Z m 2.996094,0 h 1.996094 v -0.99805 h -1.996094 z m 2.996094,0 h 1.996093 v -0.99805 h -1.996093 z m 2.99414,0 H 24.5 25 v -0.49805 -0.0781 h -0.5 v -0.42187 h -1.919922 z" />\
                                <path d="m 0,10.38477 v 1.02343 13.97657 h 15 v -15 z m 2.0449219,2.04492 H 12.955078 V 23.3418 H 2.0449219 Z"/>\
                                <g>\
                                    <path d="m 21.158203,3.81836 0.355469,0.35156 0.351562,-0.35547 -0.353515,-0.35156 z m -0.703125,0.70898 0.355469,0.35157 0.351562,-0.35352 -0.355468,-0.35351 z m -0.705078,0.71094 0.355469,0.35156 0.351562,-0.35546 -0.353515,-0.35157 z m -0.703125,0.70899 0.355469,0.35351 0.351562,-0.35547 -0.355468,-0.35156 z m -0.705078,0.71093 0.355469,0.35157 0.353515,-0.35547 -0.355469,-0.35157 z m -0.703125,0.71094 0.355469,0.35156 0.351562,-0.35547 -0.355469,-0.35156 z m -0.703125,0.70898 0.353515,0.35157 0.353516,-0.35352 -0.355469,-0.35351 z m -0.705078,0.71094 0.355469,0.35156 0.351562,-0.35546 -0.355469,-0.35157 z m -0.703125,0.70899 0.353515,0.35351 0.353516,-0.35547 -0.355469,-0.35351 z m -0.705078,0.71093 0.355468,0.35157 0.351563,-0.35547 -0.355469,-0.35156 z"/>\
                                    <path d="m 23.382049,1.93037 -1.015775,3.8652 -2.840556,-2.81624 z"/>\
                                </g>\
                            </g>\
                        </svg>\
                    </div>\
                    <div title="Switch to uniform scaling" data-bind="visible: enableNonUniformScaling">\
                        <svg width="25" height="25" viewBox="0 0 25 25">\
                            <g>\
                                <path d="M 0.49414062,10.87891 H 0 v 1.95117 h 0.98828125 v -1.45703 H 2.4707031 v -0.98828 H 0.49414062 Z m 2.96289058,0.49414 h 1.9765626 v -0.98828 H 3.4570312 Z m 2.9648438,0 h 1.9765625 v -0.98828 H 6.421875 Z m 2.9628906,0 h 1.9765624 v -0.98828 H 9.3847656 Z m 2.9648434,0 h 1.976563 v -0.98828 h -1.976563 z m 2.964844,0 h 1.974609 v -0.98828 h -1.974609 z m 2.962891,0 h 1.976562 v -0.98828 h -1.976562 z m 2.964844,0 h 1.974609 v -0.98828 h -1.974609 z m 2.96289,-0.49414 h -0.193359 v 1.67578 H 25 v -1.67578 -0.49414 h -0.494141 -0.300781 z m -0.193359,4.63867 H 25 v -1.97461 H 24.011719 Z M 0,15.79297 h 0.98828125 v -1.97461 H 0 Z m 24.011719,2.68945 H 25 v -1.97656 H 24.011719 Z M 0,18.75781 h 0.98828125 v -1.97656 H 0 Z m 24.011719,2.6875 H 25 V 19.4707 H 24.011719 Z M 0,21.7207 h 0.98828125 v -1.97461 H 0 Z m 24.011719,2.68946 H 25 v -1.97657 H 24.011719 Z M 0,24.68555 h 0.98828125 v -1.97657 H 0 Z m 1.2753906,0.69922 h 1.9765625 v -0.98829 H 1.2753906 Z m 2.9648438,0 h 1.9765625 v -0.98829 H 4.2402344 Z m 2.9628906,0 h 1.9765625 v -0.98829 H 7.203125 Z m 2.964844,0 h 1.976562 v -0.98829 h -1.976562 z m 2.96289,0 h 1.976563 v -0.98829 h -1.976563 z m 2.964844,0 h 1.976563 v -0.98829 h -1.976563 z m 2.962891,0 h 1.976562 v -0.98829 h -1.976562 z m 2.964844,0 H 24 v -0.98829 h -1.976562 z"/>\
                                <path d="m 0,10.38477 v 1.02343 13.97657 h 15 v -15 z m 2.0449219,2.04492 H 12.955078 V 23.3418 H 2.0449219 Z"/>\
                                <g>\
                                    <path d="m 22.251953,18.26172 h 0.179688 l -0.0039,-0.5 h -0.179687 z m -1.003906,-0.49024 0.0039,0.5 0.5,-0.004 -0.0039,-0.5 z m -1,0.008 0.0039,0.5 0.5,-0.004 -0.0039,-0.5 z m -1,0.01 0.0039,0.5 0.5,-0.006 -0.0039,-0.5 z m -1,0.008 0.0039,0.5 0.5,-0.004 -0.0039,-0.5 z m -1,0.008 0.0039,0.5 0.5,-0.004 -0.0039,-0.5 z m -1,0.01 0.0039,0.5 0.5,-0.004 -0.0039,-0.5 z m -1,0.008 0.0039,0.5 0.5,-0.004 -0.0039,-0.5 z"/>\
                                    <path d="m 23.885095,18.00809 -2.030696,1.17348 -0.02037,-2.31243 z"/>\
                                </g>\
                            </g>\
                        </svg>\
                    </div>\
                </div>\
            </div>\
        </div>\
    </div>';

    /**
     * A tool for editing the transform of an object
     * @alias TransformEditor
     * @ionsdk
     * @constructor
     *
     * @param {Object} options An object with the following properties
     * @param {Element} options.container
     * @param {Scene} options.scene The scene
     * @param {Matrix4} options.transform The initial transform of the primitive that needs positioning
     * @param {BoundingSphere} options.boundingSphere The bounding sphere of the primitive that needs positioning
     */
    function TransformEditor(options) {
        options = defaultValue(options, defaultValue.EMPTY_OBJECT);

        //>>includeStart('debug', pragmas.debug);
        Check.defined('options.container', options.container);
        Check.defined('options.scene', options.scene);
        Check.defined('options.transform', options.transform);
        Check.defined('options.boundingSphere', options.boundingSphere);
        //>>includeEnd('debug');

        var container = getElement(options.container);

        var element = createDomNode(html);
        container.appendChild(element);

        var viewModel = new TransformEditorViewModel(options);

        knockout.applyBindings(viewModel, element);

        this._viewModel = viewModel;
        this._element = element;
        this._container =  container;
    }

    defineProperties(TransformEditor.prototype, {
        /**
         * Gets the parent container.
         * @memberof TransformEditor.prototype
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
         * @memberof TransformEditor.prototype
         * @type {TransformEditorViewModel}
         * @readonly
         */
        viewModel : {
            get : function() {
                return this._viewModel;
            }
        }
    });

    /**
     * @returns {Boolean} true if the object has been destroyed, false otherwise.
     */
    TransformEditor.prototype.isDestroyed = function() {
        return false;
    };

    /**
     * Destroys the widget.  Should be called if permanently
     * removing the widget from layout.
     */
    TransformEditor.prototype.destroy = function() {
        knockout.cleanNode(this._element);
        this._container.removeChild(this._element);
        this._viewModel.destroy();

        return destroyObject(this);
    };
export default TransformEditor;
