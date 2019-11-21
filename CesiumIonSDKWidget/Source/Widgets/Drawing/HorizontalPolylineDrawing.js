import {Cartesian2} from 'cesium';
import {Cartesian3} from 'cesium';
import {Cartographic} from 'cesium';
import {Check} from 'cesium';
import {defaultValue} from 'cesium';
import {defined} from 'cesium';
import {IntersectionTests} from 'cesium';
import {Plane} from 'cesium';
import {Ray} from 'cesium';
import PolylinePrimitive from '../Scene/PolylinePrimitive';
import {SceneMode} from 'cesium';
import DrawingMode from './DrawingMode.js';
import PolylineDrawing from './PolylineDrawing.js';

    var clickDistanceScratch = new Cartesian2();
    var cart3Scratch = new Cartesian3();
    var cart3Scratch1 = new Cartesian3();
    var normalScratch = new Cartesian3();
    var rayScratch = new Ray();
    var v1Scratch = new Cartesian3();
    var v2Scratch = new Cartesian3();
    var cartoScratch = new Cartographic();

    var mouseDelta = 10;

    /**
     * @private
     * @ionsdk
     */
    function HorizontalPolylineDrawing(options) {
        options = defaultValue(options, defaultValue.EMPTY_OBJECT);
        //>>includeStart('debug', pragmas.debug);
        Check.defined('options.scene', options.scene);
        //>>includeEnd('debug');
        PolylineDrawing.call(this, options);
        var polylineOptions = defaultValue(options.polylineOptions, defaultValue.EMPTY_OBJECT);

        var dashLineOptions = {
            color: polylineOptions.color,
            ellipsoid: polylineOptions.ellipsoid,
            width: 2,
            dashed: true
        };
        var moveDashLine = this._primitives.add(new PolylinePrimitive(dashLineOptions));
        moveDashLine.positions = [new Cartesian3(), new Cartesian3()];
        moveDashLine.show = false;
        this._dashLineOptions = dashLineOptions;
        this._dashedLines = [];
        this._moveDashLine = moveDashLine;

        this._heightPlane = new Plane(Cartesian3.UNIT_X, 0);
        this._heightPlaneCV = new Plane(Cartesian3.UNIT_X, 0);
        this._firstMove = false;
        this._height = 0;
    }

    HorizontalPolylineDrawing.prototype = Object.create(PolylineDrawing.prototype);
    HorizontalPolylineDrawing.prototype.constructor = HorizontalPolylineDrawing;

    HorizontalPolylineDrawing.prototype._setDashLinePositions = function(line, position) {
        var globe = this._scene.globe;
        var ellipsoid = this._scene.frameState.mapProjection.ellipsoid;

        var positions = line.positions;
        positions[0] = Cartesian3.clone(position, positions[0]);

        var carto = ellipsoid.cartesianToCartographic(position, cartoScratch);
        if (defined(globe)) {
            carto.height = defaultValue(globe.getHeight(carto), 0);
        } else {
            carto.height = 0;
        }
        positions[1] = ellipsoid.cartographicToCartesian(carto, positions[1]);
        line.positions = positions;
    };

    /**
     * Adds a point to the polyline.
     * @param {Cartesian3} position The position to add
     * @private
     */
    HorizontalPolylineDrawing.prototype.addPoint = function(position) {
        PolylineDrawing.prototype.addPoint.call(this, position);

        var dashLine = this._primitives.add(new PolylinePrimitive(this._dashLineOptions));
        dashLine.positions = [new Cartesian3(), new Cartesian3()];
        this._dashedLines.push(dashLine);

        this._setDashLinePositions(dashLine, position);
    };

    /**
     * Ends drawing on double click.
     */
    HorizontalPolylineDrawing.prototype.handleDoubleClick = function() {
        // expect point to be added by handleClick
        this._mode = DrawingMode.AfterDraw;

        // Sometimes a move event is fired between the ending
        // click and doubleClick events, so make sure the polyline
        // has the correct positions.
        this._polyline.positions = this._positions;
        this._moveDashLine.show = false;
    };

    /**
     * Handles click events while drawing a polyline.
     * @param {Cartesian2} clickPosition The click position
     */
    HorizontalPolylineDrawing.prototype.handleClick = function(clickPosition) {
        //>>includeStart('debug', pragmas.debug);
        Check.defined('clickPosition', clickPosition);
        //>>includeEnd('debug');

        var pos;
        if (this._positions.length === 0) {
            var scene = this._scene;
            var ellipsoid = scene.frameState.mapProjection.ellipsoid;
            pos = PolylineDrawing.prototype.handleClick.call(this, clickPosition);
            if (!defined(pos)) {
                return;
            }
            this._heightPlane = Plane.fromPointNormal(pos, ellipsoid.geodeticSurfaceNormal(pos, normalScratch), this._heightPlane);

            var cartoPos = ellipsoid.cartesianToCartographic(pos, cartoScratch);
            var planePoint = scene.mapProjection.project(cartoPos, cart3Scratch1);
            var posCV = Cartesian3.fromElements(planePoint.z, planePoint.x, planePoint.y, planePoint);

            this._heightPlaneCV = Plane.fromPointNormal(posCV, Cartesian3.UNIT_X, this._heightPlaneCV);
            this._height = ellipsoid.cartesianToCartographic(pos, cartoScratch).height;
            this._firstMove = true;
        } else {
            // Don't handle if clickPos is too close to previous click.
            // This typically indicates a double click handler will be fired next,
            // we don't expect the user to wait and click this point again.
            var lastClickPos = this._lastClickPosition;
            var distance = Cartesian2.magnitude(Cartesian2.subtract(lastClickPos, clickPosition, clickDistanceScratch));
            if (distance < mouseDelta) {
                return;
            }
            Cartesian2.clone(clickPosition, lastClickPos);
            pos = Cartesian3.clone(this._tempNextPos);
            this.addPoint(pos);
            this._firstMove = true;
        }
        return pos;
    };

    /**
     * Handles mouse move events while drawing a polyline.
     * @param {Cartesian2} mousePosition The mouse position
     * @param {Boolean} shift True if the shift key was pressed
     */
    HorizontalPolylineDrawing.prototype.handleMouseMove = function(mousePosition, shift) {
        //>>includeStart('debug', pragmas.debug);
        Check.defined('mousePosition', mousePosition);
        Check.defined('shift', shift);
        //>>includeEnd('debug');

        if (this._mode !== DrawingMode.Drawing) {
            return;
        }
        var scene = this._scene;
        var ellipsoid = scene.frameState.mapProjection.ellipsoid;
        var positions = this._positions;

        var nextPos;
        var ray = scene.camera.getPickRay(mousePosition, rayScratch);
        if (scene.mode === SceneMode.SCENE3D) {
            nextPos = IntersectionTests.rayPlane(ray, this._heightPlane, cart3Scratch);
        } else if (scene.mode === SceneMode.COLUMBUS_VIEW) {
            nextPos = IntersectionTests.rayPlane(ray, this._heightPlaneCV, cart3Scratch);
            nextPos = Cartesian3.fromElements(nextPos.y, nextPos.z, nextPos.x, nextPos);
            var carto = scene.mapProjection.unproject(nextPos, cartoScratch);
            nextPos = ellipsoid.cartographicToCartesian(carto, nextPos);
        } else {
            nextPos = scene.camera.pickEllipsoid(mousePosition, ellipsoid, cart3Scratch);
            if (defined(nextPos)) {
                var cartoPos = ellipsoid.cartesianToCartographic(nextPos, cartoScratch);
                cartoPos.height = this._height;
                nextPos = ellipsoid.cartographicToCartesian(cartoPos, nextPos);
            }
        }

        if (!defined(nextPos)) {
            return;
        }

        if (!this._firstMove && shift) {
            var anchorPos = positions[positions.length - 1];
            var lastPos = this._tempNextPos;
            var direction = Cartesian3.subtract(lastPos, anchorPos, v1Scratch);
            var newDirection = Cartesian3.subtract(nextPos, anchorPos, v2Scratch);
            newDirection = Cartesian3.projectVector(newDirection, direction, newDirection);
            nextPos = Cartesian3.add(anchorPos, newDirection, nextPos);
        }

        positions = positions.slice();
        positions.push(Cartesian3.clone(nextPos, this._tempNextPos));
        this._polyline.positions = positions;
        this._firstMove = false;
        this._moveDashLine.show = true;
        this._setDashLinePositions(this._moveDashLine, nextPos);

        return nextPos;
    };

    /**
     * @returns {Boolean} true if the object has been destroyed, false otherwise.
     */
    HorizontalPolylineDrawing.prototype.isDestroyed = function() {
        return false;
    };

    /**
     * Destroys the widget.
     */
    HorizontalPolylineDrawing.prototype.destroy = function() {
        var primitives = this._primitives;
        var dashLines = this._dashedLines;
        for (var i = 0; i < dashLines.length; i++) {
            primitives.remove(dashLines[i]);
        }
        primitives.remove(this._moveDashLine);

        PolylineDrawing.prototype.destroy.call(this);
    };
export default HorizontalPolylineDrawing;
