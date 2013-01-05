<?php

// Do not delete these lines
	if (!empty($_SERVER['SCRIPT_FILENAME']) && 'comments.php' == basename($_SERVER['SCRIPT_FILENAME']))
		die ('Please do not load this page directly. Thanks!');

	if ( post_password_required() ) { ?>
		<p class="nocomments"><?php _e( 'This post is password protected. Enter the password to view any comments.', 'bm' ); ?></p>
	<?php
		return;
	}
?>

<!-- You can start editing here. -->
<div class="comments-box">

<?php if ( have_comments() ) : ?>

	<h2 id="comments" class="comment-green"><?php comments_number(__('No Comments', 'bm'), __('One Comment', 'bm'), __('% Comments', 'bm') );?>　· · · · · ·  	</h2>

	<ol class="commentlist">
	<?php wp_list_comments('type=comment&callback=mytheme_comment'); ?>
	</ol><div class="clear"></div>

	<div class="pagenavi"><?php paginate_comments_links('prev_text='.__('prev page','bm').'&next_text='.__('next page','bm'));?></div>

<?php else : // this is displayed if there are no comments so far ?>

	<?php if ('open' == $post->comment_status) : ?>
	<!-- If comments are open, but there are no comments. -->
	<?php else : // comments are closed ?>
	<!-- If comments are closed. -->
	<p class="nocomments"><?php print CLOSED_COMMENTS; ?>.</p>
	<?php endif; ?>

<?php endif; ?>
<!-- end comments display -->

<?php if ('open' == $post->comment_status) : ?>
<div id="respond">

<h2 class="comment-green">评论　· · · · · ·  	</h2>

<div class="cancel-comment-reply">
	<small><?php cancel_comment_reply_link('取消'); ?></small>
</div><!-- cancel-comment-reply -->

<?php if ( get_option('comment_registration') && !$user_ID ) : ?>
<p><?php print YOU_MUST_BE; ?> <a href="<?php echo get_option('siteurl'); ?>/wp-login.php?redirect_to=<?php echo urlencode(get_permalink()); ?>"><?php print LOGGED_IN; ?></a> <?php print TO_POST_COMMENT; ?>.</p>
<?php else : ?>

<form action="<?php echo get_option('siteurl'); ?>/wp-comments-post.php" method="post" id="commentform">

<?php if ( !$user_ID ) : ?>

<p><input class="text" type="text" name="author" id="author" value="<?php echo $comment_author; ?>" size="22" tabindex="1" <?php if ($req) echo "aria-required='true'"; ?> />
<label for="author"><small><?php _e('Name', 'bm') ?>(<?php if ($req) _e('required', 'bm'); ?>)</small></label></p>

<p><input class="text" type="text" name="email" id="email" value="<?php echo $comment_author_email; ?>" size="22" tabindex="2" <?php if ($req) echo "aria-required='true'"; ?> />
<label for="email"><small><?php _e('Mail', 'bm') ?> (<?php _e('wont publish', 'bm'); ?>) (<?php if ($req) _e('required', 'bm'); ?>)</small></label></p>

<p><input class="text" type="text" name="url" id="url" value="<?php echo $comment_author_url; ?>" size="22" tabindex="3" />
<label for="url"><small><?php _e('website', 'bm') ?></small></label></p>

<?php endif; ?>


<?php do_action('comment_form', $post->ID); ?>

<p><textarea name="comment" id="comment" rows="4" cols="54" class="resizable" tabindex="4"></textarea></p>

<p><input class="input_submit" name="submit" type="submit" id="submit" tabindex="5" value="<?php _e( 'submit comment', 'bm' ); ?>" />
<?php comment_id_fields(); ?>
</p>

</form>

<?php endif; // If registration required and not logged in ?>
</div>
<?php endif; // if you delete this the sky will fall on your head ?>
</div>