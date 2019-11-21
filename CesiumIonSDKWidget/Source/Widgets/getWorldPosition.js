import {defined} from 'cesium';
import {Cartesian3} from 'cesium';
import {Check} from 'cesium';
import {Ray} from 'cesium';
import {Cesium3DTileset} from 'cesium';
import {Cesium3DTileFeature} from 'cesium';
import {Model} from 'cesium';
import VisibilityState from './VisibilityState.js';

    var cartesianScratch = new Cartesian3();
    var rayScratch = new Ray();
    var visibilityState = new VisibilityState();

    /**
     * Computes the world position on either the terrain or tileset from a mouse position.
     *
     * @param {Scene} scene The scene
     * @ionsdk
     * @param {Cartesian2} mousePosition The mouse position
     * @param {Cartesian3} result The result position
     * @returns {Cartesian3} The position in world space
     */
    function getWorldPosition(scene, mousePosition, result) {
        //>>includeStart('debug', pragmas.debug);
        Check.defined('scene', scene);
        Check.defined('mousePosition', mousePosition);
        Check.defined('result', result);
        //>>includeEnd('debug');
        var position;
        if (scene.pickPositionSupported) {
            // Hide every primitive that isn't a tileset
            visibilityState.hide(scene);

            // Don't pick default 3x3, or scene.pick may allow a mousePosition that isn't on the tileset to pickPosition.
            var pickedObject = scene.pick(mousePosition, 1, 1);

            visibilityState.restore(scene);

            if (defined(pickedObject) && (pickedObject instanceof Cesium3DTileFeature || pickedObject.primitive instanceof Cesium3DTileset || pickedObject.primitive instanceof Model)) { // check to let us know if we should pick against the globe instead
                position = scene.pickPosition(mousePosition, cartesianScratch);

                if (defined(position)) {
                    return Cartesian3.clone(position, result);
                }
            }
        }

        if (!defined(scene.globe)) {
            return;
        }

        var ray = scene.camera.getPickRay(mousePosition, rayScratch);
        position = scene.globe.pick(ray, scene, cartesianScratch);

        if (defined(position)) {
            return Cartesian3.clone(position, result);
        }
    }

export default getWorldPosition;

