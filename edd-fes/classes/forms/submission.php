<?php
/**
 * FES Submission Form
 *
 * @package    FES
 * @subpackage Classes/Forms
 * @copyright  Copyright (c) 2017, Easy Digital Downloads, LLC
 * @license    http://opensource.org/licenses/gpl-2.0.php GNU Public License
 */

// Exit if accessed directly
if ( ! defined( 'ABSPATH' ) ) exit;

/**
 * FES_Submission_Form Class.
 *
 * @see FES_Form
 */
class FES_Submission_Form extends FES_Form {
	/**
	 * Form ID.
	 * @var string
	 */
	public $id = null;

	/**
	 * Version of form
	 * @var string
	 */
	public $version = '1.0.0';

	/**
	 * Form's fields.
	 * @var array
	 */
	public $fields = array();

	/**
	 * The form's name (registration, contact etc).
	 * @var string
	 */
	public $name = 'submission';

	/**
	 * Title of the form.
	 * @var string
	 */
	public $title = 'Submission';

	/**
	 * The ID of the object the form value is saved to.
	 * For a submission form, the $save_id is the post's ID, etc.
	 * @var int
	 */
	public $save_id = null;

	/**
	 * Type of form: 'user', 'post', 'custom'. Dictates where the fields save their values.
	 * @var string
	 */
	public $type = 'post';

	/**
	 * Whether or not entire form is read-only.
	 * @var bool
	 */
	public $readonly = false;

	/**
	 * What the form supports.
	 * @var array
	 */
	public $supports = array(
		'formbuilder' => array(
			'fields' => array(
				'public' => true,
			),
			'settings' => array( ),
			'notifications' => array(
				'supports' => array(
					'sms'   => true,
					'email' => true,
				),
				'actions'  => array( ),
			)
		),
		'multiple' => false,
	);

	/**
	 * Characteristics of the form that need to be stored in the database.
	 * @var array
	 */
	public $characteristics = array();

	/**
	 * Notifications for the form.
	 * @var array
	 */
	public $notifications = array();

	/**
	 * Set up the hooks.
	 *
	 * @access public
	 */
	public function extending_constructor() {
		add_action( 'fes_render_form_above_' . $this->name() . '_form', array( $this, 'set_session' ), 10, 2 );

		add_filter( 'fes_templates_to_exclude_render_' . $this->name() . '_form_admin', array( $this, 'fes_templates_to_exclude' ) );
		add_filter( 'fes_templates_to_exclude_save_' . $this->name() . '_form_admin', array( $this, 'fes_templates_to_exclude' ) );
		add_filter( 'fes_templates_to_exclude_validate_' . $this->name() . '_form_admin', array( $this, 'fes_templates_to_exclude' ) );
		add_filter( 'fes_render_' . $this->name() . '_form_admin_form', '__return_false' );
		add_filter( 'fes_render_' . $this->name() . '_form_show_args_admin', '__return_false' );
		add_filter( 'fes_render_' . $this->name() . '_form_args_frontend', array( $this, 'set_post_id' ), 10, 4 );
	}

	/**
	 * Set the localized title for the form.
	 *
	 * @access public
	 */
	public function set_title() {
		$title = _x( 'Submission', 'FES Form title translation', 'edd_fes' );
		$this->title = apply_filters( 'fes_' . $this->name() . '_form_title', $title );
	}

	/**
	 * Render the legend for the form.
	 *
	 * @access public
	 *
	 * @return string Rendered legend.
	 */
	public function legend() {
		$post_id = isset( $_REQUEST['post_id'] ) && absint( $_REQUEST['post_id'] )  ? absint( $_REQUEST['post_id'] ) : -2;

		if ( $post_id && $post_id !== -2 ) {
			$legend = sprintf( __( 'Edit %s: #%d', 'edd_fes' ), EDD_FES()->helper->get_product_constant_name( false, true ), $post_id );
		} else {
			$legend = sprintf( __( 'Create New %s', 'edd_fes' ), EDD_FES()->helper->get_product_constant_name( false, true ) );
		}

		/**
		 * Filter the form legend.
		 *
		 * @param string                    Legend tag.
		 * @param FES_Submission_Form $this Instance of the class.
		 */
		return apply_filters( 'fes_submission_form_legend', '<legend class="fes-form-legend" id="fes-submission-form-title">' . $legend . '</legend>', $this );
	}

