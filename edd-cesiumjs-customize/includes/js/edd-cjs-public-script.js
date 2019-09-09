var viewer = null;
var cameraController = null;

var theApp = (function () {
    var tilesets = null;
    var tilesetLocationEditor = null;

    // why?
    // please see wp_content/themes/olam/css/color.css.php
    // it define tbody, th, td,, tfoot 's background color

    function applyCesiumCssStyle() {
        var cesiumNavigationHelp = $('.cesium-click-navigation-help.cesium-navigation-help-instructions');
        cesiumNavigationHelp.find("td").css({"background-color": "rgba(38, 38, 38, 0.75)"});

		var cesiumTouchNavigationHelp = $('.cesium-touch-navigation-help.cesium-navigation-help-instructions');
        cesiumTouchNavigationHelp.find("td").css({"background-color": "rgba(38, 38, 38, 0.75)"});
    }

    function _initGeoLocationWidget() {
        $('#geo_location_edit_div').hide();

        $('#edit_asset_geo_location_button').click(function () {
            $('#geo_location_label_div').hide();
            $('#geo_location_edit_div').show();

            if(cameraController)
                cameraController.setEnabledFPV(false);
			if(tilesetLocationEditor)
            	tilesetLocationEditor.setVisible(true);
        });

        $('#exit_edit_asset_geo_location_button').click(function () {
            $('#tileset_latitude_label').html($('#tileset_latitude').val());
            $('#tileset_longitude_label').html($('#tileset_longitude').val());

            var altitude = $('#tileset_altitude').val();
            altitude = parseFloat(altitude);

            $('#tileset_altitude_label').html(altitude.toFixed(3) );

            $('#geo_location_label_div').show();
            $('#geo_location_edit_div').hide();

            if(cameraController)
                cameraController.setEnabledFPV(true);

            tilesetLocationEditor.setVisible(false);
        });
    }

    function _updateGeoLocationWidget() {
        var tileset_model_matrix_data = EDD_CJS_PUBLIC_AJAX.tileset_model_matrix_data;

        if(tileset_model_matrix_data){
            $('#tileset_latitude').val(tileset_model_matrix_data.latitude);
            $('#tileset_longitude').val(tileset_model_matrix_data.longitude);
            $('#tileset_altitude').val(tileset_model_matrix_data.altitude);
            $('#tileset_heading').val(tileset_model_matrix_data.heading);

            $('#tileset_latitude_label').html(tileset_model_matrix_data.latitude);
            $('#tileset_longitude_label').html(tileset_model_matrix_data.longitude);
            $('#tileset_altitude_label').html(tileset_model_matrix_data.altitude.toFixed(3) );
        }
        else{
            $('#tileset_latitude').val(0);
            $('#tileset_longitude').val(0);
            $('#tileset_altitude').val(0);
            $('#tileset_heading').val(0);

            $('#tileset_latitude_label').html(0);
            $('#tileset_longitude_label').html(0);
            $('#tileset_altitude_label').html(0);
        }
    }

    function start() {
        $('#exitFPVModeButton').hide();

        $('#capture_thumbnail').click(function () {
           captureThumbnail();
        });

        $('#save_current_view').click(function () {
           saveCurrentView();
        });

        $('#reset_camera_view').click(function () {
            resetCameraView();
        });

        $('#set_tileset_model_matrix_json').click(function () {
            setTilesetModelMatrixJson();
        });

        _initGeoLocationWidget();
        _updateGeoLocationWidget();
        create3DMap();
        applyCesiumCssStyle();
    }

    function create3DMap() {
        viewer = new Cesium.Viewer('cesiumContainer', {
            animation: false,
            homeButton: false, //  the HomeButton widget will not be created.
            baseLayerPicker: false, // If set to false, the BaseLayerPicker widget will not be created.
            geocoder: false,
            sceneModePicker: false,
            timeline: false,
            fullscreenElement: "cesiumContainer",
	    requestRenderMode : true
        });

        //var terrainDisable = EDD_CJS_PUBLIC_AJAX.download_asset_id.length && EDD_CJS_PUBLIC_AJAX.download_asset_id == "32717";

        var terrainDisable = true;

        if(!terrainDisable)
            viewer.terrainProvider = Cesium.createWorldTerrain();

        /* Switch mouse buttons in Cesium viewer:
            - Left button to rotate
            - Right button to pan
            - Wheel to zoom
            - Middle button to zoom
        */

        viewer.scene.screenSpaceCameraController.rotateEventTypes = Cesium.CameraEventType.RIGHT_DRAG;
        viewer.scene.screenSpaceCameraController.zoomEventTypes = [Cesium.CameraEventType.MIDDLE_DRAG, Cesium.CameraEventType.WHEEL, Cesium.CameraEventType.PINCH];

        viewer.scene.screenSpaceCameraController.tiltEventTypes = [Cesium.CameraEventType.LEFT_DRAG, Cesium.CameraEventType.PINCH, {
                eventType : Cesium.CameraEventType.LEFT_DRAG,
                modifier : Cesium.KeyboardEventModifier.CTRL
            }, {
                eventType : Cesium.CameraEventType.RIGHT_DRAG,
                modifier : Cesium.KeyboardEventModifier.CTRL
            }];

        // hide Cesium credit display
        viewer.bottomContainer.style.visibility ="hidden";

        // Change the text in the Help menu

        $(".cesium-navigation-help-pan").text("Rotate view");
        $(".cesium-navigation-help-zoom").text("Pan view");
        $(".cesium-navigation-help-rotate").text("Zoom view");

        var navigationHelpDetailsElements = $(".cesium-navigation-help-details");

        for(var i = 0; i < navigationHelpDetailsElements.length; i++) {
            var element = navigationHelpDetailsElements[i];

            if(element.textContent === "Right click + drag, or") {
                element.textContent = "Right click + drag";
            }

            if(element.textContent === "Mouse wheel scroll") {
                element.textContent = "";
            }

            if(element.textContent === "Middle click + drag, or") {
                element.textContent = "Scroll mouse wheel";
            }

            if(element.textContent === "CTRL + Left/Right click + drag") {
                element.textContent = "Middle click + drag";
            }
        }

        if( EDD_CJS_PUBLIC_AJAX.download_asset_url.length ){
            var cesiumTilesetURL = EDD_CJS_PUBLIC_AJAX.download_asset_url;

            tilesets = viewer.scene.primitives.add(
                new Cesium.Cesium3DTileset({
                    url: cesiumTilesetURL,
                    immediatelyLoadDesiredLevelOfDetail : true,
                    skipLevelOfDetail : true,
                    loadSiblings : true
                })
            );
        } else if( EDD_CJS_PUBLIC_AJAX.download_asset_id.length ){
            Cesium.Ion.defaultAccessToken = EDD_CJS_PUBLIC_AJAX.cesium_token;

            tilesets = viewer.scene.primitives.add(
                new Cesium.Cesium3DTileset({
                    url: Cesium.IonResource.fromAssetId(EDD_CJS_PUBLIC_AJAX.download_asset_id),
                    immediatelyLoadDesiredLevelOfDetail : true,
                    skipLevelOfDetail : true,
                    loadSiblings : true
                })
            );
        } else {
            Cesium.Ion.defaultAccessToken = EDD_CJS_PUBLIC_AJAX.cesium_token;

            var tilesetURLInOtherServer = "http://assets01.construkted.com/3DTileServer/index.php/asset/" +  EDD_CJS_PUBLIC_AJAX.post_slug + "/tileset.json";

            tilesets = viewer.scene.primitives.add(
                new Cesium.Cesium3DTileset({
                    url: tilesetURLInOtherServer,
                    immediatelyLoadDesiredLevelOfDetail : true,
                    skipLevelOfDetail : true,
                    loadSiblings : true
                })
            );
        }

        if(tilesets == null)
            return;

// Model level of detail 
        tilesets.maximumScreenSpaceError = 16.0; // Default is 16
        
        tilesets.maximumMemoryUsage = 512; // Default is 512
        
// Point cloud point size
        tilesets.pointCloudShading.attenuation = true;
        tilesets.pointCloudShading.maximumAttenuation = 5;
        

        tilesets.readyPromise.then(function(){
            var options = {
                exitFPVModeButtonId: "exitFPVModeButton",
                cesiumViewer: viewer,
                objectsToExcludeForCameraControl: [],
                showCameraBreakPoint: true,
                showCameraPath: false
            };

            options.objectsToExcludeForCameraControl.push(tilesets);
            options.main3dTileset = tilesets;

            cameraController = new EDD_CJS.CameraController(options);

            //required since the models may not be geographically referenced.

            if(tilesets.asset.extras != null) {
                if (tilesets.asset.extras.ion.georeferenced !== true) {
                    if (EDD_CJS_PUBLIC_AJAX.tileset_model_matrix_data) {
                        var heading = EDD_CJS_PUBLIC_AJAX.tileset_model_matrix_data.heading;

                        var latitude = EDD_CJS_PUBLIC_AJAX.tileset_model_matrix_data.latitude;
                        var longitude = EDD_CJS_PUBLIC_AJAX.tileset_model_matrix_data.longitude;
                        var altitude = EDD_CJS_PUBLIC_AJAX.tileset_model_matrix_data.altitude;

                        setTilesetModelMatrixData(tilesets, latitude, longitude, altitude, heading);

                        if(EDD_CJS_PUBLIC_AJAX.is_owner) {
                            tilesetLocationEditor = new EDD_CJS.Cesium3dTilesetLocationEditor(viewer, tilesets);

                            tilesetLocationEditor.setVisible(false);
                        }

                    } else {
                        tilesets.modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(Cesium.Cartesian3.fromDegrees(0, 0));
                    }
                }
            }

            if(EDD_CJS_PUBLIC_AJAX.is_owner) {
                tilesetLocationEditor = new EDD_CJS.Cesium3dTilesetLocationEditor(viewer, tilesets);

                tilesetLocationEditor.setVisible(false);
            }

            cameraController.setDefaultView();
        }).otherwise(function(error){
            window.alert(error);
        });
    }

    function setTilesetModelMatrixData(tileset, latitude, longitude, altitude, heading) {
        heading = Cesium.Math.toRadians(heading);

        var pitch = 0;
        var roll = 0;
        var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);

        var center = Cesium.Cartesian3.fromDegrees(longitude, latitude, altitude);

        tilesets.modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(center, hpr);
    }

    function captureThumbnail() {
        viewer.render();

        var mediumQuality  = viewer.canvas.toDataURL('image/jpeg', 0.5);

        $.ajax({
    		url : EDD_CJS_PUBLIC_AJAX.ajaxurl,
    		type : 'post',
    		data : {
    			action : 'post_set_thumbnail',
    			post_id : EDD_CJS_PUBLIC_AJAX.post_id,
    			capturedJpegImage: mediumQuality
    		},
    		success : function( response ) {
    			alert(response);
    		},
    		error: function() {
    		    alert("error");
    		}
	    });
    }

    function saveCurrentView() {
        $.ajax({
    		url : EDD_CJS_PUBLIC_AJAX.ajaxurl,
    		type : 'post',
    		data : {
    			action : 'post_set_current_view',
    			post_id : EDD_CJS_PUBLIC_AJAX.post_id,
    			view_data: cameraController.getViewData()
    		},
    		success : function( response ) {
    			alert(response);
    		},
    		error: function(xhr, status, error) {
    		    alert("error");
    		}
        });
    }

    function resetCameraView() {
         $.ajax({
    		url : EDD_CJS_PUBLIC_AJAX.ajaxurl,
    		type : 'post',
    		data : {
    			action : 'post_reset_current_view',
    			post_id : EDD_CJS_PUBLIC_AJAX.post_id
    		},
    		success : function( response ) {
    			alert(response);
    		},
    		error: function(xhr, status, error) {
    		    alert("error");
    		}
        });
    }

    function setTilesetModelMatrixJson() {
        var latitude = $('#tileset_latitude').val();
        var longitude = $('#tileset_longitude').val();
        var altitude = $('#tileset_altitude').val();
        var heading = $('#tileset_heading').val();

        latitude = parseFloat(latitude);
        longitude = parseFloat(longitude);
        altitude = parseFloat(altitude);
        heading = parseFloat(heading);

        if(isNaN(latitude) || latitude < -90 || latitude > 90){
            $('#tileset_latitude').val("");
            alert("invalid latitude!");
            return;
        }

        if(isNaN(longitude) || longitude < -180 || longitude > 180){
            $('#tileset_longitude').val("");
            alert("invalid longitude!");
            return;
        }

        if(isNaN(altitude)){
            $('#tileset_altitude').val("");
            alert("invalid altitude!");
            return;
        }

        if(isNaN(heading)){
            $('#tileset_heading').val("");
            alert("invalid heading!");
            return;
        }

        var data = {
            latitude: latitude,
            longitude: longitude,
            altitude: altitude,
            heading: heading
        };

        $.ajax({
            url : EDD_CJS_PUBLIC_AJAX.ajaxurl,
            type : 'post',
            data : {
                action : 'set_tileset_model_matrix_json',
                post_id : EDD_CJS_PUBLIC_AJAX.post_id,
                tileset_model_matrix_json: JSON.stringify(data)
            },
            success : function( response ) {
                // I am not sure why?
                var json_string = response.substring(0, response.length - 1);

                var data = JSON.parse(json_string);

                if(data.ret === false) {
                    alert("Passed values is the same as the values that is already in the database!");
                    return;
                }

                alert("Successfully updated!");
                setTilesetModelMatrixData(tilesets, latitude, longitude, altitude, heading);
                viewer.zoomTo(tilesets);
            },
            error: function(xhr, status, error) {
                alert("error");
            }
        });
    }

    return {
        viewer: viewer,
        cameraController: cameraController,
        start: start
    }
})();

