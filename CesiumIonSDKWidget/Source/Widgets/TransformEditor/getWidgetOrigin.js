import {Cartesian3} from 'cesium'
import {Check} from 'cesium'
import {Matrix4} from 'cesium'

    var noScale = new Cartesian3(1.0, 1.0, 1.0);
    var matrixScratch = new Matrix4();
    var scaleScratch = new Cartesian3();

    /**
     * Computes the transform editor widget origin from the transform and the origin offset
     * @param {Matrix4} transform The transform
     * @ionsdk
     * @param {Cartesian3} originOffset The offset from the transform origin
     * @param {Cartesian3} result
     * @return {Cartesian3}
     *
     * @private
     */
    function getWidgetOrigin(transform, originOffset, result) {
        //>>includeStart('debug', pragmas.debug);
        Check.defined('transform', transform);
        Check.defined('originOffset', originOffset);
        Check.defined('result', result);
        //>>includeEnd('debug');

        var startScale = Matrix4.getScale(transform, scaleScratch);
        var modelMatrix = Matrix4.setScale(transform, noScale, matrixScratch);

        return Matrix4.multiplyByPoint(modelMatrix, Cartesian3.multiplyComponents(originOffset, startScale, result), result);
    }
export default getWidgetOrigin;