	/**
	 * Set the Post ID.
	 *
	 * @access public
	 *
	 * @param array $args       Form arguments.
	 * @param       $formobject Instance of form object.
	 * @param int   $user_id    User ID.
	 * @param bool  $readonly   Whether the form is read-only or not.
	 * @return array $args Updated args.
	 */
	public function set_post_id( $args, $formobject, $user_id, $readonly ){
		if ( ! isset( $args['post_id'] ) ) {
			$args['post_id'] = isset( $_REQUEST['post_id'] ) && absint( $_REQUEST['post_id'] )  ? absint( $_REQUEST['post_id'] ) : -2;
		}
		return $args;
	}

	/**
	 * Exclude certain templates.
	 *
	 * @access public
	 *
	 * @param array $templates
	 * @return array $templates
	 */
	public function fes_templates_to_exclude( $templates ) {
		array_push( $templates, 'download_format' );
		array_push( $templates, 'download_category' );
		array_push( $templates, 'download_tag' );
		array_push( $templates, 'featured_image' );
		array_push( $templates, 'post_title' );
		array_push( $templates, 'post_excerpt' );
		array_push( $templates, 'post_content' );
		array_push( $templates, 'multiple_pricing' );

		return $templates;
	}

	/**
	 * Set the session variables.
	 *
	 * @access public
	 *
	 * @param int  $save_id  Save ID.
	 * @param bool $readonly Whether the form is read-only or not.
	 */
	public function set_session( $save_id, $readonly ){
		if ( empty( $save_id ) || $save_id < 0 ) {
			EDD()->session->set( 'fes_is_new', true );
		}

		EDD()->session->set( 'edd_fes_post_id', $save_id );
	}

	/**
	 * Execute before the form is saved.
	 *
	 * @param array $output  Output variables.
	 * @param int   $save_id Save ID.
	 * @param array $values  Form values.
	 * @param int   $user_id User ID.
	 * @return array $output Updated output.
	 */
	public function before_form_save( $output = array(), $save_id = -2, $values = array(), $user_id = -2 ) {

		$new     = true;
		$pending = false;
		$status  = 'publish';

		if ( $save_id > 0 ) {
			$new = false;
		}

		if ( ! empty( $_REQUEST['draft' ] ) ) {

			$status  = 'draft';
			$pending = false;

		} elseif ( $new ) {

			if ( ! (bool) EDD_FES()->helper->get_option( 'fes-auto-approve-submissions', false ) ) {
				$status = 'pending';
				$pending = true;
				// new is true
			}

		} else {

			$current_status = get_post_status( $save_id );

			if ( 'publish' !== $current_status ) {

				if( ! (bool) EDD_FES()->helper->get_option( 'fes-auto-approve-submissions', false ) ) {

					$pending = true;
					$status  = 'pending';

				}

			} else {

				if ( ! (bool) EDD_FES()->helper->get_option( 'fes-auto-approve-edits', false ) ) {

					$status = 'pending';
					$pending = true;

				} else {

					$status = 'publish';
					$pending = false;

				}

			}

		}

		/**
		 * If the vendor has automatic approval enabled, override the $status and $pending variables.
		 */
		$vendor = new FES_Vendor( $user_id, true );
		if ( $vendor->automatic_approval ) {
			$status = 'publish';
			$pending = false;
		}

		if ( ! fes_is_admin() ) {
			$save_id = $this->create_or_update_object( $this->type, $values, $user_id, $status, $new );
		}

		EDD()->session->set( 'fes_is_new', $new );
		EDD()->session->set( 'fes_is_pending', $pending );

		do_action( 'fes_before_' . $this->name() . '_form_save_action', $output, $save_id, $values, $user_id );

		return apply_filters( 'fes_before_' . $this->name() . '_form_save', $output, $save_id, $values, $user_id );
	}

