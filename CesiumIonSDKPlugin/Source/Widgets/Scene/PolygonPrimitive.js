import {createGuid} from 'cesium'
import {defaultValue} from 'cesium'
import {defineProperties} from 'cesium'
import {destroyObject} from 'cesium'
import {BoundingSphere} from 'cesium'
import {Color} from 'cesium'
import {ColorGeometryInstanceAttribute} from 'cesium'
import {CoplanarPolygonGeometry} from 'cesium'
import {GeometryInstance} from 'cesium'
import {PerInstanceColorAppearance} from 'cesium';
import {Primitive} from 'cesium';

    /**
     * @private
     * @ionsdk
     */
    function PolygonPrimitive(options) {
        options = defaultValue(options, defaultValue.EMPTY_OBJECT);

        this.show = defaultValue(options.show, true);
        var color = Color.clone(defaultValue(options.color, Color.WHITE));
        this._id = createGuid();
        this._color = color;
        this._depthFailColor = color;
        this._positions = [];

        this._boundingSphere = new BoundingSphere();
        this._primitive = undefined;
        this._update = true;
    }

    defineProperties(PolygonPrimitive.prototype, {
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
        boundingVolume : {
            get : function() {
                return this._boundingSphere;
            }
        }
    });

    PolygonPrimitive.prototype.update = function(frameState) {
        if (!this.show) {
            return;
        }

        var positions = this._positions;
        if (positions.length < 3) {
            this._primitive = this._primitive && this._primitive.destroy();
            return;
        }

        if (this._update) {
            this._update = false;

            this._primitive = this._primitive && this._primitive.destroy();
            var geometry = CoplanarPolygonGeometry.fromPositions({
                positions : positions,
                vertexFormat : PerInstanceColorAppearance.FLAT_VERTEX_FORMAT
            });
            this._primitive = new Primitive({
                geometryInstances : new GeometryInstance({
                    geometry : geometry,
                    attributes : {
                        color : ColorGeometryInstanceAttribute.fromColor(this._color),
                        depthFailColor : ColorGeometryInstanceAttribute.fromColor(this._depthFailColor)
                    },
                    id : this._id
                }),
                appearance : new PerInstanceColorAppearance({
                    flat : true,
                    closed : false,
                    translucent : this._color.alpha < 1.0
                }),
                depthFailAppearance : new PerInstanceColorAppearance({
                    flat : true,
                    closed : false,
                    translucent : this._depthFailColor.alpha < 1.0
                }),
                allowPicking : false,
                asynchronous : false
            });
            this._boundingSphere = BoundingSphere.fromPoints(positions, this._boundingSphere);
        }

        this._primitive.update(frameState);
    };

    PolygonPrimitive.prototype.isDestroyed = function() {
        return false;
    };

    PolygonPrimitive.prototype.destroy = function() {
        this._primitive = this._primitive && this._primitive.destroy();
        return destroyObject(this);
    };
export default PolygonPrimitive;