jQuery(document).ready(function(){
    console.log(EDD_CJS_PUBLIC_AJAX);

    $.ajax({
    		url : EDD_CJS_PUBLIC_AJAX.ajaxurl,
    		type : 'post',
    		data : {
    			action : 'get_post_data',
    			post_id : EDD_CJS_PUBLIC_AJAX.post_id
    		},
    		success : function( response ) {
    		    // I am not sure why?
    		    var json_string = response.substring(0, response.length - 1);

    		    var data = JSON.parse(json_string);

    		    EDD_CJS_PUBLIC_AJAX.download_asset_url = data.download_asset_url;
    		    EDD_CJS_PUBLIC_AJAX.download_asset_id = data.download_asset_id;
    		    EDD_CJS_PUBLIC_AJAX.cesium_token = data.cesium_token;
    		    EDD_CJS_PUBLIC_AJAX.view_data = data.view_data;
                EDD_CJS_PUBLIC_AJAX.post_slug = data.post_slug;

    		    var tileset_model_matrix_data = null;

    		    try {
                    tileset_model_matrix_data = JSON.parse(data.tileset_model_matrix_json);
                }
                catch (e) {

                }

                EDD_CJS_PUBLIC_AJAX.tileset_model_matrix_data = tileset_model_matrix_data;
                EDD_CJS_PUBLIC_AJAX.is_owner = data.is_owner;

    			theApp.start();
    		},
    		error: function(xhr, status, error) {
    		    alert("Failed to get data for given asset!");
    		}
        });
});