	/**
	 * Execute after the save button has been triggered from the frontend.
	 *
	 * @access public
	 *
	 * @param array $output  Form output.
	 * @param int   $save_id Save ID.
	 * @param array $values  Form values.
	 * @param int   $user_id User ID.
	 * @return array $output Updated output.
	 */
	public function after_form_save_frontend( $output = array(), $save_id = -2, $values = array(), $user_id = -2 ) {
		$new = EDD()->session->get( 'fes_is_new' );

		if ( EDD_FES()->integrations->is_commissions_active() && $new ) {
			$commission = array(
				'user_id' => get_current_user_id()
			);

			update_post_meta( $save_id, '_edd_commission_settings', $commission );
			update_post_meta( $save_id, '_edd_commisions_enabled', '1' );
		}

		do_action( 'fes_submit_submission_form_bottom', $save_id );

		$redirect_to = get_permalink( EDD_FES()->helper->get_option( 'fes-vendor-dashboard-page', false ) );

		if ( EDD_FES()->vendors->vendor_can_edit_product( $save_id ) ) {
			$redirect_to = add_query_arg( array(
				'task'    => 'edit-product',
				'post_id' => $save_id
			), $redirect_to );
		} else {
			$redirect_to = add_query_arg( array( 'task' => 'dashboard' ), $redirect_to );
		}

		$output['success'] = true;

		if ( ! empty( $_REQUEST['draft'] ) ) {
			$output['title'] = __( 'Success', 'edd_fes' );
			$output['message'] = sprintf( _x( 'Draft %s saved successfully!', 'FES lowercase singular setting for download', 'edd_fes' ), EDD_FES()->helper->get_product_constant_name( $plural = false, $uppercase = false ) );
		} elseif ( $new ) {
			$output['title'] = __( 'Success', 'edd_fes' );
			$output['message'] = sprintf( _x( 'New %s submitted successfully!', 'FES lowercase singular setting for download', 'edd_fes' ), EDD_FES()->helper->get_product_constant_name( $plural = false, $uppercase = false ) );
		} else {
			$output['title'] = __( 'Success', 'edd_fes' );
			$output['message'] = sprintf( _x( '%s edited successfully!', 'FES uppercase singular setting for download', 'edd_fes' ), EDD_FES()->helper->get_product_constant_name( $plural = false, $uppercase = true ) );
		}

		$output['redirect_to'] = $redirect_to;

		if ( $new ) {
			$output['redirect_to'] = apply_filters( 'fes_submission_post_new_redirect', $output['redirect_to'], $save_id, $this->id );
		} else {
			$output['redirect_to'] = apply_filters( 'fes_submission_post_edit_redirect', $output['redirect_to'], $save_id, $this->id );
		}

		$output = apply_filters( 'fes_add_post_redirect', $output, $save_id, $this->id );

		EDD()->session->set( 'edd_fes_post_id', '' );

		do_action( 'fes_after_' . $this->name() . '_form_save_frontend_action', $output, $save_id, $values, $user_id );

		do_action( 'start_force_tiling', $save_id);

		return apply_filters( 'fes_after_' . $this->name() . '_form_save_frontend', $output, $save_id, $values, $user_id );
	}

	/**
	 * Create/update download object from the submission form.
	 *
	 * @access public
	 *
	 * @param int    $type    Submission type.
	 * @param array  $values  Form value.
	 * @param int    $user_id User ID.
	 * @param string $status  Post status.
	 * @param bool   $new     New/existing post.
	 * @return int Save ID.
	 */
	public function create_or_update_object( $type = -2, $values = array(), $user_id = -2, $status = 'pending', $new = true ) {
		if ( -2 === $type ) {
			$type = $this->type;
		}

		$post_author = get_current_user_id();

		$postarr = array(
			'post_type'    => 'download',
			'post_status'  => $status,
			'post_author'  => $post_author,
			'post_title'   => isset( $values[ 'post_title' ] ) ? sanitize_text_field( trim( $values[ 'post_title' ] ) ) : '',
			'post_content' => isset( $values[ 'post_content' ] ) ? wp_kses( $values[ 'post_content' ], fes_allowed_html_tags() ) : '',
			'post_excerpt' => isset( $values[ 'post_excerpt' ] ) ? wp_kses( $values[ 'post_excerpt' ], fes_allowed_html_tags() ) : ''
		);

		if ( isset( $values[ 'category' ] ) ) {
			$category                 = $values[ 'category' ];
			$postarr['post_category'] = is_array( $category ) ? $category : array(
				$category
			);
		}

		if ( isset( $values['tags'] ) ) {
			$postarr['tags_input'] = explode( ',', $values['tags'] );
		}

		$postarr = apply_filters( 'fes_add_post_args', $postarr, $this->id );
		$post_id = 0;

		if ( $new ) {
			$post_id = wp_insert_post( $postarr );
			$this->change_save_id( $post_id );
		} else {
			$postarr['ID'] = $this->save_id;
			wp_update_post( $postarr );
		}

		return $this->save_id;
	}

