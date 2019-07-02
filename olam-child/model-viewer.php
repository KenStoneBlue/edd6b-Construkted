<?php /* Template Name: ModelViewer */ ?>

<head>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
    <script src="https://cesiumjs.org/releases/1.57/Build/Cesium/Cesium.js"></script>
    <style>
      html, body, #cesiumContainer {
          width: 100%; height: 100%; margin: 0; padding: 0; overflow: hidden;
      }
    </style>
    
    <script src="https://edd6.construkted.com/static/cesium-viewer.js"></script>
    <link rel="stylesheet" href="https://cesiumjs.org/releases/1.57/Build/Cesium/Widgets/widgets.css">
</head>    

<div id="cesiumContainer" style="width:100%; height:100%px">
</div>
<div id="toolbar" style ="display: block; position: absolute; left:5px; top: 5px">
    <button id="exitFPVModeButton" class="cesium-button" style="display:none">EXIT FPV MODE</button>
</div>

<?php
    $post_name = $_GET['assetid'];
   
    $sql = "SELECT ID FROM `wpaz_posts` WHERE `post_name`='" . $post_name . "' AND `post_type`='download'";
  
    global $wpdb;
    
    $post_ids = $wpdb->get_results($sql);
    
    if(count($post_ids) == 0){
       
    }
      
    $record = $post_ids[0];
      
    $post_id = $record->ID;
      
    $download_asset_id = get_post_meta( $post_id, 'download_asset_id', true );
    $download_asset_url = get_post_meta( $post_id, 'download_asset_url', true );
    
    $edd_cjs_options = get_option( 'edd_cjs_options' );
    $cesium_token = $edd_cjs_options['edd_cjs_cesiumjs_token_key'];
?>

<script>
var EDD_CJS_PUBLIC_AJAX = {};

EDD_CJS_PUBLIC_AJAX.cesium_token = "<?php echo $cesium_token; ?>";
EDD_CJS_PUBLIC_AJAX.download_asset_id = "<?php  echo $download_asset_id; ?>";
EDD_CJS_PUBLIC_AJAX.download_asset_url = "<?php echo $download_asset_url;?>";

</script>








