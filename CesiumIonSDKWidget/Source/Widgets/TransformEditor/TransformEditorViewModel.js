import {Cartesian2} from 'cesium'
import {Cartesian3} from 'cesium'
import {Check} from 'cesium'
import {defaultValue} from 'cesium'
import {defined} from 'cesium'
import {defineProperties} from 'cesium'
import {destroyObject} from 'cesium'
import {HeadingPitchRoll} from 'cesium'
import {Math as CesiumMath} from 'cesium'
import {Matrix3} from 'cesium'
import {Matrix4} from 'cesium'
import {Quaternion} from 'cesium'
import {ScreenSpaceEventHandler} from 'cesium'
import {ScreenSpaceEventType} from 'cesium'
import {Transforms} from 'cesium'
import {SceneTransforms} from 'cesium'
import {knockout} from 'cesium'
import getWidgetOrigin from './getWidgetOrigin.js';
import RotationEditor from './RotationEditor.js';
import ScaleEditor from './ScaleEditor.js';
import TranslationEditor from './TranslationEditor.js';

    var widgetPosition = new Cartesian3();
    var screenPosition = new Cartesian2();

    var noScale = new Cartesian3(1.0, 1.0, 1.0);
    var transformScratch = new Matrix4();
    var vectorScratch = new Cartesian3();
    var scaleScratch = new Cartesian3();

    var EditorMode = {
        TRANSLATION : 'translation',
        ROTATION : 'rotation',
        SCALE : 'scale'
    };

    var setHprQuaternion = new Quaternion();
    var setHprQuaternion2 = new Quaternion();
    var setHprTranslation = new Cartesian3();
    var setHprScale = new Cartesian3();
    var setHprCenter = new Cartesian3();
    var setHprTransform = new Matrix4();
    var setHprRotation = new Matrix3();

    function setHeadingPitchRoll(transform, headingPitchRoll) {
        //>>includeStart('debug', pragmas.debug);
        Check.defined('transform', transform);
        Check.defined('headingPitchRoll', headingPitchRoll);
        //>>includeEnd('debug');

        var rotationQuaternion = Quaternion.fromHeadingPitchRoll(headingPitchRoll, setHprQuaternion);
        var translation = Matrix4.getTranslation(transform, setHprTranslation);
        var scale = Matrix4.getScale(transform, setHprScale);
        var center = Matrix4.multiplyByPoint(transform, Cartesian3.ZERO, setHprCenter);
        var backTransform = Transforms.eastNorthUpToFixedFrame(center, undefined, setHprTransform);

        var rotationFixed = Matrix4.getMatrix3(backTransform, setHprRotation);
        var quaternionFixed = Quaternion.fromRotationMatrix(rotationFixed, setHprQuaternion2);
        var rotation = Quaternion.multiply(quaternionFixed, rotationQuaternion, rotationFixed);

        return Matrix4.fromTranslationQuaternionRotationScale(translation, rotation, scale, transform);
    }

    /**
     * Creates an interactive transform editor
     * @alias TransformEditorViewModel
     * @ionsdk
     * @constructor
     *
     * @param {Object} options An object with the following properties
     * @param {Scene} options.scene The scene
     * @param {Matrix4} options.transform The transform of the primitive that needs positioning
     * @param {BoundingSphere} options.boundingSphere The bounding sphere of the primitive that needs positioning
     * @param {Cartesian3} [options.originOffset] A offset vector (in local coordinates) from the origin as defined by the transform translation.
     */
    function TransformEditorViewModel(options) {
        options = defaultValue(options, defaultValue.EMPTY_OBJECT);

        //>>includeStart('debug', pragmas.debug);
        Check.defined('options.scene', options.scene);
        Check.defined('options.transform', options.transform);
        Check.defined('options.boundingSphere', options.boundingSphere);
        //>>includeEnd('debug');

        var scene = options.scene;
        var transform = options.transform;
        var boundingSphere = options.boundingSphere.clone();

        var originOffset = defaultValue(options.originOffset, Cartesian3.ZERO);

        var position = Matrix4.getTranslation(transform, new Cartesian3());
        var headingPitchRoll = Transforms.fixedFrameToHeadingPitchRoll(transform, scene.mapProjection.ellipsoid, undefined, new HeadingPitchRoll());
        var scale = Matrix4.getScale(transform, new Cartesian3());

        if (Cartesian3.equalsEpsilon(position, Cartesian3.ZERO, CesiumMath.EPSILON10)){
            position = Cartesian3.fromDegrees(0, 0, 0, scene.mapProjection.ellipsoid, position);
            transform = Matrix4.setTranslation(transform, position, transform);
            setHeadingPitchRoll(transform, headingPitchRoll);
        }

        var nonUniformScaling = true;
        if (CesiumMath.equalsEpsilon(scale.x, scale.y, CesiumMath.EPSILON10) && CesiumMath.equalsEpsilon(scale.x, scale.z, CesiumMath.EPSILON10)) {
            nonUniformScaling = false;
            scale.y = scale.x;
            scale.z = scale.x;
        }

        var initialRadius = boundingSphere.radius / Cartesian3.maximumComponent(scale);

        /**
         * Gets and sets the selected interactive mode.
         * @type {EditorMode}
         */
        this.editorMode = undefined;
        var editorMode = knockout.observable();
        knockout.defineProperty(this, 'editorMode', {
            get : function() {
                return editorMode();
            },
            set : function(value) {
                editorMode(value);
                if (defined(this._activeEditor)) {
                    this._activeEditor.active = false;
                }
                var activeEditor;
                if (value === EditorMode.ROTATION) {
                    activeEditor = this._rotationEditor;
                } else if (value === EditorMode.TRANSLATION) {
                    activeEditor = this._translationEditor;
                } else if (value === EditorMode.SCALE) {
                    activeEditor = this._scaleEditor;
                }
                activeEditor.update();
                activeEditor.active = true;
                this._activeEditor = activeEditor;
            }
        });

        /**
         * Gets and sets whether non-uniform scaling is enabled
         * @type {Boolean}
         */
        this.enableNonUniformScaling = nonUniformScaling;
        var enableNonUniformScaling = knockout.observable(this.enableNonUniformScaling);
        knockout.defineProperty(this, 'enableNonUniformScaling', {
            get : function() {
                return enableNonUniformScaling();
            },
            set : function(value) {
                if (value === enableNonUniformScaling()) {
                    return;
                }
                enableNonUniformScaling(value);
                if (!value) {
                    this.scale = new Cartesian3(scale.x, scale.x, scale.x);
                    if (scene.requestRenderMode) {
                        scene.requestRender();
                    }
                }
            }
        });

        /**
         * Gets and sets the position
         * @type {Cartesian3}
         */
        this.position = position;
        var positionObservable = knockout.observable(this.position);
        knockout.defineProperty(this, 'position', {
            get : function() {
                return positionObservable();
            },
            set : function(value) {
                if (Cartesian3.equals(value, this.position)) {
                    return;
                }
                var position = Cartesian3.clone(value, this.position);
                positionObservable(position);
                var transform = this._transform;
                transform = Matrix4.setTranslation(transform, position, transform);
                setHeadingPitchRoll(transform, this.headingPitchRoll);
                if (scene.requestRenderMode) {
                    scene.requestRender();
                }
            }
        });

        /**
         * Gets and sets the heading pitch roll
         * @type {HeadingPitchRoll}
         */
        this.headingPitchRoll = headingPitchRoll;
        var headingPitchRollObservable = knockout.observable(this.headingPitchRoll);
        knockout.defineProperty(this, 'headingPitchRoll', {
            get : function() {
                return headingPitchRollObservable();
            },
            set : function(value) {
                if (HeadingPitchRoll.equals(value, this.headingPitchRoll)) {
                    return;
                }
                var hpr = HeadingPitchRoll.clone(value, this.headingPitchRoll);
                headingPitchRollObservable(hpr);
                setHeadingPitchRoll(this._transform, hpr);
                if (scene.requestRenderMode) {
                    scene.requestRender();
                }
            }
        });

        /**
         * Gets and sets the scale
         * @type {Cartesian3}
         */
        this.scale = scale;
        var scaleObservable = knockout.observable(this.scale);
        knockout.defineProperty(this, 'scale', {
            get : function() {
                return scaleObservable();
            },
            set : function(value) {
                if (Cartesian3.equals(value, this.scale)) {
                    return;
                }
                var scale = Cartesian3.clone(value, this.scale);
                scaleObservable(scale);
                Matrix4.setScale(this._transform, scale, this._transform);
                this._translationEditor.update(); //applies the scale to the editing primitives
                this._rotationEditor.update();
                if (scene.requestRenderMode) {
                    scene.requestRender();
                }
            }
        });

        /**
         * Gets and sets whether the menu is expanded
         * @type {Boolean}
         */
        this.menuExpanded = false;

        /**
         * Gets the x screen coordinate of the widget menu
         * @type {String}
         * @readonly
         */
        this.left = '0';

        /**
         * Gets the y screen coordinate of the widget menu
         * @type {String}
         * @readonly
         */
        this.top = '0';

        /**
         * Gets whether the widget is active.  Use the activate and deactivate functions to set this value.
         * @type {Boolean}
         * @readonly
         */
        this.active = false;

        knockout.track(this, ['menuExpanded', 'left', 'top', 'active']);

        var that = this;
        this._rotationEditor = new RotationEditor({
            scene : scene,
            transform : transform,
            radius : initialRadius,
            originOffset : originOffset,
            setPosition : function(value) {
                that.position = value;
            },
            setHeadingPitchRoll : function(value) {
                that.headingPitchRoll = value;
            }
        });
        this._translationEditor = new TranslationEditor({
            scene : scene,
            transform : transform,
            radius : initialRadius,
            originOffset : originOffset,
            setPosition : function(value) {
                that.position = value;
            }
        });
        this._scaleEditor = new ScaleEditor({
            scene : scene,
            transform : transform,
            enableNonUniformScaling : enableNonUniformScaling,
            radius : initialRadius,
            originOffset : originOffset,
            setScale : function(value) {
                that.scale = value;
            },
            setPosition : function(value) {
                that.position = value;
            }
        });

        this._sseh = new ScreenSpaceEventHandler(scene.canvas);
        this._scene = scene;
        this._transform = transform;
        this._boundingSphere = boundingSphere;
        this._active = false;
        this._activeEditor = undefined;
        this._originOffset = originOffset;

        this.position = position;
        this.headingPitchRoll = headingPitchRoll;
        this.scale = scale;

        this._removePostUpdateEvent = this._scene.preUpdate.addEventListener(TransformEditorViewModel.prototype._update, this);
    }

    defineProperties(TransformEditorViewModel.prototype, {
        /**
         * Gets and sets the offset of the transform editor UI components from the origin as defined by the transform
         * @type {Cartesian3}
         * @memberof TransformEditorViewModel
         */
        originOffset : {
            get : function() {
                return this._originOffset;
            },
            set : function(value) {
                //>>includeStart('debug', pragmas.debug);
                Check.defined('value', value);
                //>>includeEnd('debug');
                this._originOffset = value;

                this._translationEditor.originOffset = value;
                this._rotationEditor.originOffset = value;
                this._scaleEditor.originOffset = value;
            }
        }
    });

    /**
     * Sets the originOffset based on the Cartesian3 position in world coordinates
     * @param {Cartesian3} position
     */
    TransformEditorViewModel.prototype.setOriginPosition = function(position) {
        //>>includeStart('debug', pragmas.debug);
        Check.defined('position', position);
        //>>includeEnd('debug');
        var transform = Matrix4.setScale(this._transform, noScale, transformScratch);
        var worldToLocalCoordinates = Matrix4.inverseTransformation(transform, transform);
        var point = Matrix4.multiplyByPoint(worldToLocalCoordinates, position, vectorScratch);
        var offset = Cartesian3.divideComponents(point, Matrix4.getScale(this._transform, scaleScratch), point);

        this.originOffset = offset;
    };

    /**
     * Activates the widget by showing the primitives and enabling mouse handlers
     */
    TransformEditorViewModel.prototype.activate = function() {
        var sseh = this._sseh;
        var scene = this._scene;

        sseh.setInputAction(this._leftDown.bind(this), ScreenSpaceEventType.LEFT_DOWN);
        sseh.setInputAction(this._leftUp.bind(this), ScreenSpaceEventType.LEFT_UP);
        sseh.setInputAction(this._mouseMove.bind(this), ScreenSpaceEventType.MOUSE_MOVE);
        this.active = true;
        if (defined(this._activeEditor)) {
            this._activeEditor.active = true;
        } else {
            this.setModeTranslation();
        }
        if (scene.requestRenderMode) {
            scene.requestRender();
        }
    };

    /**
     * Deactivates the widget by disabling mouse handlers and hiding the primitives
     */
    TransformEditorViewModel.prototype.deactivate = function() {
        var sseh = this._sseh;
        var scene = this._scene;

        sseh.removeInputAction(this._leftDown.bind(this), ScreenSpaceEventType.LEFT_DOWN);
        sseh.removeInputAction(this._leftUp.bind(this), ScreenSpaceEventType.LEFT_UP);
        sseh.removeInputAction(this._mouseMove.bind(this), ScreenSpaceEventType.MOUSE_MOVE);
        this.active = false;
        if (defined(this._activeEditor)) {
            this._activeEditor.active = false;
        }
        if (scene.requestRenderMode) {
            scene.requestRender();
        }
    };

    /**
     * Expands the widget menu
     */
    TransformEditorViewModel.prototype.expandMenu = function() {
        this.menuExpanded = true;
    };

    /**
     * Activates the translation interactive mode
     */
    TransformEditorViewModel.prototype.setModeTranslation = function() {
        this.editorMode = EditorMode.TRANSLATION;
        this.menuExpanded = false;
    };

    /**
     * Activates the rotation interactive mode
     */
    TransformEditorViewModel.prototype.setModeRotation = function() {
        this.editorMode = EditorMode.ROTATION;
        this.menuExpanded = false;
    };

    /**
     * Activates the scale interactive mode
     */
    TransformEditorViewModel.prototype.setModeScale = function() {
        this.editorMode = EditorMode.SCALE;
        this.menuExpanded = false;
    };

    /**
     * Toggles whether non-uniform scaling is enabled
     */
    TransformEditorViewModel.prototype.toggleNonUniformScaling = function() {
        this.enableNonUniformScaling = !this.enableNonUniformScaling;
    };

    /**
     * @private
     */
    TransformEditorViewModel.prototype._leftDown = function(click) {
        this._activeEditor.handleLeftDown(click.position);
        var scene = this._scene;
        if (scene.requestRenderMode) {
            scene.requestRender();
        }
    };

    /**
     * @private
     */
    TransformEditorViewModel.prototype._mouseMove = function(movement) {
        this._activeEditor.handleMouseMove(movement.endPosition);
        var scene = this._scene;
        if (scene.requestRenderMode) {
            scene.requestRender();
        }

    };

    /**
     * @private
     */
    TransformEditorViewModel.prototype._leftUp = function(click) {
        this.menuExpanded = false;
        this._activeEditor.handleLeftUp(click.position);
        var scene = this._scene;
        if (scene.requestRenderMode) {
            scene.requestRender();
        }

    };

    /**
     * Updates the active editor
     * @private
     */
    TransformEditorViewModel.prototype._update = function() {
        if (!this.active) {
            return;
        }
        this._activeEditor.update();
        var scene = this._scene;
        var position = getWidgetOrigin(this._transform, this._originOffset, widgetPosition);
        var newPos = SceneTransforms.wgs84ToWindowCoordinates(scene, position, screenPosition);
        if (defined(newPos)) {
            this.left = Math.floor(newPos.x - 13) + 'px';
            this.top = Math.floor(newPos.y) + 'px';
        }
    };

    /**
     * @returns {Boolean} true if the object has been destroyed, false otherwise.
     */
    TransformEditorViewModel.prototype.isDestroyed = function() {
        return false;
    };

    /**
     * Destroys the view model.
     */
    TransformEditorViewModel.prototype.destroy = function() {
        this.deactivate();
        this._sseh.destroy();
        this._rotationEditor.destroy();
        this._translationEditor.destroy();
        this._scaleEditor.destroy();
        this._removePostUpdateEvent();
        destroyObject(this);
    };

    TransformEditorViewModel.EditorMode = EditorMode;
export default TransformEditorViewModel;