	/**
	 * Trigger notifications from the frontend.
	 *
	 * @access public
	 *
	 * @param array $output  Output.
	 * @param int   $save_id Save ID.
	 * @param array $values  Form values.
	 * @param int   $user_id User ID.
	 */
	public function trigger_notifications_frontend( $output = array(), $save_id = -2, $values = array(), $user_id = -2 ) {
		$new      = EDD()->session->get( 'fes_is_new' );
		$pending  = EDD()->session->get( 'fes_is_pending' );
		$post_id  = $this->save_id;

		$from_name  = edd_get_option( 'from_name', get_bloginfo( 'name' ) );
		$from_email = edd_get_option( 'from_email', get_option( 'admin_email' ) );
		$type       = 'post';
		$id         = $post_id;

		if ( $new ) {
			if ( $pending ) {
				// Send email to admin
				$emails     = new FES_Emails;
				$to         = apply_filters( 'fes_submission_form_pending_to_admin', edd_get_admin_notice_emails(), $post_id );
				$subject    = apply_filters( 'fes_submission_form_to_admin_subject', __( 'New Submission Received', 'edd_fes' ) );
				$message    = EDD_FES()->helper->get_option( 'fes-admin-new-submission-email', '' );
				$args       = array( 'permissions' => 'fes-admin-new-submission-email-toggle' );
				$emails->send_email( $to, $from_name, $from_email, $subject, $message, $type, $id, $args );

				// Send email to user
				$emails  = new FES_Emails;
				$user    = new WP_User( $user_id );
				$to      = $user->user_email;
				$message = EDD_FES()->helper->get_option( 'fes-vendor-new-submission-email', '' );
				$subject = apply_filters( 'fes_submission_new_form_to_vendor_subject', __( 'Submission Received', 'edd_fes' ) );
				$emails->send_email( $to, $from_name, $from_email, $subject, $message, $type, $id, $args );

				do_action( 'fes_submission_form_new_pending', $post_id );
			} else {
				do_action( 'fes_submission_form_new_published', $post_id );
			}
		} else {
			if ( $pending ) {
				// Send email to admin
				$to         = apply_filters( 'fes_submission_form_published_to_admin', edd_get_admin_notice_emails(), $post_id );
				$subject    = apply_filters( 'fes_submission_form_edit_to_admin_subject', __( 'New Submission Edit Received', 'edd_fes' ) );
				$message    = EDD_FES()->helper->get_option( 'fes-admin-new-submission-edit-email', '' );
				$args       = array( 'permissions' => 'fes-admin-new-submission-edit-email-toggle' );
				EDD_FES()->emails->send_email( $to, $from_name, $from_email, $subject, $message, $type, $id, $args );

				do_action( 'fes_submission_form_edit_pending', $post_id );
			} else {
				do_action( 'fes_submission_form_edit_published', $post_id );
			}
		}
	}

	/**
	 * Trigger notifications from the admin.
	 *
	 * @access public
	 *
	 * @param array $output  Output.
	 * @param int   $save_id Save ID.
	 * @param array $values  Form values.
	 * @param int   $user_id User ID.
	 */
	public function trigger_notifications_admin( $output = array(), $save_id = -2, $values = array(), $user_id = -2 ) {
		$new      = EDD()->session->get( 'fes_is_new' );
		$pending  = EDD()->session->get( 'fes_is_pending' );
		$post_id  = $this->save_id;

		$from_name  = edd_get_option( 'from_name', get_bloginfo( 'name' ) );
		$from_email = edd_get_option( 'from_email', get_option( 'admin_email' ) );
		$type       = 'post';
		$id         = $post_id;

		if ( $new ) {
			if ( $pending ) {
				// Send email to admin
				$emails     = new FES_Emails;
				$to         = apply_filters( 'fes_submission_form_pending_to_admin', edd_get_admin_notice_emails(), $post_id );
				$subject    = apply_filters( 'fes_submission_form_to_admin_subject', __( 'New Submission Received', 'edd_fes' ) );
				$message    = EDD_FES()->helper->get_option( 'fes-admin-new-submission-email', '' );
				$args       = array( 'permissions' => 'fes-admin-new-submission-email-toggle' );
				$emails->send_email( $to, $from_name, $from_email, $subject, $message, $type, $id, $args );

				// Send email to user
				$emails     = new FES_Emails;
				$user       = new WP_User( $user_id );
				$to         = $user->user_email;
				$subject    = apply_filters( 'fes_submission_new_form_to_vendor_subject', __( 'Submission Received', 'edd_fes' ) );
				$message    = EDD_FES()->helper->get_option( 'fes-vendor-new-submission-email', '' );
				$emails->send_email( $to, $from_name, $from_email, $subject, $message, $type, $id, $args );

				do_action( 'fes_submission_form_new_pending', $post_id );
			} else {
				do_action( 'fes_submission_form_new_published', $post_id );
			}
		} else {
			if ( $pending ) {
				// Send email to admin
				$to         = apply_filters( 'fes_submission_form_published_to_admin', edd_get_admin_notice_emails(), $post_id );
				$subject    = apply_filters( 'fes_submission_form_edit_to_admin_subject', __( 'New Submission Edit Received', 'edd_fes' ) );
				$message    = EDD_FES()->helper->get_option( 'fes-admin-new-submission-edit-email', '' );
				$args       = array( 'permissions' => 'fes-admin-new-submission-edit-email-toggle' );
				EDD_FES()->emails->send_email( $to, $from_name, $from_email, $subject, $message, $type, $id, $args );

				do_action( 'fes_submission_form_edit_pending', $post_id );
			} else {
				do_action( 'fes_submission_form_edit_published', $post_id );
			}
		}
	}

