import {ManagedArray} from 'cesium';
import {Cesium3DTileset} from 'cesium';
import {Model} from 'cesium';
import {PrimitiveCollection} from 'cesium';

    function VisibilityState() {
        this.states = new ManagedArray();
        this.count = 0;
    }

    VisibilityState.prototype.hidePrimitiveCollection = function(primitiveCollection) {
        var primitivesLength = primitiveCollection.length;
        for (var i = 0; i < primitivesLength; ++i) {
            var primitive = primitiveCollection.get(i);
            if (primitive instanceof PrimitiveCollection) {
                this.hidePrimitiveCollection(primitive);
                continue;
            }

            this.states.push(primitive.show);

            if ((primitive instanceof Cesium3DTileset) || (primitive instanceof Model)) {
                continue;
            }
            primitive.show = false;
        }
    };

    VisibilityState.prototype.restorePrimitiveCollection = function(primitiveCollection) {
        var primitivesLength = primitiveCollection.length;
        for (var i = 0; i < primitivesLength; ++i) {
            var primitive = primitiveCollection.get(i);
            if (primitive instanceof PrimitiveCollection) {
                this.restorePrimitiveCollection(primitive);
                continue;
            }

            primitive.show = this.states.get(this.count++);
        }
    };

    VisibilityState.prototype.hide = function(scene) {
        this.states.length = 0;

        this.hidePrimitiveCollection(scene.primitives);
        this.hidePrimitiveCollection(scene.groundPrimitives);
    };

    VisibilityState.prototype.restore = function(scene) {
        this.count = 0;

        this.restorePrimitiveCollection(scene.primitives);
        this.restorePrimitiveCollection(scene.groundPrimitives);
    };
export default VisibilityState;
