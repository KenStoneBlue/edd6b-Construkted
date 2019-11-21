import {Check} from 'cesium';

    /**
     * Creates a DOM Node from a String containing HTML
     *
     * @param {String} html The html string
     * @ionsdk
     *
     * @private
     */
    function createDomNode(html) {
        //>>includeStart('debug', pragmas.debug);
        Check.typeOf.string('html', html);
        //>>includeEnd('debug');

        var div = document.createElement('div');
        div.innerHTML = html;

        if (div.children.length === 1) {
            return div.removeChild(div.firstChild);
        }

        return div;
    }
export default createDomNode;