	/**
	 * Render submit button.
	 *
	 * @access public
	 * @since 2.5
	 *
	 * @param string  $label     Label.
	 * @param boolean $form      Is this the form?
	 * @param boolean $show_args Show arguments?
	 * @param array   $args      Button arguments.
	 * @return string $output
	 */
	public function submit_button( $label = '', $form = true, $show_args = true, $args = array() ) {
		$color = edd_get_option( 'checkout_color', 'blue' );
		$color = ( $color == 'inherit' ) ? '' : $color;
		$style = edd_get_option( 'button_style', 'button' );

		if ( ! $label ) {
			$label = _x( "Submit", "For the submission form",  "edd_fes" );
		}

		$default = $this->get_submit_button_defaults( $form, $args );

		$args = array_merge( $default, $args );

		$output = '<div class="fes-submit">';

		if ( $show_args && ! empty( $args ) ) {
			foreach ( $args as $name => $value ) {
				$output .= '<input type="hidden" name="' . $name . '" value="' . $value . '">';
			}
		}

		$referer = $form ? true : false;
		$output .= wp_nonce_field( 'fes-' . $this->name() .'-form', 'fes-' . $this->name() .'-form', $referer, false );

		if ( $form ) {
			$allow_draft =  ( ! empty( $_GET['task'] ) && 'new-product' === $_GET['task'] ) || ( ! empty( $_GET['post_id'] ) && 'draft' == get_post_status( absint( $_GET['post_id'] ) ) );
			$output .= $allow_draft ? '<input type="submit" id="fes-save-as-draft" class="edd-submit ' . $color . ' ' . $style . '" name="save-draft" value="' . esc_attr( __( 'Save Draft', 'edd_fes' ) ) . '" />' : '';
			$output .= '<input type="submit" id="fes-submit" class="edd-submit ' . $color . ' ' . $style . '" name="submit" value="' . $label . '" />';
		}

		$output .= '</div>';

		return $output;
	}

