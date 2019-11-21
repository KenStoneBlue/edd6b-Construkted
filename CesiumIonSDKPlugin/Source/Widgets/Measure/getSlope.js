import {Check} from 'cesium'
import {defined} from 'cesium'
import {Cartesian2} from 'cesium'
import {Cartesian3} from 'cesium'
import {Math as CesiumMath} from 'cesium'
import getWorldPosition from '../getWorldPosition.js';

    var positionScratch = new Cartesian3();
    var normalScratch = new Cartesian3();
    var surfaceNormalScratch = new Cartesian3();

    var scratchCartesian2s = [new Cartesian2(), new Cartesian2(), new Cartesian2(), new Cartesian2()];
    var scratchCartesian3s = [new Cartesian3(), new Cartesian3(), new Cartesian3(), new Cartesian3(), new Cartesian3()];

    /**
     * Computes the slope at a point defined by window coordinates.
     *
     * @param {Scene} scene The scene
     * @ionsdk
     * @param {Cartesian2} windowCoordinates The window coordinates
     * @returns {Number} The slope at the point relative to the ground between [0, PI/2].
     */
    function getSlope(scene, windowCoordinates) {
        Check.defined('scene', scene);
        Check.defined('windowCoordinates', windowCoordinates);

        var worldPosition = getSlope._getWorldPosition(scene, windowCoordinates, positionScratch);
        if (!defined(worldPosition)) {
            return;
        }

        var distanceCameraToPositionThreshold = 10000.0;
        var pixelOffset = 2;
        var offsetDistanceRatioThreshold = 0.05;

        var cameraPosition = scene.camera.position;
        var distanceCameraToPosition = Cartesian3.distance(worldPosition, cameraPosition);

        if (distanceCameraToPosition > distanceCameraToPositionThreshold) { // don't compute slope if camera is more than 10km away from point
            return;
        }

        var sc0 = scratchCartesian3s[0];
        var sc1 = scratchCartesian3s[1];
        var sc2 = scratchCartesian3s[2];
        var sc3 = scratchCartesian3s[3];

        var normal = scene.frameState.mapProjection.ellipsoid.geodeticSurfaceNormal(worldPosition, normalScratch);
        normal = Cartesian3.negate(normal, normal);

        var sampledWindowCoordinate0 = Cartesian2.clone(windowCoordinates, scratchCartesian2s[0]);
        sampledWindowCoordinate0.x -= pixelOffset;
        sampledWindowCoordinate0.y -= pixelOffset;

        var sampledWindowCoordinate1 = Cartesian2.clone(windowCoordinates, scratchCartesian2s[1]);
        sampledWindowCoordinate1.x -= pixelOffset;
        sampledWindowCoordinate1.y += pixelOffset;

        var sampledWindowCoordinate2 = Cartesian2.clone(windowCoordinates, scratchCartesian2s[2]);
        sampledWindowCoordinate2.x += pixelOffset;
        sampledWindowCoordinate2.y += pixelOffset;

        var sampledWindowCoordinate3 = Cartesian2.clone(windowCoordinates, scratchCartesian2s[3]);
        sampledWindowCoordinate3.x += pixelOffset;
        sampledWindowCoordinate3.y -= pixelOffset;

        var sPosition0 = getSlope._getWorldPosition(scene, sampledWindowCoordinate0, sc0);
        var sPosition1 = getSlope._getWorldPosition(scene, sampledWindowCoordinate1, sc1);
        var sPosition2 = getSlope._getWorldPosition(scene, sampledWindowCoordinate2, sc2);
        var sPosition3 = getSlope._getWorldPosition(scene, sampledWindowCoordinate3, sc3);

        var v0, v1, v2, v3;
        if (defined(sPosition0)) {
            var line0 = Cartesian3.subtract(sPosition0, worldPosition, sc0);
            var d0 = Cartesian3.magnitude(line0);
            v0 = (d0 / distanceCameraToPosition <= offsetDistanceRatioThreshold) ? Cartesian3.normalize(line0, sc0) : undefined;
        }

        if (defined(sPosition1)) {
            var line1 = Cartesian3.subtract(sPosition1, worldPosition, sc1);
            var d1 = Cartesian3.magnitude(line1);
            v1 = (d1 / distanceCameraToPosition <= offsetDistanceRatioThreshold) ? Cartesian3.normalize(line1, sc1) : undefined;
        }

        if (defined(sPosition2)) {
            var line2 = Cartesian3.subtract(sPosition2, worldPosition, sc2);
            var d2 = Cartesian3.magnitude(line2);
            v2 = (d2 / distanceCameraToPosition <= offsetDistanceRatioThreshold) ? Cartesian3.normalize(line2, sc2) : undefined;
        }

        if (defined(sPosition3)) {
            var line3 = Cartesian3.subtract(sPosition3, worldPosition, sc3);
            var d3 = Cartesian3.magnitude(line3);
            v3 = (d3 / distanceCameraToPosition <= offsetDistanceRatioThreshold) ? Cartesian3.normalize(line3, sc3) : undefined;
        }

        var surfaceNormal = Cartesian3.clone(Cartesian3.ZERO, surfaceNormalScratch);
        var scratchNormal = scratchCartesian3s[4];

        if (defined(v0) && defined(v1)) {
            scratchNormal = Cartesian3.normalize(Cartesian3.cross(v0, v1, scratchNormal), scratchNormal);
            surfaceNormal = Cartesian3.add(surfaceNormal, scratchNormal, surfaceNormal);
        }
        if (defined(v1) && defined(v2)) {
            scratchNormal = Cartesian3.normalize(Cartesian3.cross(v1, v2, scratchNormal), scratchNormal);
            surfaceNormal = Cartesian3.add(surfaceNormal, scratchNormal, surfaceNormal);
        }
        if (defined(v2) && defined(v3)) {
            scratchNormal = Cartesian3.normalize(Cartesian3.cross(v2, v3, scratchNormal), scratchNormal);
            surfaceNormal = Cartesian3.add(surfaceNormal, scratchNormal, surfaceNormal);
        }
        if (defined(v3) && defined(v0)) {
            scratchNormal = Cartesian3.normalize(Cartesian3.cross(v3, v0, scratchNormal), scratchNormal);
            surfaceNormal = Cartesian3.add(surfaceNormal, scratchNormal, surfaceNormal);
        }

        if (surfaceNormal.equals(Cartesian3.ZERO)) {
            return;
        }

        surfaceNormal = Cartesian3.normalize(surfaceNormal, surfaceNormal);

        return CesiumMath.asinClamped(Math.abs(Math.sin(Cartesian3.angleBetween(surfaceNormal, normal)))); // Always between 0 and PI/2.
    }

    // exposed for specs
    getSlope._getWorldPosition = getWorldPosition;
export default getSlope;
