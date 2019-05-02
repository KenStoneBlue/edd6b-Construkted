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
			echo "<h2>" . __('Subscription Plans Settings', 'edd_cjs') . "</h2>";
		?>	
					
		<!-- beginning of the plugin options form -->
		<form  method="post" action="options.php" enctype="multipart/form-data">		
		
			<?php
				settings_fields( 'media' );
				$eddcjs_rcp_level_size = get_option( 'eddcjs_rcp_level_size' );
			?>
		<!-- beginning of the settings meta box -->	
			<div id="edd-cjs-settings" class="post-box-container">
			
				<div class="metabox-holder">	
			
					<div class="meta-box-sortables ui-sortable">
			
						<div id="settings" class="postbox">	
			
							<div class="handlediv" title="<?php echo __( 'Click to toggle', 'edd_cjs' ) ?>"><br /></div>
			
								<!-- settings box title -->					
								<h3 class="hndle">					
									<span style="vertical-align: top;"><?php echo __( 'Subscription Plans Settings', 'edd_cjs' ) ?></span>					
								</h3>
			
								<div class="inside">							

									<?PHP 
									if( class_exists( 'RCP_Levels' ) ) {
										$eddcjs_rcp_level_size = ( get_option( 'eddcjs_rcp_level_size' ) );
										$levels_db = new RCP_Levels();
										$rcp_levels = $levels_db->get_levels();
										if( !empty($rcp_levels) ){
											echo "<table>";
											echo "<tr>
											<th style='padding:10px 10px 10px 0;'>Subscription Plan</th>
											<th style='padding:10px 10px 10px 0;'>Allowed Space (MB)</th>
											<th style='padding:10px;'>Private/Public Access </th>
											<th style='padding:10px;'>Sellable Product Access</th>
											</tr>";
											echo "<tr><td colspan='2'>&nbsp;</td></tr>";
											foreach ($rcp_levels as $level_obj) {
												$level_size = (!empty($eddcjs_rcp_level_size[$level_obj->id])) ? $eddcjs_rcp_level_size[$level_obj->id] : '' ;
												$allowed_access = (!empty($eddcjs_rcp_level_size['allowed_access_'.$level_obj->id])) ? $eddcjs_rcp_level_size['allowed_access_'.$level_obj->id] : '' ;
												$sellable_access = (!empty($eddcjs_rcp_level_size['sellable_access_'.$level_obj->id])) ? $eddcjs_rcp_level_size['sellable_access_'.$level_obj->id] : '' ;
												
												echo "<tr><td><b>".$level_obj->name."</b></td>";
												echo "<td><input type='text' name='eddcjs_rcp_level_size[".$level_obj->id."]' value='".$level_size."' /></td>";
												echo "<td style='text-align:center;'><input type='checkbox' name='eddcjs_rcp_level_size[".'allowed_access_'.$level_obj->id."]' value='".$level_obj->id."' '".checked( $allowed_access, $level_obj->id, false )."'></td>";
												echo "<td style='text-align:center;'><input type='checkbox' name='eddcjs_rcp_level_size[".'sellable_access_'.$level_obj->id."]' value='".$level_obj->id."' '".checked( $sellable_access, $level_obj->id, false )."'></td></tr>";											
											}
											echo "<tr><td colspan='2'>&nbsp;</td></tr>";
											echo "<tr>
												<td colspan='2'>
													<input type='submit' class='button-primary wpd-ws-settings-save-plan' name='wpd_ws_settings_save-plan'  value='".__( 'Save Changes', 'edd_cjs' )."' />
												</td>
											</tr>";
											echo "</table>";
										}
									}
									?>


						
							</div><!-- .inside -->
				
						</div><!-- #settings -->
			
					</div><!-- .meta-box-sortables ui-sortable -->
			
				</div><!-- .metabox-holder -->
			
			</div><!-- #wps-settings-general -->
			
		<!-- end of the settings meta box -->		

		</form><!-- end of the plugin options form -->
	
	</div><!-- .end of wrap -->