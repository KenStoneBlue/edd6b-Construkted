import {freezeObject} from 'cesium';

    /**
     * @private
     * @ionsdk
     */
    var DrawingMode = {
        BeforeDraw : 0,
        Drawing : 1,
        AfterDraw : 2
    };
export default freezeObject(DrawingMode);
