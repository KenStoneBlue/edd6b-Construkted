import {defineProperties} from 'cesium'
import {destroyObject} from 'cesium'
import {Check} from 'cesium'
import {KeyboardEventModifier} from 'cesium'
import {ScreenSpaceEventHandler} from 'cesium'
import {ScreenSpaceEventType} from 'cesium'

    /**
     * A helper class for activating and handling mouse interactions for the measurement widget.
     * @alias MeasurementMouseHandler
     * @ionsdk
     *
     * @param {Scene} scene The scene
     *
     * @constructor
     */
    function MeasurementMouseHandler(scene) {
        //>>includeStart('debug', pragmas.debug);
        Check.defined('scene', scene);
        //>>includeEnd('debug');

        this.selectedMeasurement = undefined;
        this._sseh = new ScreenSpaceEventHandler(scene.canvas);
        this._scene = scene;
    }

    defineProperties(MeasurementMouseHandler.prototype, {
        /**
         * Gets the scene.
         * @type {Scene}
         * @memberof MeasurementMouseHandler.prototype
         * @readonly
         */
        scene : {
            get : function() {
                return this._scene;
            }
        }
    });

    /**
     * Activates the mouse handler.
     */
    MeasurementMouseHandler.prototype.activate = function() {
        var sseh = this._sseh;
        sseh.setInputAction(this._click.bind(this), ScreenSpaceEventType.LEFT_CLICK);
        sseh.setInputAction(this._clickShift.bind(this), ScreenSpaceEventType.LEFT_CLICK, KeyboardEventModifier.SHIFT);
        sseh.setInputAction(this._mouseMove.bind(this), ScreenSpaceEventType.MOUSE_MOVE);
        sseh.setInputAction(this._mouseMoveShift.bind(this), ScreenSpaceEventType.MOUSE_MOVE, KeyboardEventModifier.SHIFT);
        sseh.setInputAction(this._handleLeftDown.bind(this), ScreenSpaceEventType.LEFT_DOWN);
        sseh.setInputAction(this._handleLeftUp.bind(this), ScreenSpaceEventType.LEFT_UP);
        sseh.setInputAction(this._handleDoubleClick.bind(this), ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    };

    /**
     * Deactivates the mouse handler.
     */
    MeasurementMouseHandler.prototype.deactivate = function() {
        var sseh = this._sseh;
        sseh.removeInputAction(ScreenSpaceEventType.LEFT_CLICK);
        sseh.removeInputAction(ScreenSpaceEventType.LEFT_CLICK, KeyboardEventModifier.SHIFT);
        sseh.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE);
        sseh.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE, KeyboardEventModifier.SHIFT);
        sseh.removeInputAction(ScreenSpaceEventType.LEFT_DOWN);
        sseh.removeInputAction(ScreenSpaceEventType.LEFT_UP);
        sseh.removeInputAction(ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    };

    /**
     * @private
     */
    MeasurementMouseHandler.prototype._handleDoubleClick = function(click) {
        this.selectedMeasurement.handleDoubleClick(click.position);
        var scene = this._scene;
        if (scene.requestRenderMode) {
            scene.requestRender();
        }
    };

    /**
     * @private
     */
    MeasurementMouseHandler.prototype._handleClick = function(click, shift) {
        this.selectedMeasurement.handleClick(click.position, shift);
        var scene = this._scene;
        if (scene.requestRenderMode) {
            scene.requestRender();
        }
    };

    /**
     * @private
     */
    MeasurementMouseHandler.prototype._clickShift = function(click) {
        this._handleClick(click, true);
    };

    /**
     * @private
     */
    MeasurementMouseHandler.prototype._click = function(click) {
        this._handleClick(click, false);
    };

    /**
     * @private
     */
    MeasurementMouseHandler.prototype._handleMouseMove = function(movement, shift) {
        this.selectedMeasurement.handleMouseMove(movement.endPosition, shift);
        var scene = this._scene;
        if (scene.requestRenderMode) {
            scene.requestRender();
        }
    };

    /**
     * @private
     */
    MeasurementMouseHandler.prototype._mouseMove = function(movement) {
        this._handleMouseMove(movement, false);
    };

    /**
     * @private
     */
    MeasurementMouseHandler.prototype._mouseMoveShift = function(movement) {
        this._handleMouseMove(movement, true);
    };

    /**
     * @private
     */
    MeasurementMouseHandler.prototype._handleLeftDown = function(event) {
        this.selectedMeasurement.handleLeftDown(event.position);
        var scene = this._scene;
        if (scene.requestRenderMode) {
            scene.requestRender();
        }
    };

    /**
     * @private
     */
    MeasurementMouseHandler.prototype._handleLeftUp = function(event) {
        this.selectedMeasurement.handleLeftUp(event.position);
        var scene = this._scene;
        if (scene.requestRenderMode) {
            scene.requestRender();
        }
    };

    /**
     * @returns {Boolean} true if the object has been destroyed, false otherwise.
     */
    MeasurementMouseHandler.prototype.isDestroyed = function() {
        return false;
    };

    /**
     * Destroys the mouse handler.
     */
    MeasurementMouseHandler.prototype.destroy = function() {
        this.deactivate();
        this._sseh.destroy();
        return destroyObject(this);
    };
export default MeasurementMouseHandler;
