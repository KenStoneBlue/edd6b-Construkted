<?php
// Exit if accessed directly
if ( !defined( 'ABSPATH' ) ) exit;

/**
 * Public Class
 *
 * Manage Public Class
 *
 * @package EDD CesiumJS Customize
 * @since 1.0.0
 */
/*this code for download single page in also like post list not a private Access*/

if(!class_exists('Layero_EDD_Related_Downloads')) {
	class Layero_EDD_Related_Downloads {

		private static $instance = null;

		public static function layero_rltd_dwn_get_instance() {
			if ( null == self::$instance ) {
				self::$instance = new self;
			}
			return self::$instance;
		}

		private function __construct() {
			add_action( 'edd_after_download_content', array( $this, 'layero_rltd_dwn_after_download_content' ), 120 );			
		}


		/**
		 * Adds related items on the single download page, underneath content
		 * @since 0.1
		 */


		function layero_rltd_dwn_after_download_content() {
			global $post, $data, $edd_options;
	// Compatibility fix for EDD Hide Download: save the current download's post id, in order to exclude it later
			$exclude_post_id = $post->ID;
			$taxchoice = isset( $edd_options['related_filter_by_cat'] ) ? 'download_category' : 'download_tag';
			$custom_taxterms = wp_get_object_terms( $post->ID, $taxchoice, array('fields' => 'ids') );

			$howmany = ( 
				isset( $edd_options['related_showposts_num'] ) && 
				! empty( $edd_options['related_showposts_num'] )
			)
			? $edd_options['related_showposts_num'] : 3;

			$related_dl_title = (
				isset( $edd_options['related_dl_title'] ) && 
				( '' != $edd_options['related_dl_title'] )
			)
			? $edd_options['related_dl_title'] : esc_html__('You May Also Like', 'layero-edd-related-downloads');					

			$loop_orderby = isset( $edd_options['related_dl_orderby'] ) ? $edd_options['related_dl_orderby'] : 'date';
			$loop_order = isset( $edd_options['related_dl_order'] ) ? $edd_options['related_dl_order'] : 'DESC';


			/* this code use for meta value are private than Also like in not post dispaly*/
			global $wpdb;
			$download_access_metas = $wpdb->get_results("SELECT * FROM `".$wpdb->postmeta."` WHERE meta_key='download_access' AND meta_value = 'Private'");


			if(!empty($download_access_metas)){
				foreach ($download_access_metas as $key => $download_access_meta) {
					$values[] = $download_access_meta->post_id;
				}
			}
			/* END */

			if ( ! empty($custom_taxterms) ) {
				$args = array(
					'post_type' => 'download',
					'post__not_in' => $values,
					'showposts' => $howmany,
					'tax_query' => array(
						array(
							'taxonomy' => $taxchoice,
							'field' => 'id',
							'terms' => $custom_taxterms
						)
					),
					'orderby' => $loop_orderby,
					'order' => $loop_order
				);

				$eddrd_query = new WP_Query($args);
				$go = isset( $edd_options['disable_related_in_content'] ) ? '' : 'go';

				if( $eddrd_query->have_posts() && $go  ) { ?>
					<div id="layero-related-downloads">
						<h3><?php echo $related_dl_title; ?></h3>
						<div id="edd-related-items-wrapper" class="edd-rp-single">
						<?php $countRow = 1; // Editted: for creating 3 item rows
						while ($eddrd_query->have_posts()) {
							$eddrd_query->the_post();
							if ($post->ID == $exclude_post_id) continue;

								if ($countRow%3 == 1) { // Editted: for creating 3 item rows
									echo "<div class='row'>";
								}	?>
								<div class="col-md-4">
									<div class="edd_download_inner">
										<div class="thumb">
											<?php
											$thumbID=get_post_thumbnail_id(get_the_ID());
											$featImage=wp_get_attachment_image_src($thumbID,'olam-product-thumb');
											$featImage=$featImage[0]; 
											$alt = get_post_meta($thumbID, '_wp_attachment_image_alt', true);

											$square_img = get_post_meta(get_the_ID(),"download_item_square_img");

											// feat vid code start
											$videoCode=get_post_meta(get_the_ID(),"download_item_video_id"); 
											$audioCode=get_post_meta(get_the_ID(),"download_item_audio_id");		
											$itemSet=null;		
											$featFlag=null;	
											$videoFlag=null;				
											if(isset($videoCode[0]) && (strlen($videoCode[0])>0) ){
												$itemSet=1;	
												$videoUrl=$videoCode[0];
													//$videoUrl=wp_get_attachment_url($videoCode[0]); 

												$videoFlag=1;

												if (strpos($videoUrl, 'vimeo') !== false) {
													echo '<div class="media-thumb vimeovid">'.do_shortcode("[video src='".esc_url($videoUrl)."' muted='1']").'</div>';
												} else {
													echo '<div class="media-thumb othervid">'.do_shortcode("[video src='".esc_url($videoUrl)."']").'</div>';
												}

											}
											else if (!empty($square_img) && strlen($square_img[0])>0) {
												$featFlag=1; ?>
												<a href="<?php the_permalink(); ?>">
													<span><i class="demo-icons icon-link"></i></span>
													<img src="<?php echo esc_url($square_img[0]); ?>" />
													</a> <?php
												}
												else if((isset($featImage))&&(strlen($featImage)>0)){
													$featFlag=1;
													$alt = get_post_meta($thumbID, '_wp_attachment_image_alt', true); ?>
													<a href="<?php the_permalink(); ?>">
														<span><i class="demo-icons icon-link"></i></span>
														<img src="<?php echo esc_url($featImage); ?>" alt="<?php echo esc_attr($alt); ?>">
														</a><?php
													}
													if(!isset($videoFlag)){ 
														if(isset($audioCode[0]) && (strlen($audioCode[0])>0) ){
															$itemSet=1;
															$audioUrl=wp_get_attachment_url($audioCode[0]);
															?>
															<div class="media-thumb">
																<?php echo do_shortcode("[audio src='".$audioUrl."']"); ?>
																</div> <?php
															}

														} ?>
														<?php if(!(isset($featFlag))){ ?>
															<a href="<?php the_permalink(); ?>">
																<span><i class="demo-icons icon-link"></i></span>
																<img src="<?php echo get_template_directory_uri(); ?>/img/preview-image-default.jpg" alt="<?php echo esc_attr($alt); ?>">
															</a>
														<?php } ?>

													</div>

													<?php if ( ! isset( $edd_options['related_dl_only_image'] ) ) { ?>
														<div class="product-details">
															<div class="product-name"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></div>
															<div class="product-price"><?php edd_price(get_the_ID()); ?></div>
															<?php if ( has_excerpt() ) : // Only show custom excerpts not autoexcerpts ?>
																<p class="olam-custom-excerpt"><?php echo get_the_excerpt(); ?></p>
															<?php endif; ?>
															<div class="details-bottom">
																<div class="product-options">	
																	<a href="<?php the_permalink(); ?>" title="<?php esc_attr_e('View','olam'); ?> "><i class="demo-icons icon-search"></i></a>  
																	<?php if(!olam_check_if_added_to_cart(get_the_ID())){ 
																		$eddOptionAddtocart=edd_get_option( 'add_to_cart_text' );
																		$addCartText=(isset($eddOptionAddtocart) && $eddOptionAddtocart  != '') ?$eddOptionAddtocart:esc_html__("Add to cart","olam");
																		if(edd_has_variable_prices(get_the_ID())){														
																			$defaultPriceID=edd_get_default_variable_price( get_the_ID() );
																			$downloadArray=array('edd_action'=>'add_to_cart','download_id'=>get_the_ID(),'edd_options[price_id]'=>$defaultPriceID);
																		}
																		else{
																			$downloadArray=array('edd_action'=>'add_to_cart','download_id'=>get_the_ID());
																		}	
																		?>
																		<a href="<?php echo esc_url(add_query_arg($downloadArray,edd_get_checkout_uri())); ?>" title="<?php esc_attr_e('Buy Now','olam'); ?>"><i class="demo-icons icon-download"></i></a>
																		<a href="<?php echo esc_url(add_query_arg($downloadArray,olam_get_current_page_url())); ?>" title="<?php echo esc_html($addCartText); ?>"><i class="demo-icons icon-cart"></i></a>   
																	<?php } else { ?>
																		<a class="cart-added" href="<?php echo esc_url(edd_get_checkout_uri()); ?>" title="<?php esc_attr_e('Checkout','olam'); ?> "><i class="fa fa-check"></i></a>    
																	<?php } ?>
																</div>
																<?php $olamct=get_theme_mod('olam_show_cats');
																if(isset($olamct)&& $olamct==1 ){

																	$cat = wp_get_post_terms(get_the_ID(),'download_category');
																	$mlink = get_term_link($cat[0]->slug,'download_category');
																	?><div class="product-author"><a href="<?php echo $mlink; ?>"><?php echo($cat[0]->name); ?></a></div><?php
																}
																else{
																	?> <div class="product-author"><a href="<?php echo esc_url(add_query_arg( 'author_downloads', 'true', get_author_posts_url( get_the_author_meta('ID')) )); ?>"><?php esc_html_e("By","olam"); ?>: <?php the_author(); ?></a></div><?php
																}
																?>
															</div>
														</div>
													<?php } ?>

												</div>
											</div>

								<?php if ($countRow%3 == 0) { // Editted: for creating 3 item rows
									echo "</div>";
								}
								$countRow++; ?>
							<?php } ?>
						<?php if ($countRow%3 != 1) echo "</div>"; // Editted: for creating 3 item rows
					// This is to ensure there is no open div if the number of elements is not a multiple of 3 ?>
				</div>
			</div>
			<?php wp_reset_query();
		}
	}
}


}
}