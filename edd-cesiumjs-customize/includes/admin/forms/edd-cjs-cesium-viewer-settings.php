<?php
// Exit if accessed directly
if ( !defined( 'ABSPATH' ) ) exit;

/**
 * Setting Page
 *
 * Manage Setting Page
 *
 * @package EDD CesiumJS Customize
 * @since 1.0.0
 */

global $edd_cjs_model;

$model = $edd_cjs_model;
	

//check settings updated or not
/*if(isset($_GET['settings-updated']) && $_GET['settings-updated'] == 'true') {
	
	echo '<div class="updated" id="message">
		<p><strong>'. __("Changes Saved Successfully.",'edd_cjs') .'</strong></p>
	</div>';
}	*/
?>
	<!-- . begining of wrap -->
	<div class="wrap">
		<?php 
			//echo screen_icon('options-general');	
			echo "<h2>" . __('Cesium Viewer Settings', 'edd_cjs') . "</h2>";
		?>	
					
		<!-- beginning of the plugin options form -->
		<form  method="post" action="options.php" enctype="multipart/form-data">		
		
			<?php
				settings_fields( 'edd_cjs_constructed_options' );
				$edd_cjs_options = get_option( 'edd_cjs_options' );
			?>
		<!-- beginning of the settings meta box -->	
			<div id="edd-cjs-settings" class="post-box-container">
			
				<div class="metabox-holder">	
			
					<div class="meta-box-sortables ui-sortable">
			
						<div id="settings" class="postbox">	
			
							<div class="handlediv" title="<?php echo __( 'Click to toggle', 'edd_cjs' ) ?>"><br /></div>
			
								<!-- settings box title -->					
								<h3 class="hndle">					
									<span style="vertical-align: top;"><?php echo __( 'Cesium Viewer Settings', 'edd_cjs' ) ?></span>					
								</h3>
			
								<div class="inside">			

									<table class="form-table wpd-ws-settings-box"> 
										<tbody>															

											 <tr>
												<th scope="row">
													<label><strong><?php echo __( 'CesiumJS Token Key:', 'edd_cjs' ) ?></strong></label>
												</th>
												<td>
													<input type="text" id="edd-cjs-cesiumjs-token-key" name="edd_cjs_options[edd_cjs_cesiumjs_token_key]" value="<?php echo !empty($edd_cjs_options['edd_cjs_cesiumjs_token_key']) ? $edd_cjs_options['edd_cjs_cesiumjs_token_key'] : '' ?>" size="63" /><br />
													<span class="description"><?php echo __( 'Create your Token keys <a href="https://cesium.com/ion/tokens" target="_blank">here</a>.', 'edd_cjs' ) ?></span>
												</td>
											 </tr>											  
												
											<tr>
												<td colspan="2">
													<input type="submit" class="button-primary wpd-ws-settings-save" name="wpd_ws_settings_save" value="<?php echo __( 'Save Changes', 'edd_cjs' ) ?>" />
												</td>
											</tr>								
							
										</tbody>
									</table>
						
							</div><!-- .inside -->
				
						</div><!-- #settings -->
			
					</div><!-- .meta-box-sortables ui-sortable -->
			
				</div><!-- .metabox-holder -->
			
			</div><!-- #wps-settings-general -->
			
		<!-- end of the settings meta box -->		

		</form><!-- end of the plugin options form -->
	
	</div><!-- .end of wrap -->