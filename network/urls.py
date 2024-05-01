from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("users/<str:username>", views.users, name="users"),
    path("users/<str:username>/follower", views.follower, name="follower"),
    path("users/<str:username>/following", views.following, name="following"),
    path("status/<str:post_id>", views.status, name="status"),
    path("following", views.feed_following, name="feed_following"),

    # API calls
    path("posts", views.get_posts, name="get_posts"),
    path("post/<str:post_id>", views.alter_post, name="alter_post"),
    path("post", views.create_post, name="create_post"),
    path("like/<str:post_id>", views.like_post, name="like_post"),
    path("repost/<str:post_id>", views.share_post, name="share_post"),
    path("follow/<str:username>", views.follow_user, name="follow_user"),
    path("unfollow/<str:username>", views.unfollow_user, name="unfollow_user"),
    path("like_number/<str:post_id>", views.get_like_number, name="get_like_number"),
    path("message_number/<str:post_id>", views.get_message_number, name="get_message_number"),
    path("repost_number/<str:post_id>", views.get_repost_number, name="get_repost_number"),
    path("is_liked/<str:post_id>", views.check_is_liked, name="check_is_liked"),
    path("is_shared/<str:post_id>", views.check_is_shared, name="check_is_shared"),
    path("is_following/<str:username>", views.check_is_following, name="check_is_following"),
    path("is_original_poster/<str:post_id>", views.check_is_original_poster, name="check_is_original_poster"),
    path("followers/<str:username>", views.get_followers, name="get_follower"),
    path("followings/<str:username>", views.get_followings, name="get_following"),
    path("followers_count/<str:username>", views.get_followers_count, name="get_follower_count"),
    path("followings_count/<str:username>", views.get_followings_count, name="get_following_count"),
]
