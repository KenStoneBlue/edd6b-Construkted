jQuery(document).ready(function(){
  var viewer = new Cesium.Viewer('cesiumContainer');  
  
  var tileset = null;
  
  if( EDD_CJS_PUBLIC_AJAX.download_asset_url.length ){
  	Cesium.Ion.defaultAccessToken = EDD_CJS_PUBLIC_AJAX.cesium_token;

  	var cesiumTilesetURL = EDD_CJS_PUBLIC_AJAX.download_asset_url;
  	
  	tileset = viewer.scene.primitives.add(
  		new Cesium.Cesium3DTileset({
        url: cesiumTilesetURL,
  			modelMatrix: Cesium.Transforms.eastNorthUpToFixedFrame(Cesium.Cartesian3.fromDegrees(0, 0)) //required since the models may not be geographically referenced.
  		})
  	);

  	viewer.zoomTo(tileset)
  		.otherwise(function (error) {
  			console.log(error);
  		});

  } else if( EDD_CJS_PUBLIC_AJAX.download_asset_id.length ){
      Cesium.Ion.defaultAccessToken = EDD_CJS_PUBLIC_AJAX.cesium_token;
    
      tileset = viewer.scene.primitives.add(
  		new Cesium.Cesium3DTileset({
        url: Cesium.IonResource.fromAssetId(EDD_CJS_PUBLIC_AJAX.download_asset_id),
  			modelMatrix: Cesium.Transforms.eastNorthUpToFixedFrame(Cesium.Cartesian3.fromDegrees(0, 0)) //required since the models may not be geographically referenced.
  		})
  	);

      viewer.zoomTo(tileset)
          .otherwise(function (error) {
              console.log(error);
          });
  }

});