	/**
	 * Checks whether the form can be rendered.
	 *
	 * @access public
	 *
	 * @param bool $output   Whether or not to render a message or not.
	 * @param int  $is_admin Is admin?
	 * @param int  $user_id  User ID.
	 * @return bool|string False if $output is false, true if all conditionals skipped, string otherwise.
	 */
	public function can_render_form( $output = false, $is_admin = -2, $user_id = -2 ) {
		if ( -2 === $user_id ) {
			$user_id = get_current_user_id();
		}

		if ( -2 === $is_admin ) {
			$is_admin = fes_is_admin();
		}

		$is_a_vendor = EDD_FES()->vendors->user_is_vendor( $user_id );
		$is_a_admin  = EDD_FES()->vendors->user_is_admin( $user_id );

		if ( $is_admin ) {
			if ( $this->save_id ) {
				$post = get_post( $this->save_id );
				$post_author = $post->post_author;

				// If they are not admin, in the admin, or the author of the post
				if ( ! $is_a_admin && $post_author !== $user_id ) {
					return $output ? sprintf( _x( 'Access Denied: You are not an admin or the %s assigned to this %s', 'FES lowercase singular setting for vendor', 'edd_fes' ), EDD_FES()->helper->get_vendor_constant_name( $plural = false, $uppercase = false ), EDD_FES()->helper->get_product_constant_name( $plural = false, $uppercase = false ) ) : false;
				}
			} else if ( ! $is_a_admin && ! $is_a_vendor ) {
				return $output ? sprintf( _x( 'Access Denied: You are not an admin or a %s', 'fes setting for lowercase singular vendor', 'edd_fes' ), EDD_FES()->helper->get_vendor_constant_name( $plural = false, $uppercase = false ) ) : false;
			}
		} else {
			if ( ! $is_a_admin && ! $is_a_vendor ) {
				return $output ? sprintf( _x( 'Access Denied: You are not an admin or a %s', 'fes setting for lowercase singular vendor', 'edd_fes' ), EDD_FES()->helper->get_vendor_constant_name( $plural = false, $uppercase = false ) ) : false;
			}

			if ( $this->save_id > 0 && $this->save_id ) {
				if ( ! EDD_FES()->vendors->vendor_can_edit_product( $this->save_id ) ) {
					return $output ? sprintf( _x( 'Access Denied: You cannot edit this %s', 'FES lowercase singular setting for download', 'edd_fes' ), EDD_FES()->helper->get_product_constant_name( $plural = false, $uppercase = false ) ) : false;
				}
			} else {
				if ( ! EDD_FES()->vendors->vendor_can_create_product() ) {
					return $output ? sprintf( _x( 'Access Denied: You cannot create %s', 'FES lowercase plural setting for download', 'edd_fes' ), EDD_FES()->helper->get_product_constant_name( $plural = true, $uppercase = false ) ) : false;
				}
			}
		}

		return true;
	}

	/**
	 * Check whether the form can be saved or not.
	 *
	 * @access public
	 *
	 * @param bool $output   Should an output be generated?
	 * @param int  $is_admin Is admin?
	 * @param int  $user_id  User ID.
	 * @return bool|string False if $output is false, true if all conditionals skipped, string otherwise.
	 */
	public function can_save_form( $output = false, $is_admin = -2, $user_id = -2 ) {
		if ( -2 === $user_id ) {
			$user_id = get_current_user_id();
		}

		if ( -2 === $is_admin ) {
			$is_admin = fes_is_admin();
		}

		$is_a_vendor = EDD_FES()->vendors->user_is_vendor( $user_id );
		$is_a_admin  = EDD_FES()->vendors->user_is_admin( $user_id );

		if ( $is_admin ) {
			if ( $this->save_id ) {
				$post = get_post( $this->save_id );
				$post_author = $post->post_author;

				if ( ! $is_a_admin && $post_author !== $user_id ) {
					return $output ? sprintf( __( 'Access Denied: You are not an admin or the %s assigned to this %s', 'edd_fes' ), EDD_FES()->helper->get_vendor_constant_name( $plural = false, $uppercase = false ), EDD_FES()->helper->get_product_constant_name( $plural = false, $uppercase = false ) ) : false;
				}
			} else if ( ! $is_a_admin && ! $is_a_vendor ) {
				return $output ? sprintf( _x( 'Access Denied: You are not an admin or a %s', 'fes setting for lowercase singular vendor', 'edd_fes' ), EDD_FES()->helper->get_vendor_constant_name( $plural = false, $uppercase = false ) ) : false;
			}
		} else {
			if ( ! $is_a_admin && ! $is_a_vendor ) {
				return $output ? sprintf( _x( 'Access Denied: You are not an admin or a %s', 'fes setting for lowercase singular vendor', 'edd_fes' ), EDD_FES()->helper->get_vendor_constant_name( $plural = false, $uppercase = false ) ) : false;
			}

			if ( $this->save_id ) {
				if ( $this->save_id > 0 && ! EDD_FES()->vendors->vendor_can_edit_product( $this->save_id ) ) {
					return $output ? sprintf( _x( 'Access Denied: You cannot edit this %s', 'FES lowercase singular setting for download', 'edd_fes' ), EDD_FES()->helper->get_product_constant_name( $plural = false, $uppercase = false ) ) : false;
				}
			} else {
				if ( ! EDD_FES()->vendors->vendor_can_create_product() ) {
					return $output ? sprintf( _x( 'Access Denied: You cannot create %s', 'FES lowercase plural setting for download', 'edd_fes' ), EDD_FES()->helper->get_product_constant_name( $plural = true, $uppercase = false ) ) : false;
				}
			}
		}

		return true;
	}
}