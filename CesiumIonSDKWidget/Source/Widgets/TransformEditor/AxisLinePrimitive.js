import {defaultValue} from 'cesium'
import {defined} from 'cesium'
import {defineProperties} from 'cesium'
import {destroyObject} from 'cesium'
import {ArcType} from 'cesium'
import {BoundingSphere} from 'cesium'
import {Check} from 'cesium'
import {ColorGeometryInstanceAttribute} from 'cesium'
import {GeometryInstance} from 'cesium'
import {Math as CesiumMath} from 'cesium'
import {Matrix4} from 'cesium'
import {PolylineGeometry} from 'cesium'
import {Material} from 'cesium'
import {PolylineColorAppearance} from 'cesium'
import {PolylineMaterialAppearance} from 'cesium'
import {Primitive} from 'cesium'

    /**
     * @private
     * @ionsdk
     *
     * @param {Cartesian3[]} options.positions The positions of the polyline
     * @param {Color} options.color The color of the line
     * @param {Boolean} [options.show=true] Whether the primitive is visible
     * @param {Object} [options.id] An id for the primitive
     * @param {Boolean} [options.loop=false] True if the polyline should loop
     * @param {Boolean} [options.arrow=false] True if the arrow material should be used
     * @param {Boolean} [options.width] The width of the polyline
     * @param {Boolean} [options.depthFail=true] True if a depthfail material should be used
     */
    function AxisLinePrimitive(options) {
        //>>includeStart('debug', pragmas.debug);
        Check.defined('options', options);
        Check.defined('options.positions', options.positions);
        Check.defined('options.color', options.color);
        //>>includeEnd('debug');

        this.show = defaultValue(options.show, true);
        this.id = options.id;

        var positions = options.positions;
        if (options.loop) {
            positions = positions.slice();
            positions.push(positions[0]);
        }
        var isArrow = defaultValue(options.arrow, false);
        this._width = defined(options.width) ? options.width : (isArrow ? 25 : 8);
        this._color = options.color;
        this._depthFailColor = options.color.withAlpha(0.3);
        this._positions = positions;
        this._arrow = isArrow;
        this._depthFail = defaultValue(options.depthFail, true);

        this._primitive = undefined;
        this._boundingSphere = BoundingSphere.fromPoints(positions);
        this._transformedBoundingSphere = BoundingSphere.clone(this._boundingSphere);
        this._modelMatrix = Matrix4.clone(Matrix4.IDENTITY);

        this._update = true;
    }

    defineProperties(AxisLinePrimitive.prototype, {
        modelMatrix : {
            get : function() {
                return this._modelMatrix;
            },
            set : function(value) {
                if (Matrix4.equalsEpsilon(value, this._modelMatrix, CesiumMath.EPSILON10)) {
                    return;
                }
                this._modelMatrix = Matrix4.clone(value, this._modelMatrix);
                this._update = true;
            }
        },
        positions : {
            get : function() {
                return this._positions;
            },
            set : function(positions) {
                this._positions = positions;
                this._update = true;
            }
        },
        color : {
            get : function() {
                return this._color;
            }
        },
        width : {
            get : function() {
                return this._width;
            }
        },
        boundingVolume : {
            get : function() {
                return this._transformedBoundingSphere;
            }
        }
    });

    AxisLinePrimitive.prototype.update = function(frameState) {
        if (!this.show) {
            return;
        }

        if (this._update) {
            this._update = false;
            this._primitive = this._primitive && this._primitive.destroy();

            var geometry = new PolylineGeometry({
                positions : this._positions,
                width : this._width,
                vertexFormat : PolylineMaterialAppearance.VERTEX_FORMAT,
                arcType: ArcType.NONE
            });

            var appearance1;
            var appearance2;
            if (this._arrow) {
                appearance1 = new PolylineMaterialAppearance({
                    material : Material.fromType(Material.PolylineArrowType, {
                        color : this._color
                    })
                });
                if (this._depthFail) {
                    appearance2 = new PolylineMaterialAppearance({
                        material : Material.fromType(Material.PolylineArrowType, {
                            color : this._depthFailColor
                        })
                    });
                }
            } else {
                appearance1 = new PolylineColorAppearance({
                    translucent: this._color.alpha !== 1.0
                });
                if (this._depthFail) {
                    appearance2 = new PolylineColorAppearance({
                        translucent: this._depthFailColor.alpha !== 1.0
                    });
                }
            }

            var modelMatrix = this._modelMatrix;
            this._primitive = new Primitive({
                geometryInstances : new GeometryInstance({
                    geometry : geometry,
                    attributes : {
                        color : ColorGeometryInstanceAttribute.fromColor(this._color),
                        depthFailColor : ColorGeometryInstanceAttribute.fromColor(this._depthFailColor)
                    },
                    id : this.id,
                    modelMatrix : modelMatrix
                }),
                appearance : appearance1,
                depthFailAppearance : appearance2,
                asynchronous : false
            });
            this._transformedBoundingSphere = BoundingSphere.transform(this._boundingSphere, modelMatrix, this._transformedBoundingSphere);
        }

        this._primitive.update(frameState);
    };

    AxisLinePrimitive.prototype.isDestroyed = function() {
        return false;
    };

    AxisLinePrimitive.prototype.destroy = function() {
        this._primitive = this._primitive && this._primitive.destroy();
        return destroyObject(this);
    };
export default AxisLinePrimitive;
